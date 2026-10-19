// Fake HTTP responses exercise rendered UI and the actual API client; no live provider.
const assert = require("node:assert/strict");
const {existsSync, readFileSync} = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const React = require("react");
const {act, create} = require("react-test-renderer");
const ts = require("typescript");
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname,"../..");
const json = (body,status=200) => new Response(JSON.stringify(body),{status});
const peer = {peer_match_id:9, requester_id:1, recipient_id:2,peer:{user_id:2,display_name:"Partner"}};
const setup = {pair_id:9,catalog_source:"demo",provider_mode:"fake",concepts:[],resources:{},members:[1,2].map(id=>({user_id:id,display_name:`Person ${id}`,goals:["SQL"],availability:[]}))};
const item = {id:"stable-item",user_id:1,pair_id:9,plan_version:1,concept_id:"sql.select",action:"Write five queries",expected_output:"Five results",est_minutes:30,status:"SCHEDULED",scheduled_start:"2030-01-07T12:00:00Z",scheduled_end:"2030-01-07T12:30:00Z",if_then_text:"Nếu 07/01/2030 lúc 19:00 thì Write five queries",resource_ids:[]};
const plan = {user_id:1,pair_id:9,plan_version:1,partial:true,items:[item],deferred_items:[{...item,id:"deferred",concept_id:"sql.join",status:"DEFERRED",action:"Practice joins",scheduled_start:null,scheduled_end:null,if_then_text:null,defer_reason:"PREREQUISITE_DEFERRED"}],warnings:[{code:"PARTIAL_PLAN",message:"Một phần mục tiêu chưa được xếp"}]};
const proposal = {id:20,status:"DRAFT",expected_version:1,reason:"Reduce load",cutoff:"2030-01-07T13:00:00Z",budget:[{week_start:"2030-01-07",baseline_minutes:144,completed_minutes:30,remaining_minutes:114,proposed_limit_minutes:91}],before:plan,after:{...plan,plan_version:2}};
const view = {id:10,plan,timezone:"Asia/Ho_Chi_Minh",goal:"SQL basics",resources:{},catalog_source:"demo",provider_mode:"fake",partner:{user_id:2,goal:"Python basics",version:1,scheduled_count:3,completed_count:1,deferred_count:0,partial:false},proposal};
const text = node => node == null ? "" : typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(text).join("") : text(node.children);
<<<<<<< HEAD

function runtime(fetch) {
=======
const mounted = new Set();
test.afterEach(async () => {
  for (const renderer of mounted) await act(async () => renderer.unmount());
  mounted.clear();
});

function runtime(fetch) {
  const realFetch = fetch;
  fetch = (url, options) => url.endsWith("/commitments") ? Promise.resolve(json({mine:false,partner:false,both:false}))
    : url.endsWith("/notes") ? Promise.resolve(json({items:[]})) : realFetch(url, options);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    if (file.endsWith(".css")) return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
    const module = {exports:{}}; cache.set(file,module);
    const {outputText} = ts.transpileModule(readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}});
<<<<<<< HEAD
    vm.runInNewContext(outputText,{module,exports:module.exports,fetch,crypto:require("node:crypto").webcrypto,JSON,Error,TypeError,Date,process:{env:{NEXT_PUBLIC_API_URL:"http://backend.test"}},require(name){
=======
    vm.runInNewContext(outputText,{module,exports:module.exports,fetch,crypto:require("node:crypto").webcrypto,JSON,Error,TypeError,Date,setInterval,clearInterval,process:{env:{NEXT_PUBLIC_API_URL:"http://backend.test"}},require(name){
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
      if (name === "react") return React;
      if (name === "react/jsx-runtime") return require(name);
      const base = name.startsWith("@/") ? path.join(root,name.slice(2)) : path.resolve(path.dirname(file),name);
      const target = [base,`${base}.ts`,`${base}.tsx`].find(existsSync);
      assert.ok(target,name); return load(target);
    }},{filename:file});
    return module.exports;
  }
  return load;
}

async function mount(fetch) {
<<<<<<< HEAD
  const Component = runtime(fetch)(path.join(root,"legacy/components/StudyPlan.tsx")).default;
  let renderer;
  await act(async()=> {renderer = create(React.createElement(React.StrictMode,null,React.createElement(Component,{token:"test-token",userId:1,onConnections(){}})));});
=======
  const Component = runtime(fetch)(path.join(root,"features/study-plan/components/StudyPlan.tsx")).default;
  let renderer;
  await act(async()=> {renderer = create(React.createElement(React.StrictMode,null,React.createElement(Component,{token:"test-token",userId:1,onConnections(){}})));});
  mounted.add(renderer);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  return renderer;
}
const button = (r,label) => r.root.findAllByType("button").find(b=>text(b)===label);

test("Plan API sends Bearer, stable request key and exact confirmation version",async()=>{
  const calls=[];
  const {api} = runtime(async(url,options)=>{calls.push({url,options});return json({applied:true});})(path.join(root,"lib/api.ts"));
  const payload={pair_id:9,members:[],horizon_days:7};
  await api.generatePlan("test-token",payload,"retry-key");
  await api.generatePlan("test-token",payload,"retry-key");
  await api.decideReplan("test-token",9,20,1,true);
  assert.equal(calls[0].options.headers["Idempotency-Key"],"retry-key");
  assert.equal(calls[1].options.headers["Idempotency-Key"],"retry-key");
  assert.equal(calls[0].options.headers.Authorization,"Bearer test-token");
  assert.deepEqual(JSON.parse(calls[0].options.body),payload);
  assert.equal(calls[2].url,"http://backend.test/api/v1/plans/9/proposals/20/accept");
  assert.deepEqual(JSON.parse(calls[2].options.body),{expected_version:1});
});

test("Plan empty state offers existing connections flow",async()=>{
  const r = await mount(async()=>json({connected:[]}));
  assert.match(text(r.toJSON()),/Chưa có bạn đồng hành/);
  assert.ok(button(r,"Xem kết nối"));
  await act(async()=>r.unmount());
});

test("Plan renders own schedule, deferred reason, partial warning, partner summary and confirms once",async()=>{
  let posts=0, resolve, accepted=false;
  const pending = new Promise(r=>{resolve=r;});
  const r = await mount(async(url,options)=>{
    assert.equal(options.headers.Authorization,"Bearer test-token");
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json(setup);
    if (options.method === "POST") {posts++; assert.deepEqual(JSON.parse(options.body),{expected_version:1});await pending; accepted=true;return json({applied:true});}
    return json(accepted ? {...view,proposal:null,plan:{...plan,plan_version:2}} : view);
  });
  const output=text(r.toJSON());
  assert.match(output,/Write five queries/); assert.match(output,/Cần học việc tiên quyết trước/);
  assert.match(output,/Một phần mục tiêu/); assert.match(output,/Python basics/);
  assert.match(output,/Phương án chưa áp dụng/);
  assert.match(output,/còn 114 phút → phương án tối đa 91 phút/);
  const confirm=button(r,"Chấp nhận phương án");
  await act(async()=>{confirm.props.onClick();confirm.props.onClick();});
  assert.equal(posts,1);
  await act(async()=>{resolve();await pending;});
  assert.doesNotMatch(text(r.toJSON()),/Phương án chưa áp dụng/);
  assert.match(text(r.toJSON()),/Đã áp dụng phương án/);
  await act(async()=>r.unmount());
});

test("Plan failed read can retry and recovers",async()=>{
  let failed=true;
  const r = await mount(async url=>url.endsWith("/connections")?json({connected:[peer]}):url.endsWith("/setup")?json(setup):failed?json({detail:"Temporary failure"},503):json({...view,proposal:null}));
  assert.match(text(r.toJSON()),/Temporary failure/);
  failed=false;
  await act(async()=>button(r,"Thử lại").props.onClick());
  assert.match(text(r.toJSON()),/SQL basics/);
  assert.doesNotMatch(text(r.toJSON()),/Temporary failure/);
  await act(async()=>r.unmount());
});

<<<<<<< HEAD
=======
test("Empty catalog disables plan creation without crashing", async()=>{
  let posts = 0;
  const r = await mount(async(url, options)=>{
    if (options.method === "POST") posts++;
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json(setup);
    return json({plan:null,proposal:null,partner:null});
  });
  assert.match(text(r.toJSON()), /Danh mục nội dung học chưa sẵn sàng/);
  assert.equal(r.root.findByType("fieldset").props.disabled, true);
  await act(async()=>r.root.findByType("form").props.onSubmit({preventDefault(){}}));
  assert.equal(posts, 0);
});

test("Plan requires explicit targets rather than guessing from profile goals", async()=>{
  let posts = 0;
  const r = await mount(async(url, options)=>{
    if (options.method === "POST") posts++;
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json({...setup,concepts:[{id:"sql.join",action:"Practice joins"}]});
    return json({plan:null,proposal:null,partner:null});
  });
  const selects = r.root.findAllByType("select").filter(s=>s.props.required);
  assert.equal(selects.length, 2);
  assert.ok(selects.every(s=>s.props.value === ""));
  await act(async()=>r.root.findByType("form").props.onSubmit({preventDefault(){}}));
  assert.match(text(r.toJSON()), /Chọn mục tiêu và nội dung học cho cả hai người/);
  assert.equal(posts, 0);
});

>>>>>>> 29066618049be865e9daa585fed068c149bc780f
test("Plan generation blocks double submit, shows API failure and reuses its key when retried",async()=>{
  const posts=[];
  let resolve, saved=false, failing=true;
  const pending = new Promise(r=>{resolve=r;});
  const r = await mount(async(url,options)=>{
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json({...setup,concepts:[{id:"sql.join",action:"Practice joins"}]});
    if (options.method === "POST") {
      posts.push(options);
      await pending;
      if (failing) return json({detail:"TASK_SCHEMA: Không lập được kế hoạch hợp lệ"},422);
      saved=true;
      return json({version:1,partial:true});
    }
    return json(saved ? {...view,proposal:null} : {plan:null,proposal:null,partner:null});
  });
  const selects=r.root.findAllByType("select").filter(s=>s.props.required);
  await act(async()=>{selects.forEach(s=>s.props.onChange({target:{value:"sql.join"}}));});
  const form=r.root.findByType("form");
  await act(async()=>{form.props.onSubmit({preventDefault(){}});form.props.onSubmit({preventDefault(){}});});
  assert.equal(posts.length,1);
  assert.equal(button(r,"Đang tạo…").props.disabled,true);
  await act(async()=>{resolve();await pending;});
  assert.match(text(r.toJSON()),/TASK_SCHEMA/);
  assert.doesNotMatch(text(r.toJSON()),/Đã lưu kế hoạch/);
<<<<<<< HEAD
  assert.equal(button(r,"Tạo hai kế hoạch").props.disabled,false);
=======
  assert.equal(button(r,"✨ Gợi ý kế hoạch cho hai bạn").props.disabled,false);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  failing=false;
  await act(async()=>{r.root.findByType("form").props.onSubmit({preventDefault(){}});});
  assert.equal(posts.length,2);
  assert.equal(posts[0].headers["Idempotency-Key"],posts[1].headers["Idempotency-Key"]);
  assert.equal(posts[0].body,posts[1].body);
  assert.match(text(r.toJSON()),/Đã lưu kế hoạch/);
<<<<<<< HEAD
  assert.match(text(r.toJSON()),/Plan của bạn/);
=======
  assert.match(text(r.toJSON()),/Lịch học của bạn/);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  await act(async()=>r.unmount());
});

test("Plan failed confirmation keeps its draft and does not report success",async()=>{
  const r = await mount(async(url,options)=>{
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json(setup);
    if (options.method === "POST") return json({detail:"PROGRESS_CHANGED: Tạo lại phương án"},409);
    return json(view);
  });
  await act(async()=>button(r,"Chấp nhận phương án").props.onClick());
  assert.match(text(r.toJSON()),/PROGRESS_CHANGED/);
  assert.match(text(r.toJSON()),/Phương án chưa áp dụng/);
  assert.doesNotMatch(text(r.toJSON()),/Đã áp dụng phương án/);
  assert.equal(button(r,"Chấp nhận phương án").props.disabled,false);
  await act(async()=>r.unmount());
});

test("Plan labels pending notification separately from success and failure",async()=>{
  const r = await mount(async(url,options)=>{
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json(setup);
    if (options.method === "POST") return json({action:"reminder",reason:"ELIGIBLE",text:"Một việc nhỏ hôm nay",sent:false,delivery_status:"PENDING"});
    return json(view);
  });
<<<<<<< HEAD
  await act(async()=>button(r,"Kiểm tra hỗ trợ").props.onClick());
=======
  await act(async()=>button(r,"Gợi ý cách giữ nhịp").props.onClick());
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  assert.match(text(r.toJSON()),/Đang chờ kênh gửi xác nhận/);
  assert.doesNotMatch(text(r.toJSON()),/Đã gửi thành công|Gửi thất bại|Gửi chưa thành công/);
  await act(async()=>r.unmount());
});

test("Plan read loading stays visible until API finishes and does not hide its error",async()=>{
  let resolve;
  const pending = new Promise(r=>{resolve=r;});
  const r = await mount(async url=>{
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json(setup);
    await pending;
    return json({detail:"Read unavailable"},503);
  });
  assert.match(text(r.toJSON()),/Đang tải kế hoạch/);
  assert.equal(button(r,"Làm mới").props.disabled,true);
  await act(async()=>{resolve();await pending;});
  assert.match(text(r.toJSON()),/Read unavailable/);
  assert.doesNotMatch(text(r.toJSON()),/Đang tải kế hoạch|Đã lưu kế hoạch/);
  assert.ok(button(r,"Thử lại"));
  await act(async()=>r.unmount());
});

test("Plan previews a replan then rejects once and retains current version",async()=>{
  const posts=[];
  let draft=false, resolve;
  const pending = new Promise(r=>{resolve=r;});
  const r = await mount(async(url,options)=>{
    if (url.endsWith("/connections")) return json({connected:[peer]});
    if (url.endsWith("/setup")) return json(setup);
    if (options.method === "POST") {
      posts.push({url,options});
      if (url.endsWith("/replan")) {draft=true;return json(proposal);}
      assert.ok(url.endsWith("/proposals/20/reject"));
      await pending;draft=false;return json({applied:false,duplicate:false});
    }
    return json({...view,proposal:draft?proposal:null});
  });
  await act(async()=>button(r,"Xem phương án giảm tải 20%").props.onClick());
  assert.match(text(r.toJSON()),/Trước và sau theo từng việc|Điều chỉnh v1 → v2/);
  assert.equal(posts[0].url,"http://backend.test/api/v1/plans/9/replan");
  const reject=button(r,"Giữ kế hoạch hiện tại");
  await act(async()=>{reject.props.onClick();reject.props.onClick();});
  assert.equal(posts.length,2);
  assert.equal(button(r,"Chấp nhận phương án").props.disabled,true);
  assert.deepEqual(JSON.parse(posts[1].options.body),{expected_version:1});
  await act(async()=>{resolve();await pending;});
  assert.doesNotMatch(text(r.toJSON()),/Phương án chưa áp dụng/);
<<<<<<< HEAD
  assert.match(text(r.toJSON()),/Giữ kế hoạch đang dùng|Plan của bạn · v1/);
=======
  assert.match(text(r.toJSON()),/Giữ kế hoạch đang dùng|Lịch của bạn · v1/);
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  await act(async()=>r.unmount());
});

for (const operation of ["create","reject"]) {
  test(`Plan failed replan ${operation} reports error without success`,async()=>{
    const r = await mount(async(url,options)=>{
      if (url.endsWith("/connections")) return json({connected:[peer]});
      if (url.endsWith("/setup")) return json(setup);
      if (options.method === "POST") return json({detail:"Replan unavailable"},503);
      return json({...view,proposal:operation==="reject"?proposal:null});
    });
    await act(async()=>button(r,operation==="reject"?"Giữ kế hoạch hiện tại":"Xem phương án giảm tải 20%").props.onClick());
    assert.match(text(r.toJSON()),/Replan unavailable/);
    assert.doesNotMatch(text(r.toJSON()),/Đã tạo phương án|Giữ kế hoạch đang dùng|Đã áp dụng phương án/);
    if (operation==="reject") assert.match(text(r.toJSON()),/Phương án chưa áp dụng/);
    await act(async()=>r.unmount());
  });
}

<<<<<<< HEAD
for (const [variant,source,expected] of [["ai","ai",/Nhóm: AI.*Nội dung: AI mô phỏng soạn/],["ai","template",/Nhóm: AI.*Nội dung: mẫu Coach/],["template","template",/Nhóm: mẫu.*Nội dung: mẫu Coach/]]) {
=======
for (const [variant,source,expected] of [["ai","ai",/AI mô phỏng/],["ai","template",/Gợi ý theo mẫu/],["template","template",/Gợi ý theo mẫu/]]) {
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  test(`Coach displays assignment ${variant} separately from message source ${source}`,async()=>{
    const r=await mount(async(url,options)=>{
      if(url.endsWith("/connections")) return json({connected:[peer]});
      if(url.endsWith("/setup")) return json(setup);
      if(options.method==="POST") return json({action:"replan",reason:"ELIGIBLE",variant,message_source:source,text:"Lời nhắc thử",sent:false,delivery_status:"SIMULATED",selection:{provider_mode:"fake"}});
      return json(view);
    });
<<<<<<< HEAD
    await act(async()=>button(r,"Kiểm tra hỗ trợ").props.onClick());
=======
    await act(async()=>button(r,"Gợi ý cách giữ nhịp").props.onClick());
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
    assert.match(text(r.toJSON()),expected);
    assert.match(text(r.toJSON()),/Mô phỏng/);
    assert.doesNotMatch(text(r.toJSON()),/Đã gửi thành công/);
    await act(async()=>r.unmount());
  });
}
