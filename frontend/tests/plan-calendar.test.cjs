const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, react = React) {
  if (file.endsWith('.css')) return { default: new Proxy({}, {get: (_, key) => String(key)}), __esModule: true };
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, Date, Intl, Set, console, process: {env: {}}, require(name) {
    if (name === 'react') return react;
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
    return load([base, base + '.ts', base + '.tsx'].find(fs.existsSync), react);
  }});
  return module.exports;
}
const Calendar = load(path.join(root, 'features/study-plan/components/PlanCalendar.tsx')).default;
const SingleCalendar = load(path.join(root, 'features/study-plan/components/PlanCalendar.tsx'), {...React, useState: value => React.useState(value === 'dual' ? 'single' : value)}).default;
const {scheduleEvents} = load(path.join(root, 'features/study-plan/components/StudySchedule.tsx'));
const PlanInput = load(path.join(root, 'features/study-plan/components/PlanInput.tsx')).default;
const item = {id: 'own', user_id: 1, concept_id: 'advanced', action: 'Học nâng cao', expected_output: 'Viết được hàm', est_minutes: 45, status: 'DEFERRED', scheduled_start: null};
function render(overrides = {}, Component = Calendar) {
  return renderToStaticMarkup(React.createElement(Component, {
    view: {goal: 'Python', timezone: 'Asia/Ho_Chi_Minh', plan: {items: [], deferred_items: [item]}, partner: {user_id: 2, goal: 'SQL', items: [{...item, id: 'peer', user_id: 2, action: 'Buổi của Mai'}]}},
    setup: {members: [], concepts: [{id: 'basic', action: 'Cú pháp cơ bản'}, {id: 'advanced', prerequisites: ['basic']}]},
    userId: 1, partnerName: 'Mai', busy: false, onSave: async () => true, onComment() {}, ...overrides,
  }));
}
test('Shared calendar renders two calendars and hides the session sidebar', () => {
  const html = render();
  assert.match(html, /Lịch của tôi/); assert.match(html, /Lịch của Mai/);
  assert.match(html, /Lịch chung/); assert.match(html, /ownCalendar/);
  assert.doesNotMatch(html, /<aside|>Gán ngày</);
});
test('Only peer calendar has a review button', () => {
  const html = render();
  assert.equal((html.match(/>Nhận xét lịch</g) || []).length, 1);
  const ownSection = html.slice(html.indexOf('calendarPerson ownCalendar'), html.indexOf('study-fullcalendar-peer'));
  assert.doesNotMatch(ownSection, /Nhận xét lịch/);
  assert.doesNotMatch(html, /Ngày đệm/);
});
test('Separate view exposes the session queue, assignment and prerequisite order', () => {
  const html = render({}, SingleCalendar);
  assert.match(html, /<aside/); assert.match(html, /Chưa gán ngày/);
  assert.match(html, /Cú pháp cơ bản/); assert.match(html, />Gán ngày</);
  assert.doesNotMatch(html, /Nhận xét lịch/);
});
test('Completed blocks cannot be assigned again', () => {
  const html = render({view: {plan: {items: [{...item, status: 'COMPLETED'}], deferred_items: []}, partner: null}}, SingleCalendar);
  assert.doesNotMatch(html, />Gán ngày</);
  assert.match(html, /Đã hoàn thành/);
});
test('Library events exclude queued sessions and preserve scheduled times and completion', () => {
  const scheduled = {...item, scheduled_start: '2030-01-07T12:00:00Z', scheduled_end: '2030-01-07T12:45:00Z', status: 'COMPLETED'};
  const events = scheduleEvents([item, scheduled], false);
  assert.equal(events.length, 1);
  assert.equal(events[0].start, scheduled.scheduled_start);
  assert.equal(events[0].end, scheduled.scheduled_end);
  assert.equal(events[0].classNames[0], 'study-event-completed');
  assert.equal(scheduleEvents([scheduled, {...scheduled, id: 'repeat'}], true).length, 1);
  assert.equal(scheduleEvents([scheduled], true)[0].title, scheduled.expected_output);
});
test('Input form only shows authenticated owner, three input groups and optional hours', () => {
  const html = renderToStaticMarkup(React.createElement(PlanInput, {setup: {members: [{user_id: 1, display_name: 'Tên của tôi', goals: ['Học Python'], availability: []}, {user_id: 2, display_name: 'Người kia', goals: ['Mục tiêu riêng của người kia'], availability: []}]}, userId: 1, pair: 9, busy: false, onSubmit() {}}));
  assert.match(html, /Học Python/);
  assert.match(html, /Nền tảng hiện tại/);
  assert.match(html, /Ngày có thể học/);
  assert.match(html, /không bắt buộc/);
  assert.match(html, /Tạo kế hoạch của tôi/);
  assert.doesNotMatch(html, /Người kia|Mục tiêu riêng của người kia|Phút cam kết|Nơi học|Chọn concept|INNER JOIN/);
});
