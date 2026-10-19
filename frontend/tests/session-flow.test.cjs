const {readFileSync} = require("node:fs");
const {join} = require("node:path");
const {runInNewContext} = require("node:vm");
const {test} = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");

function loadModule(filename, dependencies = {}) {
  const source = readFileSync(join(__dirname, "../features/study-meetings", filename), "utf8");
  const javascript = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
  const moduleRef = {exports: {}};
  runInNewContext(javascript, {module: moduleRef, exports: moduleRef.exports, Date, require: name => dependencies[name]});
  return moduleRef.exports;
}
const edit = loadModule("timeline-edit.ts");
const wire = loadModule("timeline-wire.ts");
const {advanceMinutes, chooseChip, createFlow, decideTimeline, proposeTimeline, setPartner, undoTimeline} = loadModule("session-flow.ts", {"./timeline-edit": edit});
const activities = [
  {id: "solo-0", title: "Tự thử", minutes: 7, type: "solo"},
  {id: "break-1", title: "Nghỉ", minutes: 5, type: "break"},
  {id: "joint-2", title: "Cùng giải thích", minutes: 5, type: "joint"},
];

test("người chờ nhận gợi ý đúng mốc 5 và 10 phút", () => {
  let flow = advanceMinutes(createFlow(activities, "absent", 1), 1);
  flow = advanceMinutes(flow, 4);
  assert.equal(flow.waitingMinutes, 4);
  assert.equal(flow.messages.at(-1).chips, undefined);
  flow = advanceMinutes(flow, 1);
  assert.equal(flow.messages.at(-1).chips[0].key, "quiz");
  flow = advanceMinutes(flow, 5);
  assert.equal(flow.messages.at(-1).chips[0].key, "solo25");
});

test("bạn học vào thì hoạt động bắt đầu; nghỉ không có chip", () => {
  let flow = advanceMinutes(createFlow(activities, "absent", 1), 6);
  flow = setPartner(flow, "present");
  assert.equal(flow.messages.at(-1).chips[0].key, "question");
  flow = advanceMinutes(flow, 7);
  assert.equal(flow.phase, "break");
  assert.equal(flow.messages.at(-1).chips, undefined);
});

test("chọn chip chỉ áp dụng cho tin AI mới nhất", () => {
  let flow = createFlow(activities);
  const first = flow.messages.at(-1);
  flow = chooseChip(flow, first.id, "report");
  assert.equal(flow.messages[0].chosen, "Báo lịch");
  const unchanged = chooseChip(flow, first.id, "cannot");
  assert.equal(unchanged, flow);
});

test("tự học khi chờ đếm đủ 25 phút và hỏi tóm tắt", () => {
  let flow = advanceMinutes(createFlow(activities, "absent", 1), 11);
  flow = chooseChip(flow, flow.messages.at(-1).id, "solo25");
  assert.equal(flow.remainingSec, 25 * 60);
  flow = advanceMinutes(flow, 24);
  assert.equal(flow.remainingSec, 60);
  flow = advanceMinutes(flow, 1);
  assert.equal(flow.messages.at(-1).chips[0].key, "share");
});

test("mỗi tin AI có tối đa ba chip", () => {
  let flow = createFlow(activities, "present", 1);
  flow = advanceMinutes(flow, 20);
  assert(flow.messages.every(message => (message.chips?.length ?? 0) <= 3));
});

test("đề xuất được chấp nhận, lưu lịch sử và hoàn tác", () => {
  let flow = createFlow(activities, "present");
  const proposed = activities.map((item, index) => index === 0 ? {...item, title: "Brain storm"} : item);
  flow = proposeTimeline(flow, proposed, edit.timelineDiff(activities, proposed), "me");
  assert.equal(flow.proposal.status, "pending");
  assert.equal(proposeTimeline(flow, activities, "khác", "me"), flow);
  flow = decideTimeline(flow, true);
  assert.equal(flow.activities[0].title, "Brain storm");
  assert.equal(flow.timelineHistory.length, 1);
  flow = undoTimeline(flow);
  assert.equal(flow.activities[0].title, "Tự thử");
});

test("đề xuất đến từ bạn học có diff và hết hạn sau 60 giây giả", () => {
  const proposed = activities.map((item, index) => index === 0 ? {...item, title: "Brain storm"} : item);
  let flow = proposeTimeline(createFlow(activities), proposed, edit.timelineDiff(activities, proposed), "partner");
  assert.equal(flow.messages.at(-1).chips[0].key, "accept_timeline");
  flow = advanceMinutes(flow, 1);
  assert.equal(flow.proposal.status, "rejected");
  assert.equal(flow.activities[0].title, "Tự thử");
});

test("giới hạn timeline và rút gọn solo trước", () => {
  const longer = activities.map((item, index) => index === 0 ? {...item, minutes: 12} : item);
  assert.equal(edit.validateTimeline(activities, longer, 17), "Timeline vượt giờ kết thúc đã hẹn.");
  const shortened = edit.autoShorten(longer, 17);
  assert.equal(shortened[0].minutes, 7);
  assert.equal(shortened[2].minutes, 5);
  assert.equal(edit.validateTimeline(activities, shortened, 17), null);
  assert.equal(edit.validateTimeline(activities, [...activities, ...activities, ...activities], 100), "Tối đa 8 hoạt động.");
});

test("khi đang học chỉ sửa hoạt động chưa bắt đầu", () => {
  const changedCurrent = activities.map((item, index) => index === 0 ? {...item, title: "Tên mới"} : item);
  assert.equal(edit.validateTimeline(activities, changedCurrent, 17, 1), "Hoạt động đã bắt đầu cần được giữ nguyên.");
  const changedFuture = activities.map((item, index) => index === 2 ? {...item, title: "Thảo luận"} : item);
  assert.equal(edit.validateTimeline(activities, changedFuture, 17, 1), null);
  assert.equal(edit.canUndo(changedCurrent, activities, 1), false);
});

test("đề xuất gửi qua chat được giải mã; tin thường được giữ nguyên", () => {
  const content = wire.encodeTimelineWire({kind: "proposal", id: "abc", sentAt: Date.now(), activities});
  const decoded = wire.decodeTimelineWire(content);
  assert.equal(decoded.kind, "proposal");
  assert.equal(decoded.activities.length, 3);
  assert.equal(wire.decodeTimelineWire("Chào bạn"), null);
});
