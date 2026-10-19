const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file) {
  const module = {exports: {}};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code, {module, exports: module.exports, process: {env: {}}, require(name) {
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name);
    return load([base, base + '.ts', base + '.tsx'].find(fs.existsSync));
  }});
  return module.exports;
}
const {default: Card, candidatePage, goalDuration, friendlyScores} = load(path.join(root, 'features/peer-connections/components/MatchCandidateCard.tsx'));
const candidate = {candidate_id: 1, display_name: 'Mai', major: 'CNTT', school: 'FPT', learning_goals: ['Học Python'], goal_duration_days: 60, total_score: 59, reasons: ['Waterfall Legacy score'], component_scores: {style: 0.5}, match_tier: 'tier_3_discipline'};
test('Card emphasizes the goal after identity and hides technical explanations and scores', () => {
  const html = renderToStaticMarkup(React.createElement(Card, {candidate, action: React.createElement('button', null, 'Cùng học')}));
  assert.ok(html.indexOf('Mai') < html.indexOf('Học Python'));
  assert.match(html, /Thời gian mục tiêu/); assert.match(html, /2 tháng/);
  assert.match(html, /Vì sao hợp/); assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /Waterfall|Legacy|59\/100|component_scores|deadline gấp|Trao đổi thêm về giờ/);
  assert.doesNotMatch(html, /role="dialog"/);
  assert.match(html, /Xem chi tiết/);
  assert.match(html, /Hỗ trợ hai chiều/);
  assert.match(html, /Kiểu ghép/);
  assert.doesNotMatch(html, /Cùng giữ nhịp/);
});
test('Friendly scores preserve zero, distinguish missing data and hide old score fields', () => {
  const rows = friendlyScores({component_scores: {concept_score: 0, style_score: 0.5, goal_score: 0.72, availability_overlap: 0.8}});
  assert.deepEqual(Array.from(rows, row => row.score), [0, 50, 72]);
  assert.equal(friendlyScores({component_scores: {}})[0].score, null);
  assert.equal(friendlyScores({component_scores: {style_score: NaN}})[1].score, null);
});
test('Pagination shows three profiles, preserves order, and clamps after result changes', () => {
  assert.deepEqual(Array.from(candidatePage([1,2,3,4,5,6,7], 0).visibleCandidates), [1,2,3]);
  assert.deepEqual(Array.from(candidatePage([1,2,3,4,5,6,7], 1).visibleCandidates), [4,5,6]);
  assert.deepEqual(Array.from(candidatePage([1,2,3,4,5,6,7], 2).visibleCandidates), [7]);
  assert.equal(candidatePage([1], 4).currentPage, 0);
  assert.equal(candidatePage([], 0).pageCount, 1);
});
test('Duration uses known profile length; missing lengths are not invented', () => {
  assert.equal(goalDuration({goal_duration_days: 21}), '3 tuần');
  assert.equal(goalDuration({goal_duration_days: 12}), '12 ngày');
  assert.equal(goalDuration({deadline_level: 'vua'}), '15–45 ngày');
  assert.equal(goalDuration({}), 'Chưa đặt thời hạn');
});
