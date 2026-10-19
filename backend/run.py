import uvicorn
<<<<<<< HEAD
from app.config import get_settings

=======

from app.config import get_settings


>>>>>>> 29066618049be865e9daa585fed068c149bc780f
if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run("app.main:app", host=settings.app_host, port=settings.app_port, reload=settings.app_env == "development")

