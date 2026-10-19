const {chromium}=require('../logs/ui-qa/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const results=[];
 try{
  for(const slug of ['minhanh','buddy04']){
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});const page=await ctx.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://localhost:3001',{waitUntil:'networkidle'});
   await page.getByRole('button',{name:'Đăng nhập',exact:true}).first().click();
   await page.locator('input[name=email]').fill(`demo.${slug}@peerbridge.local`);
   await page.locator('input[name=password]').fill('PeerBridgeDemo2026!');
   await page.locator('.auth-form .primary').click();await page.locator('.product-overview').waitFor();
   await page.getByRole('button',{name:'Tìm bạn',exact:true}).first().click();await page.locator('.candidate-card').first().waitFor();
   const count=await page.locator('.candidate-card').count();if(count!==15)throw Error(`Expected15 got${count}`);
   if(!await page.locator('.buddy-avatar').first().textContent())throw Error('Missing icon');
   await page.screenshot({path:`logs/ui-qa/matching-15-${slug}.png`});
   if(errors.length)throw Error(errors.join(';'));
   results.push({user:slug,count,first:await page.locator('.candidate-card h2').first().textContent()});await ctx.close();
  }
  if(results[0].first===results[1].first)throw Error('Same first choice');console.log(JSON.stringify({passed:true,results}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exit(1)});
