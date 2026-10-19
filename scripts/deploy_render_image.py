"""Deploy an exact image digest and wait for that revision, without logging hooks."""
import json
import os
import sys
import time
from urllib.error import URLError
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from urllib.request import Request, urlopen


def main() -> None:
    hook = os.environ.get("RENDER_DEPLOY_HOOK", "")
    if not hook:
        print("Image published. Render hook is not configured; deployment not requested.")
        return
    parts = urlsplit(hook)
    if parts.scheme != "https" or parts.hostname != "api.render.com" or not parts.path.startswith("/deploy/"):
        raise SystemExit("Invalid Render deploy hook; expected https://api.render.com/deploy/...")
    health_url = os.environ.get("RENDER_VERIFY_URL", "")
    target = urlsplit(health_url)
    if target.scheme != "https" or not target.hostname or target.username or target.password:
        raise SystemExit("Configure the public HTTPS verification URL before enabling deployment.")
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "imgURL"]
    query.append(("imgURL", os.environ["RENDER_IMAGE_DIGEST"]))
    url = urlunsplit(parts._replace(query=urlencode(query)))
    try:
        with urlopen(Request(url, method="POST"), timeout=30) as response:
            if response.status not in (200, 202):
                raise SystemExit("Render did not accept the deployment.")
    except URLError:
        # Never format the exception: it can contain the secret hook URL.
        raise SystemExit("Render rejected the deploy request. Check hook and registry credentials.") from None
    revision = os.environ["GITHUB_SHA"]
    deadline = time.monotonic() + 900
    while time.monotonic() < deadline:
        try:
            request = Request(health_url, headers={"Cache-Control": "no-cache"})
            with urlopen(request, timeout=20) as response:
                result = json.load(response)
            if result.get("revision") == revision:
                print(f"Render is serving revision {revision}.")
                return
        except (URLError, ValueError, TimeoutError):
            pass
        time.sleep(15)
    raise SystemExit("Render did not serve the new revision within 15 minutes. Check Render Events/Logs.")


if __name__ == "__main__":
    main()
