const assert = require("node:assert/strict");
const {readFileSync} = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function load(name) {
  const exports = {};
  const file = path.join(__dirname, "../../lib", name + ".ts");
  const {outputText} = ts.transpileModule(readFileSync(file,"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS}});
  vm.runInNewContext(outputText,{exports,Date,Intl,RangeError,require: name=>load(name.replace("./", ""))});
  return exports;
}
const {calendarDays, calendarSlot, isAvailable} = load("session-calendar");
const {localInputToISO} = load("time");

test("Calendar day and selected time use Vietnam timezone across device timezones",()=>{
  const previous = process.env.TZ;
  try {
    for (const zone of ["UTC", "America/Los_Angeles", "Asia/Tokyo"]) {
      process.env.TZ = zone;
      assert.deepEqual(Array.from(calendarDays(new Date("2026-10-11T18:30:00Z"),0)), ["2026-10-12","2026-10-13","2026-10-14"]);
      assert.equal(localInputToISO(calendarSlot("2026-10-12",8)), "2026-10-12T01:00:00.000Z");
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test("Calendar checks the full duration in each person's own timezone",()=>{
  const windows = [{day_of_week:0,start_time:"09:00",end_time:"10:00",timezone:"Asia/Tokyo"}];
  assert.equal(isAvailable(windows,"2026-10-12T07:00",50),true);
  assert.equal(isAvailable(windows,"2026-10-12T07:00",75),false);
  assert.equal(isAvailable(windows,"2026-10-12T09:00",50),false);
  assert.equal(isAvailable([],"2026-10-12T07:00",50),false);
  assert.equal(isAvailable([{...windows[0], timezone:"invalid/timezone"}],"2026-10-12T07:00",50),false);
});
