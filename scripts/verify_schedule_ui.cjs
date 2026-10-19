const {chromium}=require('../logs/ui-qa/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Ho_Chi_Minh',locale:'vi-VN'});const page=await ctx.newPage();const errors=[];const checks=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://localhost:3001',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Đăng nhập',exact:true}).first().click();await page.locator('input[name=email]').fill('demo.minhanh@peerbridge.local');await page.locator('input[name=password]').fill('PeerBridgeDemo2026!');await page.locator('.auth-form .primary').click();await page.locator('.product-overview').waitFor();
  if(await page.locator('.icebreaker').count())throw Error('Icebreaker shown on overview');checks.push('no repeated overview icebreaker');
  await page.getByRole('button',{name:'Kế hoạch',exact:true}).first().click();await page.locator('.edit-schedule-button').last().click();
  const editor=page.locator('.schedule-editor');const input=editor.locator('input[name=schedule_time]');const day=editor.locator('input[name=schedule_date]');const original=(await day.inputValue()).split('/').reverse().join('-')+'T'+await input.inputValue();
  const shifted=await page.evaluate(value=>{const d=new Date(value);d.setMinutes(d.getMinutes()+15);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`},original);
  await day.fill(shifted.split("T")[0].split("-").reverse().join("/"));await input.fill(shifted.split("T")[1]);await page.screenshot({path:'logs/ui-qa/schedule-editor.png',fullPage:true,animations:"disabled"});
  await editor.getByRole('button',{name:'Lưu lịch mới',exact:true}).click();await page.getByText('Đã lưu lịch mới. Xem lại và cam kết với phiên bản này.',{exact:true}).waitFor();
  await page.locator('.edit-schedule-button').last().click();if(await page.locator('.schedule-editor input[name=schedule_time]').inputValue()!==shifted.split('T')[1])throw Error('Schedule not saved');
  await page.locator('.schedule-editor input[name=schedule_date]').fill(original.split('T')[0].split('-').reverse().join('/'));await page.locator('.schedule-editor input[name=schedule_time]').fill(original.split('T')[1]);await page.getByRole('button',{name:'Lưu lịch mới',exact:true}).click();await page.getByText('Đã lưu lịch mới. Xem lại và cam kết với phiên bản này.',{exact:true}).waitFor();
  const border=await page.locator('section').filter({has:page.getByText('🗓️ Lịch học của bạn',{exact:true})}).last().evaluate(e=>getComputedStyle(e).borderTopWidth);if(border!=='2px')throw Error(`Unexpected border ${border}`);checks.push('schedule editor saves and own border emphasized');
  await page.getByRole('button',{name:'Check-in',exact:true}).first().click();const image=page.locator('.uploaded-checkin-image').first();await image.waitFor();await page.waitForFunction(()=>{const image=document.querySelector('.uploaded-checkin-image');return image&&image.naturalWidth>0;});await page.screenshot({path:'logs/ui-qa/uploaded-checkin.png',fullPage:true,animations:"disabled"});checks.push('uploaded partner image renders with natural dimensions');
  const timestamp=await page.locator('[class*="history"] small').first().textContent();if(!/\d{2}\/\d{2}\/\d{4} · \d{2}:\d{2}/.test(timestamp))throw Error('Inconsistent time');checks.push('24 hour dd/MM/yyyy timestamps');
  await page.goto('http://localhost:3001/#profile');await page.reload();await page.locator('.profile-form').waitFor();await page.getByLabel('Mục tiêu học tập của tôi',{exact:true}).waitFor();const text=await page.locator('.profile-form').innerText();if(/[Ã�]/.test(text))throw Error('Vietnamese encoding corrupted');await page.screenshot({path:'logs/ui-qa/profile-vietnamese.png',fullPage:true,animations:"disabled"});checks.push('Vietnamese profile labels and editable goal');
  if(errors.length)throw Error(errors.join(';'));fs.writeFileSync('logs/ui-qa/schedule-ui-result.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({passed:true,checks}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exit(1)});
