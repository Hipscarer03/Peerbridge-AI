import {canUndo, lockedCount, validateTimeline} from "./timeline-edit";

export const SPEED = 60; // Chỉ dùng khi bật ?dev=1 để tua nhanh luồng mẫu.

export type Phase = "idle" | "lobby" | "running" | "break" | "wrap" | "done";
export type Activity = { id: string; title: string; minutes: number; type: "solo" | "joint" | "break" };
export type Chip = { key: string; label: string };
export type Quiz = {question: string; options: [string, string, string]; correct: number; why: string};
export type FlowMessage = { id: number; from: "ai" | "me" | "partner"; text: string; createdAt: number; chips?: Chip[]; private?: boolean; chosen?: string; quiz?: Quiz; form?: "context" | "critique" };
export type TimelineProposal = {id: string; by: "me" | "partner"; diff: string; activities: Activity[]; goal?: string; status: "pending" | "accepted" | "rejected"; remainingSec: number};
export type SessionFlow = {
  phase: Phase;
  activities: Activity[];
  activityIndex: number;
  remainingSec: number;
  partner: "absent" | "present";
  messages: FlowMessage[];
  nextId: number;
  untilStart: number;
  waitingMinutes: number;
  waitingSeconds: number;
  untilStartSeconds: number;
  soloWhileWaiting: boolean;
  warnedTwoMinutes: boolean;
  mood: string | null;
  budgetMinutes: number;
  proposal: TimelineProposal | null;
  timelineHistory: Activity[][];
  goal: string;
  solo: boolean;
  joinedAt: string | null;
  catchUp: boolean;
  context: {topic: string; progress: string; blocker: string};
  contextAsked: number[];
  quizKind: "opening" | "closing" | "catchup" | null;
  quizIndex: number;
  quizAnswers: boolean[];
  level: "dễ" | "vừa" | "khó";
  improve: string;
  critiqueQuestion: string;
  critiqueFocuses: string[];
};

const chips = (...choices: [string, string][]): Chip[] => choices.map(([key, label]) => ({key, label}));
function addAi(flow: SessionFlow, text: string, choices?: Chip[], isPrivate = false, extra: Pick<FlowMessage, "quiz" | "form"> = {}): SessionFlow {
  const available = choices ?? (extra.quiz || extra.form ? undefined
    : flow.phase === "done" ? chips(["ack", "Đóng"], ["rebook", "Hẹn phiên sau"])
    : flow.phase === "break" ? chips(["ack", "Đã rõ"], ["wait", "Nghỉ tiếp"])
    : flow.phase === "lobby" ? chips(["ack", "Đã rõ"], ["edit_timeline", "Xem timeline"])
    : flow.phase === "wrap" ? chips(["ack", "Đã rõ"], ["done", "Hoàn tất"])
    : chips(["ack", "Đã rõ"], ["context", "Cập nhật tiến độ"]));
  return {...flow, nextId: flow.nextId + 1, messages: [...flow.messages, {id: flow.nextId, from: "ai", text, createdAt: Date.now(), chips: available, private: isPrivate, ...extra}]};
}

function beginActivity(flow: SessionFlow, index: number): SessionFlow {
  if (index >= flow.activities.length) {
    return addAi({...flow, phase: "wrap", activityIndex: index, remainingSec: 0}, "Phiên này thấy thế nào?", chips(["easy", "Quá dễ"], ["medium", "Vừa sức"], ["hard", "Quá khó"]), true);
  }
  const activity = flow.activities[index];
  const next = {...flow, phase: activity.type === "break" ? "break" as const : "running" as const, activityIndex: index, remainingSec: activity.minutes * 60, warnedTwoMinutes: false};
  return next;
}

export function createFlow(activities: Activity[], partner: SessionFlow["partner"] = "absent", untilStart = 15, budgetMinutes = activities.reduce((total, item) => total + item.minutes, 0), goal = "", solo = false): SessionFlow {
  const flow: SessionFlow = {phase: "lobby", activities, activityIndex: 0, remainingSec: 0, partner, messages: [], nextId: 1, untilStart, untilStartSeconds: untilStart * 60, waitingMinutes: 0, waitingSeconds: 0, soloWhileWaiting: false, warnedTwoMinutes: false, mood: null, budgetMinutes, proposal: null, timelineHistory: [], goal, solo, joinedAt: null, catchUp: false, context: {topic: "", progress: "", blocker: ""}, contextAsked: [], quizKind: null, quizIndex: 0, quizAnswers: [], level: "vừa", improve: "", critiqueQuestion: "", critiqueFocuses: []};
  const agenda = activities.slice(0, 3).map(item => `${item.title} ${item.minutes}′`).join(" · ") + (activities.length > 3 ? ` · +${activities.length - 3} mục` : "");
  return addAi(flow, `${solo ? "Chào bạn" : "Chào hai bạn"}. Hôm nay: ${agenda}.`, solo ? chips(["opening_quiz", "Tạo quiz khởi động"], ["critique", "Gợi ý câu hỏi phản biện"], ["on_time", "Bắt đầu luôn"]) : chips(["opening_quiz", "Tạo quiz khởi động"], ["critique", "Gợi ý câu hỏi phản biện"], ["on_time", "Bắt đầu luôn"], ["report", "Báo giờ vào"]));
}

export function createFlowAtElapsed(activities: Activity[], partner: SessionFlow["partner"], budgetMinutes: number, goal: string, solo: boolean, startsAt: string, joinedAt: string, peerJoinedAt: string | null = null, now = Date.now()): SessionFlow {
  const elapsed = Math.max(0, Math.floor((now - Date.parse(startsAt)) / 1000));
  let remainingElapsed = elapsed;
  let index = 0;
  while (index < activities.length && remainingElapsed >= activities[index].minutes * 60) {
    remainingElapsed -= activities[index].minutes * 60;
    index += 1;
  }
  let flow = createFlow(activities, partner, 0, budgetMinutes, goal, solo);
  const behindPeer = !!peerJoinedAt && Date.parse(joinedAt) - Date.parse(peerJoinedAt) >= 5 * 60000;
  flow = {...flow, messages: [], nextId: 1, joinedAt, catchUp: behindPeer};
  if (index >= activities.length) return beginActivity(flow, index);
  const started = beginActivity(flow, index);
  const current = {...started, remainingSec: Math.max(1, activities[index].minutes * 60 - remainingElapsed)};
  if (!behindPeer) return current;
  const completed = activities.slice(0, index).map(item => item.title).join(", ");
  const progress = completed ? `Đã qua: ${completed}.` : "Chưa hết mục đầu.";
  return addAi(current, `Bạn học đã bắt đầu trước. ${progress}`, chips(["catchup_summary", "Tóm tắt 1 phút"], ["read_chat", "Đọc chat"]), true);
}

export function proposeTimeline(flow: SessionFlow, activities: Activity[], diff: string, by: TimelineProposal["by"], id = String(Date.now()), goal = flow.goal): SessionFlow {
  if (flow.proposal?.status === "pending") return flow;
  if (flow.phase !== "lobby" && goal.trim() !== flow.goal.trim()) return addAi(flow, "Mục tiêu đã được chốt khi buổi học bắt đầu.", undefined, true);
  const issue = validateTimeline(flow.activities, activities, flow.budgetMinutes, lockedCount(flow.phase, flow.activityIndex));
  if (issue) return addAi(flow, issue, undefined, true);
  const proposal: TimelineProposal = {id, by, diff, activities: activities.map(item => ({...item})), goal, status: "pending", remainingSec: 60};
  return by === "partner"
    ? addAi({...flow, proposal}, `Bạn học đề xuất chỉnh timeline:\n${diff}`, chips(["accept_timeline", "Đồng ý"], ["keep_timeline", "Giữ như cũ"]))
    : addAi({...flow, proposal}, `Đã gửi đề xuất chỉnh timeline:\n${diff}`);
}

export function decideTimeline(flow: SessionFlow, accepted: boolean): SessionFlow {
  if (flow.proposal?.status !== "pending") return flow;
  const proposal = {...flow.proposal, status: accepted ? "accepted" as const : "rejected" as const, remainingSec: 0};
  if (!accepted) return addAi({...flow, proposal}, "Hai bạn sẽ giữ timeline hiện tại.");
  const history = [...flow.timelineHistory, flow.activities.map(item => ({...item}))].slice(-10);
  return addAi({...flow, goal: proposal.goal ?? flow.goal, activities: proposal.activities.map(item => ({...item})), proposal, timelineHistory: history}, "Timeline đã được cập nhật.", chips(["undo_timeline", "Hoàn tác"]));
}

export function undoTimeline(flow: SessionFlow): SessionFlow {
  const previous = flow.timelineHistory.at(-1);
  if (!previous) return flow;
  if (!canUndo(flow.activities, previous, lockedCount(flow.phase, flow.activityIndex))) return addAi(flow, "Hoạt động đã bắt đầu nên không thể hoàn tác lúc này.", undefined, true);
  return addAi({...flow, activities: previous.map(item => ({...item})), timelineHistory: flow.timelineHistory.slice(0, -1)}, "Đã hoàn tác lần chỉnh timeline gần nhất.");
}

const pendingQuiz: Quiz = {question: "", options: ["", "", ""], correct: 0, why: ""};
const englishQuiz: Quiz[] = [
  {question: "‘Could you repeat that, please?’ có nghĩa là gì?", options: ["Bạn có thể nhắc lại được không?", "Bạn có thể viết nhanh hơn không?", "Bạn có muốn rời đi không?"], correct: 0, why: "‘Repeat that’ là nhắc lại điều vừa nói."},
  {question: "Câu nào trả lời phù hợp cho ‘How was your weekend?’", options: ["At seven o’clock.", "It was great, thanks.", "Yes, I am."], correct: 1, why: "Câu hỏi hỏi cuối tuần vừa qua thế nào, nên trả lời về trải nghiệm đó."},
  {question: "Câu hỏi tiếng Anh nào đúng khi hỏi nơi ở?", options: ["Where you live?", "Where do you live?", "Where are you live?"], correct: 1, why: "Câu hỏi hiện tại đơn với ‘you’ dùng trợ động từ ‘do’."},
  {question: "Điền từ đúng: ‘She ___ to work by bus every day.’", options: ["go", "going", "goes"], correct: 2, why: "Chủ ngữ ‘she’ ở hiện tại đơn dùng ‘goes’."},
];
const sqlQuiz: Quiz[] = [
  {question: "Lệnh SQL nào lấy tất cả cột từ bảng students?", options: ["SELECT * FROM students;", "GET ALL students;", "SHOW students ALL;"], correct: 0, why: "SELECT * FROM lấy mọi cột của bảng."},
  {question: "Mệnh đề nào lọc các hàng có age lớn hơn 18?", options: ["ORDER BY age > 18", "WHERE age > 18", "GROUP BY age > 18"], correct: 1, why: "WHERE lọc từng hàng theo điều kiện."},
  {question: "COUNT(*) trong SQL trả về gì?", options: ["Số cột", "Tổng các giá trị số", "Số hàng"], correct: 2, why: "COUNT(*) đếm số hàng trong kết quả."},
  {question: "JOIN thường dùng để làm gì?", options: ["Nối hàng từ các bảng theo điều kiện", "Xóa các hàng trùng", "Đổi tên bảng"], correct: 0, why: "JOIN kết hợp dữ liệu giữa các bảng theo điều kiện nối."},
];
const pythonQuiz: Quiz[] = [
  {question: "Trong Python, len([1, 2, 3]) trả về gì?", options: ["2", "3", "6"], correct: 1, why: "Danh sách có ba phần tử."},
  {question: "Kiểu dữ liệu của {'a': 1} trong Python là gì?", options: ["list", "tuple", "dict"], correct: 2, why: "Cặp khóa và giá trị trong dấu ngoặc nhọn tạo dict."},
  {question: "Biểu thức Python nào kiểm tra x bằng 5?", options: ["x == 5", "x = 5", "x is 5"], correct: 0, why: "Toán tử == so sánh giá trị bằng nhau."},
  {question: "range(3) tạo các giá trị nào?", options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3"], correct: 1, why: "range(3) bắt đầu từ 0 và dừng trước 3."},
];
const mathQuiz: Quiz[] = [
  {question: "Giải phương trình 2x + 3 = 7. x bằng bao nhiêu?", options: ["1", "2", "5"], correct: 1, why: "Trừ 3 rồi chia 2 được x = 2."},
  {question: "25% của 80 bằng bao nhiêu?", options: ["20", "25", "40"], correct: 0, why: "25% là một phần tư; 80 chia 4 bằng 20."},
  {question: "Diện tích hình chữ nhật dài 6, rộng 4 là bao nhiêu?", options: ["10", "20", "24"], correct: 2, why: "Diện tích bằng chiều dài nhân chiều rộng: 6 × 4 = 24."},
  {question: "Nếu f(x) = x², f(3) bằng bao nhiêu?", options: ["6", "9", "12"], correct: 1, why: "Thay x = 3, ta có 3² = 9."},
];

export function fallbackQuiz(flow: SessionFlow, index: number): Quiz | null {
  const topic = [flow.goal, flow.context.topic, ...flow.activities.map(item => item.title)].join(" ").toLowerCase();
  const questions = /tiếng anh|english|speaking|conversation/.test(topic) ? englishQuiz
    : /\bsql\b|cơ sở dữ liệu|database/.test(topic) ? sqlQuiz
    : /python/.test(topic) ? pythonQuiz
    : /toán|math|đại số|hình học/.test(topic) ? mathQuiz : null;
  return questions?.[index] ?? null;
}

export function unavailableQuiz(flow: SessionFlow): SessionFlow {
  const latest = flow.messages.at(-1);
  const messages = flow.messages.map(item => item.id === latest?.id ? {...item, quiz: undefined, chosen: "Chưa có câu hỏi phù hợp"} : item);
  return addAi({...flow, quizKind: null, messages}, "Chưa tạo được câu hỏi kiến thức cho chủ đề này. Hãy bổ sung nội dung học cụ thể rồi thử lại.", chips(["ack", "Đã rõ"]), true);
}

export function startQuiz(flow: SessionFlow, kind: NonNullable<SessionFlow["quizKind"]>): SessionFlow {
  const next = {...flow, quizKind: kind, quizIndex: 0, quizAnswers: []};
  const total = kind === "closing" ? 4 : kind === "catchup" ? 2 : 3;
  return addAi(next, `Câu 1/${total} · ${kind === "closing" ? `Mức ${flow.level}` : "Kiểm tra kiến thức chủ đề học"}`, undefined, true, {quiz: pendingQuiz});
}

export function answerQuiz(flow: SessionFlow, messageId: number, choice: number): SessionFlow {
  const latest = flow.messages.at(-1);
  if (!flow.quizKind || latest?.id !== messageId || !latest.quiz?.question || latest.chosen || choice < 0 || choice > 2) return flow;
  const right = choice === latest.quiz.correct;
  const answered = {...flow, quizAnswers: [...flow.quizAnswers, right], messages: flow.messages.map(item => item.id === messageId ? {...item, chosen: item.quiz?.options[choice]} : item)};
  const total = flow.quizKind === "closing" ? 4 : flow.quizKind === "catchup" ? 2 : 3;
  if (flow.quizIndex + 1 >= total) {
    const count = answered.quizAnswers.filter(Boolean).length;
    const result = flow.quizKind === "closing"
      ? `Bạn chọn đúng ${count}/${total} câu. Hãy ôn thêm “${flow.context.topic || flow.goal}”${flow.improve ? ` và cải thiện ${flow.improve}` : ""} ở phiên sau.`
      : `Bạn chọn đúng ${count}/${total} câu. ${right ? "Đúng rồi." : latest.quiz.why} Tiếp tục theo mục “${flow.activities[flow.activityIndex]?.title ?? "hiện tại"}”.`;
    return addAi({...answered, quizKind: null}, result, flow.quizKind === "closing" ? chips(["done", "Hoàn tất"]) : undefined, true);
  }
  const next = {...answered, quizIndex: flow.quizIndex + 1};
  return addAi(next, `${right ? "Đúng." : "Chưa đúng."} ${latest.quiz.why} Câu ${next.quizIndex + 1}/${total}:`, undefined, true, {quiz: pendingQuiz});
}

export function askContext(flow: SessionFlow, requested = false): SessionFlow {
  if (flow.phase !== "running" || !requested && flow.contextAsked.includes(flow.activityIndex)) return flow;
  return addAi({...flow, contextAsked: [...new Set([...flow.contextAsked, flow.activityIndex])]}, "Hai bạn đang trao đổi phần nào, tiến độ đến đâu và có vướng gì không?", undefined, true, {form: "context"});
}

export function saveContext(flow: SessionFlow, value: SessionFlow["context"]): SessionFlow {
  const latest = flow.messages.at(-1);
  if (latest?.form !== "context" || !value.topic.trim()) return flow;
  const next = {...flow, context: value, messages: flow.messages.map(item => item.id === latest.id ? {...item, form: undefined, chosen: "Đã cập nhật"} : item)};
  const response = value.blocker === "đang bí" ? `Thử chia “${value.topic}” thành bước nhỏ nhất. Bước đầu hai bạn đã biết gì?`
    : value.blocker === "hơi vướng" ? `Hai bạn vướng cụ thể chỗ nào trong “${value.topic}”?`
    : `Đã ghi nhận “${value.topic}”. Mốc tiếp theo là kết thúc “${flow.activities[flow.activityIndex]?.title ?? "mục hiện tại"}”.`;
  return addAi(next, response, chips(["critique", "Gợi ý phản biện"], ["self", "Tiếp tục học"]), true);
}

export function askCritique(flow: SessionFlow, idea = flow.context.topic || flow.activities[flow.activityIndex]?.title || flow.goal): SessionFlow {
  const focus = idea.trim().slice(0, 120);
  if (flow.critiqueFocuses.includes(focus)) return addAi(flow, "Bạn đã xem ba hướng phản biện cho ý này. Hãy ghi ý mới trước khi hỏi tiếp.", chips(["context", "Cập nhật ý mới"], ["ack", "Đã rõ"]), true);
  return addAi({...flow, critiqueFocuses: [...flow.critiqueFocuses, focus]}, `Với ý “${focus}”, chọn một câu để tự kiểm tra.`, chips(["critique_assumption", "Giả định nào có thể sai?"], ["critique_compare", "Cách khác tốt hơn ở đâu?"], ["critique_evidence", "Bằng chứng nào kiểm tra ý này?"]), true);
}

export function saveCritique(flow: SessionFlow, explanation: string): SessionFlow {
  const latest = flow.messages.at(-1);
  if (latest?.form !== "critique" || !explanation.trim()) return flow;
  const next = {...flow, messages: flow.messages.map(item => item.id === latest.id ? {...item, form: undefined, chosen: "Đã giải thích"} : item)};
  return addAi(next, explanation.trim().length < 25 ? "Bạn thử thêm một ví dụ cụ thể để làm rõ lập luận nhé." : "Bạn đã nêu được lập luận. Hãy kiểm tra lại giả định hoặc ví dụ với bạn học.", undefined, true);
}

export function saveImprove(flow: SessionFlow, improve: string): SessionFlow {
  return {...flow, improve: improve.trim().slice(0, 160)};
}

function oneSecond(flow: SessionFlow): SessionFlow {
  if (flow.proposal?.status === "pending") {
    const remaining = flow.proposal.remainingSec - 1;
    flow = remaining <= 0
      ? addAi({...flow, proposal: {...flow.proposal, status: "rejected", remainingSec: 0}}, "Chưa có phản hồi. Hai bạn giữ timeline hiện tại.")
      : {...flow, proposal: {...flow.proposal, remainingSec: remaining}};
  }
  if (flow.phase === "idle" || flow.phase === "done" || flow.phase === "wrap") return flow;
  if (flow.phase === "lobby") {
    const seconds = Math.max(0, flow.untilStartSeconds - 1);
    if (seconds > 0) return {...flow, untilStartSeconds: seconds, untilStart: Math.ceil(seconds / 60)};
    const started = {...flow, phase: "running" as const, untilStart: 0, untilStartSeconds: 0};
    return flow.solo ? beginActivity(started, 0)
      : flow.partner === "present" ? beginActivity(started, 0)
      : {...started, remainingSec: 300};
  }
  if (flow.partner === "absent" && flow.phase === "running" && !flow.catchUp) {
    if (flow.soloWhileWaiting) {
      if (flow.remainingSec > 1) return {...flow, remainingSec: flow.remainingSec - 1};
      return addAi({...flow, remainingSec: 0, soloWhileWaiting: false}, "Bạn đã có phần tự học. Hãy gửi bạn học vài dòng tóm tắt khi sẵn sàng.", chips(["share", "Sửa và gửi cho bạn"]), true);
    }
    const waitingSeconds = flow.waitingSeconds + 1;
    const waitingMinutes = Math.floor(waitingSeconds / 60);
    let next = {...flow, waitingSeconds, waitingMinutes, remainingSec: waitingSeconds < 600 ? 300 - waitingSeconds % 300 : 0};
    return next;
  }
  const remainingSec = Math.max(0, flow.remainingSec - 1);
  let next = {...flow, remainingSec};
  return remainingSec === 0 ? beginActivity(next, next.activityIndex + 1) : next;
}

export function advanceSeconds(flow: SessionFlow, seconds = 1): SessionFlow {
  let next = flow;
  for (let i = 0; i < seconds; i++) next = oneSecond(next);
  return next;
}

export function advanceMinutes(flow: SessionFlow, minutes = 1): SessionFlow {
  return advanceSeconds(flow, minutes * 60);
}

export function endFlow(flow: SessionFlow): SessionFlow {
  return flow.phase === "wrap" || flow.phase === "done" ? flow : beginActivity(flow, flow.activities.length);
}

export function setPartner(flow: SessionFlow, partner: SessionFlow["partner"]): SessionFlow {
  if (flow.partner === partner) return flow;
  const next = {...flow, partner};
  return partner === "present" ? {...next, waitingMinutes: 0, waitingSeconds: 0, soloWhileWaiting: false} : next;
}

export function alignToElapsed(flow: SessionFlow, startsAt: string, now = Date.now()): SessionFlow {
  if (flow.phase !== "running" && flow.phase !== "break") return flow;
  if (flow.partner === "absent" && !flow.solo && !flow.catchUp) return flow;
  if (!Number.isFinite(Date.parse(startsAt))) return flow;
  let elapsed = Math.max(0, Math.floor((now - Date.parse(startsAt)) / 1000));
  let index = 0;
  while (index < flow.activities.length && elapsed >= flow.activities[index].minutes * 60) {
    elapsed -= flow.activities[index].minutes * 60;
    index += 1;
  }
  if (index >= flow.activities.length) return beginActivity(flow, index);
  return {...flow, phase: flow.activities[index].type === "break" ? "break" : "running", activityIndex: index,
    remainingSec: Math.max(1, flow.activities[index].minutes * 60 - elapsed), warnedTwoMinutes: index === flow.activityIndex ? flow.warnedTwoMinutes : false};
}

export function syncActivities(flow: SessionFlow, activities: Activity[], startsAt: string, now = Date.now()): SessionFlow {
  if (JSON.stringify(flow.activities) === JSON.stringify(activities)) return flow;
  const current = flow.activities[flow.activityIndex];
  const shifted = current && activities[flow.activityIndex]?.minutes === current.minutes + 5
    && activities[flow.activityIndex + 1]?.minutes === (flow.activities[flow.activityIndex + 1]?.minutes ?? 0) - 5;
  const next = alignToElapsed({...flow, activities}, startsAt, now);
  return addAi(next, shifted ? `Mốc “${current.title}” đã dời thêm 5 phút; giờ kết thúc phiên giữ nguyên.` : "Timeline đã được cập nhật cho cả hai.", undefined, true);
}

export function chooseChip(flow: SessionFlow, messageId: number, key: string, chatTail: string[] = []): SessionFlow {
  const latest = [...flow.messages].reverse().find(message => message.from === "ai");
  const chip = latest?.id === messageId && !latest.chosen ? latest.chips?.find(item => item.key === key) : undefined;
  if (!chip) return flow;
  let next = {...flow, messages: flow.messages.map(message => message.id === messageId ? {...message, chosen: chip.label, chips: undefined} : message)};
  switch (key) {
    case "opening_quiz": return startQuiz(next, "opening");
    case "catchup_quiz": return startQuiz(next, "catchup");
    case "catchup_summary": {
      const completed = next.activities.slice(0, next.activityIndex).map(item => item.title).join(", ");
      const recent = chatTail.filter(Boolean).slice(-2).map(line => `“${line.replace(/\s+/g, " ").slice(0, 95)}”`).join("; ");
      return addAi(next, `${completed ? `Đã qua: ${completed}.` : "Đây vẫn là mục đầu."} Hiện tại: “${next.activities[next.activityIndex]?.title ?? "tổng kết"}”${next.context.topic ? `, đang trao đổi ${next.context.topic}` : ""}. ${recent ? `Chat gần đây: ${recent}.` : "Bạn có thể xem chat gần đây để bắt kịp nội dung."}`, undefined, true);
    }
    case "read_chat": return addAi(next, `Bạn có thể đọc chat rồi tiếp tục mục “${next.activities[next.activityIndex]?.title ?? "hiện tại"}”.`, undefined, true);
    case "context": return askContext(next, true);
    case "critique": return askCritique(next);
    case "critique_assumption": case "critique_compare": case "critique_evidence": {
      const question = key === "critique_assumption" ? "Nếu giả định chính không đúng, ý này còn đứng vững không?"
        : key === "critique_compare" ? "Cách này hơn và kém cách khác ở điểm nào?"
        : "Bạn có ví dụ hoặc bằng chứng nào để kiểm tra ý này?";
      return addAi({...next, critiqueQuestion: question}, `${question} Hãy tự giải thích bằng lời của bạn trong 2 câu.`, undefined, true, {form: "critique"});
    }
    case "on_track": return addAi(next, "Đã ghi nhận. Hai bạn tiếp tục theo mốc hiện tại nhé.", undefined, true);
    case "behind": return addAi(next, `Bạn có thể chọn một phần nhỏ nhất của “${next.activities[next.activityIndex]?.title ?? "mục này"}” để hoàn thành trước.`, undefined, true);
    case "shift5": {
      const index = next.activityIndex;
      const buffer = next.budgetMinutes - next.activities.reduce((sum, item) => sum + item.minutes, 0);
      if (buffer < 5) return addAi(next, "Phần đệm không còn đủ 5 phút.", undefined, true);
      return addAi({...next, remainingSec: next.remainingSec + 300, activities: next.activities.map((item, i) => i === index ? {...item, minutes: item.minutes + 5} : item)}, `Đã dùng 5 phút đệm cho “${next.activities[index].title}”. Còn ${buffer - 5} phút đệm.`, undefined, true);
    }
    case "easy": case "medium": case "hard": return startQuiz({...next, level: key === "easy" ? "dễ" : key === "hard" ? "khó" : "vừa"}, "closing");
    case "question": return addAi(next, flow.solo ? "Bạn sẽ bắt đầu từ bước nào, và vì sao?" : "Hãy hỏi bạn học: ‘Bạn chọn bước đầu tiên nào, và vì sao?’", flow.solo ? undefined : chips(["share", "Sửa và gửi cho bạn"]), true);
    case "extend": {
      const index = next.activityIndex;
      const buffer = next.budgetMinutes - next.activities.reduce((sum, item) => sum + item.minutes, 0);
      if (buffer < 5) return addAi(next, "Phần đệm không còn đủ 5 phút.", undefined, true);
      return addAi({...next, remainingSec: next.remainingSec + 300, warnedTwoMinutes: true,
        activities: next.activities.map((item, i) => i === index ? {...item, minutes: item.minutes + 5} : item)},
      `Đã dùng 5 phút đệm cho “${next.activities[index].title}”. Còn ${buffer - 5} phút đệm.`, undefined, true);
    }
    case "next": return beginActivity(next, next.activityIndex + 1);
    case "quiz": return startQuiz(next, "opening");
    case "solo25": return addAi({...next, remainingSec: 25 * 60, soloWhileWaiting: true}, "Hãy học riêng 25 phút. Khi xong, gửi bạn học một tóm tắt ngắn.", undefined, true);
    case "happy": case "okay": case "tired": return addAi({...next, mood: key}, "Bạn có thể ghi một dòng cho buổi sau, hoặc bỏ qua.", chips(["rebook", "Hẹn buổi tiếp theo"], ["done", "Xong"]), true);
    case "done": return addAi({...next, phase: "done"}, "Hôm nay tính là ngày đạt ✓", undefined, true);
    case "on_time": return addAi(next, "Đã ghi nhận. Hẹn gặp bạn vào giờ học.", undefined, true);
    case "report": return addAi(next, "Bạn muốn báo giờ vào thế nào?", chips(["late10", "Trễ 10′"], ["cannot", "Không kịp"]), true);
    case "late10": return addAi(next, "Đã báo cho bạn học rằng bạn sẽ vào sau 10 phút.", undefined, true);
    case "accept_timeline": return decideTimeline(next, true);
    case "keep_timeline": return decideTimeline(next, false);
    case "undo_timeline": return undoTimeline(next);
    case "ack": case "wait": case "self": return next;
    default: return next;
  }
}
