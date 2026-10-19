const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const React = require("react");
const { act, create } = require("react-test-renderer");
const ts = require("typescript");

global.IS_REACT_ACT_ENVIRONMENT = true;
const frontendRoot = path.resolve(__dirname, "../..");
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const emptyConnections = () => ({ incoming: [], sent: [], connected: [] });
const peer = { user_id: 2, display_name: "Lê Bình Backend", school: "Trường thật", major: "Ngành thật" };
const candidate = {
  request_id: 7, candidate_id: peer.user_id, display_name: peer.display_name,
  school: peer.school, major: peer.major, total_score: 73.125, rank: 1,
  component_scores: { skill_complementarity: 0.7, availability_overlap: 0.4 },
};
const invitation = {
  id: 12, requester_id: 2, recipient_id: 1, status: "PENDING", peer,
  created_at: "2026-10-03T01:00:00+00:00", responded_at: null,
};
const connected = {
  peer_match_id: 9, connection_request_id: 12, requester_id: 2, recipient_id: 1,
  connected_at: "2026-10-03T02:00:00+00:00", peer,
};

class TestWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 3;
  static sockets = [];
  constructor(url) { this.url = url; this.readyState = 0; this.sent = []; TestWebSocket.sockets.push(this); }
  close() { this.readyState = 3; }
  send(value) { this.sent.push(JSON.parse(value)); }
}

function deferred() {
  let resolve;
  const promise = new Promise((complete) => { resolve = complete; });
  return { promise, resolve };
}

function text(node) {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  return text(node.children);
}

function button(renderer, label) {
  const found = renderer.root.findAllByType("button").find((item) => text(item) === label);
  assert.ok(found, `Button not found: ${label}`);
  return found;
}

function loadFrontend(fetch, window = {}) {
  window.addEventListener ??= () => {};
  window.removeEventListener ??= () => {};
<<<<<<< HEAD
=======
  window.localStorage ??= {getItem: () => null, setItem() {}, removeItem() {}};
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    if (filename.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_target, key) => String(key) }) };
    const module = { exports: {} };
    cache.set(filename, module);
    const source = readFileSync(filename, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
    });
    vm.runInNewContext(outputText, {
<<<<<<< HEAD
      module, exports: module.exports, fetch, window, JSON, Error, TypeError, FormData, WebSocket: TestWebSocket, atob,
=======
      module, exports: module.exports, fetch, window, localStorage: window.localStorage, setInterval, clearInterval, JSON, Error, TypeError, FormData, WebSocket: TestWebSocket, atob,
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      process: { env: { NEXT_PUBLIC_API_URL: "http://backend.test" } },
      require(name) {
        if (name === "react") return React;
        if (name === "react/jsx-runtime") return require("react/jsx-runtime");
        const base = name.startsWith("@/") ? path.join(frontendRoot, name.slice(2)) : path.resolve(path.dirname(filename), name);
        const resolved = [base, `${base}.ts`, `${base}.tsx`].find((file) => existsSync(file));
        assert.ok(resolved, `Module not found: ${name}`);
        return load(resolved);
      },
    }, { filename });
    return module.exports;
  }
  return { load };
}

async function mount(component, props, fetch, window) {
  const runtime = loadFrontend(fetch, window);
<<<<<<< HEAD
  const filename = component === "Home" ? "app/page.tsx" : ["StudySessions", "InstructorModeration"].includes(component) ? `legacy/components/${component}.tsx` : `legacy/components/peer-connections/${component}.tsx`;
=======
  const filename = component === "Home" ? "app/page.tsx" : component === "StudySessions" ? "features/study-sessions/components/StudySessions.tsx" : component === "InstructorModeration" ? "features/moderation/components/InstructorModeration.tsx" : `features/peer-connections/components/${component}.tsx`;
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const exports = runtime.load(path.join(frontendRoot, filename));
  const Component = ["Home", "StudySessions", "InstructorModeration"].includes(component) ? exports.default : exports[component];
  function StudyHarness() {
    const [sessionId, setSessionId] = React.useState(props.sessionId ?? null);
    return React.createElement(Component, { ...props, sessionId, onSessionChange(id) { props.onSessionChange?.(id); setSessionId(id); } });
  }
  let renderer;
  await act(async () => {
    renderer = create(React.createElement(React.StrictMode, null, React.createElement(component === "StudySessions" ? StudyHarness : Component, props)));
  });
  return renderer;
}

const matchingProps = { token: "session-token", notify() {}, onConnections() {} };
const connectionsProps = { token: "session-token", userId: 1, notify() {}, onMatching() {} };
const unmount = (renderer) => act(async () => renderer.unmount());

test("InstructorModeration: displays real event and commits explicit release once", async () => {
  const event = {id: 73, session_id: 14, message_id: 25, sender_id: 9, agent_action: "ESCALATE",
    risk_score: 0.9, reason: "Real assessment", message_content: "Real held content", guidance: null,
    instructor_review: null, context: {retrieved_sources: [{source: "notes.pdf", chunk_id: "notes#2", text: "Evidence"}]}};
  let posts = 0;
  const response = deferred();
  const renderer = await mount("InstructorModeration", {token: "teacher-token"}, async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer teacher-token");
    if (options.method !== "POST") return json({items: [event], count: 1});
    posts++;
    assert.ok(url.endsWith("/instructor/moderation/73/review"));
    assert.deepEqual(JSON.parse(options.body), {action: "OVERRIDE", override_action: "ALLOW", notes: "Safe after review"});
    return response.promise;
  });
  assert.ok(text(renderer.toJSON()).includes("Real held content"));
  assert.ok(text(renderer.toJSON()).includes("notes#2"));
  assert.equal(button(renderer, "Cho phép phát tin").props.disabled, true);
  await act(async () => renderer.root.findByType("textarea").props.onChange({target: {value: "Safe after review"}}));
  await act(async () => {
    const submit = button(renderer, "Cho phép phát tin").props.onClick;
    submit(); submit();
  });
  assert.equal(posts, 1);
  await act(async () => response.resolve(json({...event, instructor_review: {action: "OVERRIDE"}})));
<<<<<<< HEAD
  assert.ok(text(renderer.toJSON()).includes("Quyết định đã được backend lưu"));
=======
  assert.ok(text(renderer.toJSON()).includes("Admin đã xử lý tin này"));
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  assert.equal(button(renderer, "Cho phép phát tin").props.disabled, true);
  await unmount(renderer);
});

test("InstructorModeration: errors never show a mock queue or review success", async () => {
  const renderer = await mount("InstructorModeration", {token: "teacher-token"}, async () => json({detail: "No permission"}, 403));
  assert.ok(text(renderer.toJSON()).includes("No permission"));
<<<<<<< HEAD
  assert.ok(!text(renderer.toJSON()).includes("Đã được backend lưu"));
=======
  assert.ok(!text(renderer.toJSON()).includes("Admin đã xử lý"));
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  assert.equal(renderer.root.findAllByType("textarea").length, 0);
  await unmount(renderer);
});

test("Matching: StrictMode makes one search, displays loading then actual score and no unsupported filters", async () => {
  const search = deferred();
  let searches = 0;
  const renderer = await mount("Matching", matchingProps, async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer session-token");
    if (url.endsWith("/connections")) return json(emptyConnections());
    assert.ok(url.endsWith("/matches/search"));
    assert.equal(options.method, "POST");
    assert.equal(options.body, undefined);
    searches++;
    return search.promise;
  });
  assert.equal(searches, 1);
  assert.equal(button(renderer, "Đang tìm người phù hợp...").props.disabled, true);
  assert.equal(renderer.root.findAllByType("select").length, 0);
  await act(async () => search.resolve(json({ request_id: 7, candidates: [candidate] }, 201)));
  assert.ok(text(renderer.toJSON()).includes(peer.display_name));
<<<<<<< HEAD
  assert.ok(text(renderer.toJSON()).includes("73,13"));
  assert.ok(text(renderer.toJSON()).includes("Trường thật"));
  assert.ok(text(renderer.toJSON()).includes("Chưa có lý do phù hợp"));
  assert.equal(button(renderer, "Gửi lời mời kết nối").props.disabled, false);
=======
  assert.ok(text(renderer.toJSON()).includes("73/100"));
  assert.ok(text(renderer.toJSON()).includes("Trường thật"));
  assert.ok(text(renderer.toJSON()).includes("Chưa có lý do phù hợp"));
  assert.equal(button(renderer, "Cùng học nhé →").props.disabled, false);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  await unmount(renderer);
});

test("Matching: sending twice makes one POST; server PENDING survives remount", async () => {
  const send = deferred();
  let posts = 0;
  let list = emptyConnections();
  const notices = [];
  const fetch = async (url, options) => {
    if (url.endsWith("/matches/search")) return json({ request_id: 7, candidates: [candidate] }, 201);
    if (options.method === "POST") {
      posts++;
      assert.deepEqual(JSON.parse(options.body), { recipient_id: 2 });
      return send.promise;
    }
    return json(list);
  };
  const renderer = await mount("Matching", { ...matchingProps, notify: (message) => notices.push(message) }, fetch);
  await act(async () => {
<<<<<<< HEAD
    const sendButton = button(renderer, "Gửi lời mời kết nối");
=======
    const sendButton = button(renderer, "Cùng học nhé →");
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    sendButton.props.onClick();
    sendButton.props.onClick();
  });
  assert.equal(posts, 1);
  assert.equal(notices.length, 0);
  assert.equal(button(renderer, "Đang gửi lời mời...").props.disabled, true);
  list = { ...emptyConnections(), sent: [{ ...invitation, requester_id: 1, recipient_id: 2 }] };
  await act(async () => send.resolve(json({ ...invitation, requester_id: 1, recipient_id: 2, peer_match_id: null }, 201)));
  assert.equal(notices.length, 1);
  assert.equal(button(renderer, "Đang chờ phản hồi").props.disabled, true);
  await unmount(renderer);
  const reloaded = await mount("Matching", matchingProps, fetch);
  assert.equal(button(reloaded, "Đang chờ phản hồi").props.disabled, true);
  assert.equal(posts, 1);
  await unmount(reloaded);
});

test("Matching: search failure retries to a real empty result without fallback candidates", async () => {
  let searches = 0;
  const renderer = await mount("Matching", matchingProps, async (url) => {
    if (url.endsWith("/connections")) return json(emptyConnections());
    return ++searches === 1 ? json({ detail: "Matching service unavailable" }, 503) : json({ request_id: 8, candidates: [] }, 201);
  });
  assert.ok(text(renderer.toJSON()).includes("Matching service unavailable"));
  await act(async () => button(renderer, "Thử lại").props.onClick());
  assert.ok(text(renderer.toJSON()).includes("Chưa tìm thấy người học phù hợp"));
  assert.equal(renderer.root.findAllByProps({ className: "candidate-card" }).length, 0);
  assert.equal(searches, 2);
  await unmount(renderer);
});

test("Matching: incoming pending and connected peers cannot receive another invitation", async () => {
  const secondPeer = { ...peer, user_id: 3, display_name: "Peer đã kết nối" };
  const renderer = await mount("Matching", matchingProps, async (url) => url.endsWith("/connections")
    ? json({ incoming: [invitation], sent: [], connected: [{ ...connected, peer: secondPeer }] })
    : json({ request_id: 7, candidates: [candidate, { ...candidate, candidate_id: 3, display_name: secondPeer.display_name, rank: 2 }] }, 201));
  assert.equal(button(renderer, "Đang chờ phản hồi").props.disabled, true);
  assert.equal(button(renderer, "Đã kết nối").props.disabled, true);
  await unmount(renderer);
});

test("Matching: 409 displays the backend message and reconciles an existing invitation", async () => {
  let list = emptyConnections();
  const renderer = await mount("Matching", matchingProps, async (url, options) => {
    if (url.endsWith("/matches/search")) return json({ request_id: 7, candidates: [candidate] }, 201);
    if (options.method === "POST") {
      list = { ...emptyConnections(), incoming: [invitation] };
      return json({ detail: "A pending connection request already exists" }, 409);
    }
    return json(list);
  });
<<<<<<< HEAD
  await act(async () => button(renderer, "Gửi lời mời kết nối").props.onClick());
=======
  await act(async () => button(renderer, "Cùng học nhé →").props.onClick());
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  assert.ok(text(renderer.toJSON()).includes("A pending connection request already exists"));
  assert.equal(button(renderer, "Đang chờ phản hồi").props.disabled, true);
  await unmount(renderer);
});

test("Matching: failed connection lookup disables sending until retry succeeds", async () => {
  let lists = 0;
  const renderer = await mount("Matching", matchingProps, async (url) => {
    if (url.endsWith("/matches/search")) return json({ request_id: 7, candidates: [candidate] }, 201);
    return ++lists === 1 ? json({ detail: "Cannot list connections" }, 500) : json(emptyConnections());
  });
<<<<<<< HEAD
  assert.equal(button(renderer, "Gửi lời mời kết nối").props.disabled, true);
  await act(async () => button(renderer, "Thử lại trạng thái kết nối").props.onClick());
  assert.equal(button(renderer, "Gửi lời mời kết nối").props.disabled, false);
=======
  assert.equal(button(renderer, "Cùng học nhé →").props.disabled, true);
  await act(async () => button(renderer, "Thử lại trạng thái kết nối").props.onClick());
  assert.equal(button(renderer, "Cùng học nhé →").props.disabled, false);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  await unmount(renderer);
});

for (const action of ["accept", "reject"]) {
  test(`Connections: ${action} is recipient-only, blocks double submit and reloads authoritative groups`, async () => {
    const response = deferred();
    let posts = 0;
    let lists = 0;
    const notices = [];
    let list = {
      incoming: [invitation, { ...invitation, id: 99, recipient_id: 999 }],
      sent: [{ ...invitation, id: 13, requester_id: 1, recipient_id: 2 }], connected: [],
    };
    const renderer = await mount("Connections", { ...connectionsProps, notify: (message) => notices.push(message) }, async (url, options) => {
      if (options.method === "POST") {
        assert.ok(url.endsWith(`/connections/12/${action}`));
        assert.equal(options.body, undefined);
        posts++;
        return response.promise;
      }
      lists++;
      return json(list);
    });
    assert.equal(lists, 1);
    assert.equal(renderer.root.findAllByType("button").filter((item) => text(item) === "Chấp nhận").length, 1);
    assert.ok(text(renderer.toJSON()).includes("Người gửi: Lê Bình Backend · Người nhận: Bạn"));
    assert.ok(text(renderer.toJSON()).includes("Người gửi: Bạn · Người nhận: Lê Bình Backend"));
    await act(async () => {
      const actionButton = button(renderer, action === "accept" ? "Chấp nhận" : "Từ chối");
      actionButton.props.onClick();
      actionButton.props.onClick();
    });
    assert.equal(posts, 1);
    assert.equal(notices.length, 0);
    assert.equal(button(renderer, "Đang xử lý...").props.disabled, true);
    list = { ...emptyConnections(), connected: action === "accept" ? [connected] : [] };
    await act(async () => response.resolve(json({ ...invitation, status: action === "accept" ? "MATCHED" : "REJECTED", peer_match_id: action === "accept" ? 9 : null })));
    assert.equal(notices.length, 1);
    assert.equal(lists, 2);
    assert.ok(text(renderer.toJSON()).includes(action === "accept" ? "Đã kết nối: Lê Bình Backend." : "Đã từ chối: Lê Bình Backend."));
    assert.equal(renderer.root.findAllByType("button").filter((item) => text(item) === "Chấp nhận").length, 0);
    await unmount(renderer);
    const reloaded = await mount("Connections", connectionsProps, async () => json(list));
    if (action === "accept") {
      assert.ok(reloaded.root.findAllByType("h2").some((heading) => /^Đã kết nối\s*1$/.test(text(heading))));
    } else {
      assert.ok(text(reloaded.toJSON()).includes("Bạn chưa có kết nối"));
    }
    await unmount(reloaded);
  });
}

test("Connections: load error retries; mutation 409 retains the server error while refreshing", async () => {
  let lists = 0;
  let list = { ...emptyConnections(), incoming: [invitation] };
  const renderer = await mount("Connections", connectionsProps, async (_url, options) => {
    if (options.method === "POST") {
      list = { ...emptyConnections(), connected: [connected] };
      return json({ detail: "Invalid connection request state transition" }, 409);
    }
    return ++lists === 1 ? json({ detail: "Cannot load connections" }, 503) : json(list);
  });
  assert.ok(text(renderer.toJSON()).includes("Cannot load connections"));
  await act(async () => button(renderer, "Thử lại").props.onClick());
  await act(async () => button(renderer, "Chấp nhận").props.onClick());
  assert.ok(text(renderer.toJSON()).includes("Invalid connection request state transition"));
  assert.ok(renderer.root.findAllByType("h2").some((heading) => /^Đã kết nối\s*1$/.test(text(heading))));
  await unmount(renderer);
});

test("Home: restored Connections route fetches the backend; 401 removes the session and requests login", async () => {
  const storage = new Map([["peerbridge_token", "session-token"]]);
  const window = {
    localStorage: { getItem: (key) => storage.get(key) ?? null, removeItem: (key) => storage.delete(key) },
    location: { hash: "#connections" }, history: { replaceState() {} }, setTimeout() {},
  };
  let connectionLoads = 0;
  const renderer = await mount("Home", {}, async (url) => {
    if (url.endsWith("/profiles/me")) return json({ profile: { user_id: 1, display_name: "Người dùng thật", major: "", school: "", bio: "", subjects: [], learning_goals: [] }, needs_help_with: [], can_help_with: [], availability: [] });
    assert.ok(url.endsWith("/connections"));
    connectionLoads++;
    return json({ detail: "Token expired" }, 401);
  }, window);
  assert.equal(connectionLoads, 1);
  assert.equal(storage.has("peerbridge_token"), false);
  assert.ok(text(renderer.toJSON()).includes("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
  assert.ok(text(renderer.toJSON()).includes("Đăng nhập"));
  await unmount(renderer);
});

for (const component of ["Matching", "Connections"]) {
  test(`${component}: failed POST never displays success or changes connection state`, async () => {
    const notices = [];
    const props = component === "Matching" ? matchingProps : connectionsProps;
    const renderer = await mount(component, { ...props, notify: (message) => notices.push(message) }, async (url, options) => {
      if (url.endsWith("/matches/search")) return json({ request_id: 7, candidates: [candidate] }, 201);
      if (options.method === "POST") return json({ detail: "Backend refused the operation" }, 500);
      return json(component === "Matching" ? emptyConnections() : { ...emptyConnections(), incoming: [invitation] });
    });
<<<<<<< HEAD
    await act(async () => button(renderer, component === "Matching" ? "Gửi lời mời kết nối" : "Chấp nhận").props.onClick());
    assert.equal(notices.length, 0);
    assert.ok(text(renderer.toJSON()).includes("Backend refused the operation"));
    assert.equal(button(renderer, component === "Matching" ? "Gửi lời mời kết nối" : "Chấp nhận").props.disabled, false);
=======
    await act(async () => button(renderer, component === "Matching" ? "Cùng học nhé →" : "Chấp nhận").props.onClick());
    assert.equal(notices.length, 0);
    assert.ok(text(renderer.toJSON()).includes("Backend refused the operation"));
    assert.equal(button(renderer, component === "Matching" ? "Cùng học nhé →" : "Chấp nhận").props.disabled, false);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    assert.equal(renderer.root.findAllByProps({ className: "form-success" }).length, 0);
    await unmount(renderer);
  });
}

const studyToken = `header.${Buffer.from(JSON.stringify({ sub: "1" })).toString("base64url")}.signature`;
const studySession = {
  id: 17, peer_match_id: 9, learner_id: 1, helper_id: 2, topic: "Chủ đề từ máy chủ",
  scheduled_start: null, scheduled_end: null, created_at: null, updated_at: null,
};
const studyProps = { token: studyToken, userId: 1, sessionId: null, onConnections() {} };

function studyFetch({ list = [studySession], peers = [connected], detail = studySession } = {}) {
  return async (url, options) => {
    assert.equal(options.headers.Authorization, `Bearer ${studyToken}`);
    if (url.endsWith("/connections")) return json({ ...emptyConnections(), connected: peers });
    if (url.endsWith("/sessions")) return json({ items: list, count: list.length });
    assert.ok(url.endsWith(`/sessions/${detail.id}`));
    return json({ ...detail, chat_messages: [] });
  };
}

test("StudySessions: empty lists show guidance and never create a socket or sample session", async () => {
  const before = TestWebSocket.sockets.length;
  const renderer = await mount("StudySessions", studyProps, studyFetch({ list: [], peers: [] }));
  assert.ok(text(renderer.toJSON()).includes("Bạn chưa có kết nối hợp lệ"));
  assert.ok(text(renderer.toJSON()).includes("Chưa có phiên học nào"));
  assert.equal(TestWebSocket.sockets.length, before);
  assert.equal(renderer.root.findByType("fieldset").props.disabled, true);
  await unmount(renderer);
});

test("StudySessions: filters membership and enters an existing room with its real ID and JWT", async () => {
  const before = TestWebSocket.sockets.length;
  const renderer = await mount("StudySessions", studyProps, studyFetch({ list: [
    studySession, { ...studySession, id: 18, learner_id: 3, helper_id: 4, topic: "Private other session" },
  ] }));
  assert.ok(text(renderer.toJSON()).includes(studySession.topic));
  assert.ok(!text(renderer.toJSON()).includes("Private other session"));
  await act(async () => button(renderer, "Vào phòng học").props.onClick());
  assert.ok(TestWebSocket.sockets.length > before);
  const socket = TestWebSocket.sockets.at(-1);
  assert.equal(socket.url, `ws://backend.test/ws/sessions/17?token=${encodeURIComponent(studyToken)}`);
  await act(async () => { socket.readyState = 1; socket.onopen(); });
<<<<<<< HEAD
  assert.ok(text(renderer.toJSON()).includes("Connected"));
=======
  assert.ok(text(renderer.toJSON()).includes("Đã kết nối"));
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const composer = renderer.root.findAllByType("input").find((item) => item.props["aria-label"] === "Message");
  await act(async () => composer.props.onChange({ target: { value: "Câu hỏi thật" } }));
  await act(async () => renderer.root.findAllByType("form").at(-1).props.onSubmit({ preventDefault() {} }));
  assert.deepEqual(socket.sent, [{ type: "CHAT_MESSAGE", content: "Câu hỏi thật" }]);
  await act(async () => button(renderer, "Rời phòng").props.onClick());
  assert.equal(socket.readyState, TestWebSocket.CLOSED);
  assert.equal(renderer.root.findAllByProps({ "aria-label": "Study Room" }).length, 0);
  await unmount(renderer);
});

test("StudySessions: create submits once, derives helper role and opens the returned session", async () => {
  const post = deferred();
  let posts = 0;
  const notices = [];
  const renderer = await mount("StudySessions", { ...studyProps, onSessionChange: (id) => notices.push(id) }, async (url, options) => {
    if (options.method === "POST") {
      posts++;
      assert.deepEqual(JSON.parse(options.body), {
        peer_match_id: 9, learner_id: 2, helper_id: 1, topic: "Chủ đề mới",
        scheduled_start: null, scheduled_end: null,
      });
      return post.promise;
    }
    return studyFetch()(url, options);
  });
  await act(async () => {
    renderer.root.findAllByType("select")[0].props.onChange({ target: { value: "9" } });
    renderer.root.findAllByType("select")[1].props.onChange({ target: { value: "helper" } });
    renderer.root.findAllByType("input")[0].props.onChange({ target: { value: "  Chủ đề mới  " } });
  });
  await act(async () => {
    const form = renderer.root.findByType("form");
    form.props.onSubmit({ preventDefault() {} });
    form.props.onSubmit({ preventDefault() {} });
  });
  assert.equal(posts, 1);
  assert.equal(notices.length, 0);
  assert.equal(renderer.root.findByType("fieldset").props.disabled, true);
  await act(async () => post.resolve(json({ ...studySession, chat_messages: [] }, 201)));
  assert.deepEqual(notices, [17]);
  assert.ok(text(renderer.toJSON()).includes("Đã tạo phiên học #17"));
  assert.ok(text(renderer.toJSON()).includes("Đang ở phòng"));
  await unmount(renderer);
});

test("StudySessions: a REST detail rejection never opens WebSocket and can be retried", async () => {
  let denied = true;
  const before = TestWebSocket.sockets.length;
  const renderer = await mount("StudySessions", { ...studyProps, sessionId: 17 }, async (url, options) => {
    if (url.endsWith("/sessions/17") && denied) return json({ detail: "Access denied by backend" }, 403);
    return studyFetch()(url, options);
  });
  assert.ok(text(renderer.toJSON()).includes("Access denied by backend"));
  assert.equal(TestWebSocket.sockets.length, before);
  denied = false;
  await act(async () => button(renderer, "Kết nối lại").props.onClick());
  assert.ok(TestWebSocket.sockets.length > before);
  await unmount(renderer);
});

test("StudySessions: socket errors are visible and reconnect verifies REST before replacing the socket", async () => {
  const renderer = await mount("StudySessions", { ...studyProps, sessionId: 17 }, studyFetch());
  const socket = TestWebSocket.sockets.at(-1);
  await act(async () => socket.onclose({ code: 4403, wasClean: false }));
  assert.ok(text(renderer.toJSON()).includes("This user cannot access"));
  await act(async () => button(renderer, "Kết nối lại").props.onClick());
  const replacement = TestWebSocket.sockets.at(-1);
  assert.notEqual(replacement, socket);
  assert.equal(socket.readyState, TestWebSocket.CLOSED);
  await act(async () => replacement.onmessage({ data: JSON.stringify({ type: "ERROR", code: "INVALID_PAYLOAD", message: "Content rejected" }) }));
  assert.ok(text(renderer.toJSON()).includes("Content rejected"));
  await unmount(renderer);
});

test("StudySessions: REST failures keep successful lists usable and refresh can recover", async () => {
  let unavailable = true;
  const renderer = await mount("StudySessions", studyProps, async (url, options) => {
    if (url.endsWith("/connections") && unavailable) return json({ detail: "Connections unavailable" }, 503);
    return studyFetch()(url, options);
  });
  assert.ok(text(renderer.toJSON()).includes("Connections unavailable"));
  assert.ok(text(renderer.toJSON()).includes(studySession.topic));
  assert.equal(renderer.root.findByType("fieldset").props.disabled, true);
  unavailable = false;
  await act(async () => button(renderer, "Cập nhật danh sách").props.onClick());
  assert.equal(renderer.root.findByType("fieldset").props.disabled, false);
  await unmount(renderer);
});

test("StudySessions: failed creation displays the backend error without success or opening a room", async () => {
  const before = TestWebSocket.sockets.length;
  const renderer = await mount("StudySessions", studyProps, async (url, options) => {
    if (options.method === "POST") return json({ detail: "Session creation refused" }, 422);
    return studyFetch({ list: [] })(url, options);
  });
  await act(async () => {
    renderer.root.findAllByType("select")[0].props.onChange({ target: { value: "9" } });
    renderer.root.findAllByType("input")[0].props.onChange({ target: { value: "Chủ đề mới" } });
  });
  await act(async () => renderer.root.findByType("form").props.onSubmit({ preventDefault() {} }));
  assert.ok(text(renderer.toJSON()).includes("Session creation refused"));
  assert.ok(!text(renderer.toJSON()).includes("Đã tạo phiên học"));
  assert.equal(TestWebSocket.sockets.length, before);
  assert.equal(renderer.root.findByType("fieldset").props.disabled, false);
  await unmount(renderer);
});

test("StudySessions: invalid schedule prevents POST and a failed list never invents sessions", async () => {
  let posts = 0;
  const renderer = await mount("StudySessions", studyProps, async (url, options) => {
    if (options.method === "POST") { posts++; return json({}, 500); }
    if (url.endsWith("/sessions")) return json({ detail: "Sessions unavailable" }, 503);
    return studyFetch()(url, options);
  });
  assert.ok(text(renderer.toJSON()).includes("Sessions unavailable"));
  assert.ok(!text(renderer.toJSON()).includes(studySession.topic));
  await act(async () => {
    renderer.root.findAllByType("select")[0].props.onChange({ target: { value: "9" } });
    const inputs = renderer.root.findAllByType("input");
    inputs[0].props.onChange({ target: { value: "Chủ đề mới" } });
    inputs[1].props.onChange({ target: { value: "2026-10-04T10:00" } });
    inputs[2].props.onChange({ target: { value: "2026-10-04T09:00" } });
  });
  await act(async () => renderer.root.findByType("form").props.onSubmit({ preventDefault() {} }));
  assert.equal(posts, 0);
  assert.ok(text(renderer.toJSON()).includes("Thời gian kết thúc phải sau"));
  await unmount(renderer);
});

<<<<<<< HEAD
test("Home: restores session ID, preserves instructor sessions and logs out on a sessions 401", async () => {
=======
test("Home: temporary profile failure preserves login and can recover", async () => {
  const storage = new Map([["peerbridge_token", studyToken]]);
  const window = {
    localStorage:{getItem:key=>storage.get(key) ?? null,removeItem:key=>storage.delete(key)},
    location:{hash:"#connections"}, history:{replaceState(){}},setTimeout(){},
  };
  let failed = true;
  const renderer = await mount("Home", {}, async url=>{
    if(url.endsWith("/profiles/me")) return failed ? json({detail:"Profile temporarily unavailable"},503)
      : json({profile:{user_id:1,display_name:"QA",major:"",school:"",bio:"",subjects:[],learning_goals:[]},needs_help_with:[],can_help_with:[],availability:[]});
    if(url.includes("/notifications")) return json({items:[],unread_count:0});
    return json(emptyConnections());
  },window);
  assert.equal(storage.get("peerbridge_token"),studyToken);
  assert.match(text(renderer.toJSON()),/Profile temporarily unavailable/);
  failed = false;
  await act(async()=>button(renderer,"Thử tải lại hồ sơ").props.onClick());
  assert.doesNotMatch(text(renderer.toJSON()),/Chưa tải được hồ sơ/);
  assert.equal(storage.get("peerbridge_token"),studyToken);
  await unmount(renderer);
});

test("Home: restores a real session ID and logs out on a sessions 401", async () => {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const storage = new Map([["peerbridge_token", studyToken]]);
  const window = {
    localStorage: { getItem: (key) => storage.get(key) ?? null, removeItem: (key) => storage.delete(key) },
    location: { hash: "#sessions/17" }, history: { replaceState(_data, _title, hash) { window.location.hash = hash; } }, setTimeout() {},
  };
  let expired = false;
  const renderer = await mount("Home", {}, async (url, options) => {
    if (url.endsWith("/profiles/me")) return json({ profile: { user_id: 1, display_name: "Người dùng thật", major: "", school: "", bio: "", subjects: [], learning_goals: [] }, needs_help_with: [], can_help_with: [], availability: [] });
    if (expired) return json({ detail: "Token expired" }, 401);
<<<<<<< HEAD
=======
    if (url.includes("/notifications")) return json({items:[],unread_count:0});
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    return studyFetch()(url, options);
  }, window);
  assert.ok(text(renderer.toJSON()).includes(studySession.topic));
  const socket = TestWebSocket.sockets.at(-1);
<<<<<<< HEAD
  await act(async () => button(renderer, "Giảng viên").props.onClick());
  assert.equal(socket.readyState, TestWebSocket.CLOSED);
  await act(async () => button(renderer, "Phiên đang học").props.onClick());
  assert.ok(text(renderer.toJSON()).includes("Cây nhị phân & phép duyệt"));
  assert.ok(!text(renderer.toJSON()).includes("Tạo phiên học"));
  await act(async () => button(renderer, "Sinh viên").props.onClick());
  expired = true;
  await act(async () => button(renderer, "Phiên học").props.onClick());
=======
  await act(async () => button(renderer, "← Về lịch học").props.onClick());
  assert.equal(socket.readyState, TestWebSocket.CLOSED);
  expired = true;
  await act(async () => button(renderer, "Cập nhật lịch").props.onClick());
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  assert.equal(storage.has("peerbridge_token"), false);
  assert.ok(text(renderer.toJSON()).includes("Phiên đăng nhập đã hết hạn"));
  assert.equal(window.location.hash, "#dashboard");
  await unmount(renderer);
});
