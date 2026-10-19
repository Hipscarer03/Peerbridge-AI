const { chromium } = require('../logs/ui-qa/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const out = path.join(__dirname, '../logs/ui-qa');
fs.mkdirSync(out, { recursive: true });
const failures = [];
const results = [];
async function login(page, email) {
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).first().click();
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill('PeerBridgeDemo2026!');
  await page.locator('.auth-form .primary').click();
  await page.locator('.product-overview').waitFor({ timeout: 30010 });
}
async function shot(page, name) {
  await page.screenshot({ path: path.join(out, name+'.png'), fullPage: true });
}
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const context = await browser.newContext({ viewport: { width:1440, height:1000 } });
  const page = await context.newPage();
  page.on('pageerror', e => failures.push(e.message));
  page.on('response', r => { if(r.url().startsWith('http://127.0.0.1:8000') && r.status()>=500) failures.push(`${r.status()} ${r.url()}`); });
  try {
    await login(page,'demo.minhanh@peerbridge.local');
    if(await page.locator('.role-switch').count()) throw new Error('Role switch still shown');
    await page.locator('.daily-card').waitFor();
    await shot(page,'01-overview'); results.push('overview daily progress, partner, no role switch');
    await page.getByRole('button',{name:'Tìm bạn',exact:true}).first().click();
    await page.locator('.candidate-card').first().waitFor();
    if(!(await page.locator('.candidate-goal').count()))throw new Error('No highlighted goals');
    await shot(page,'02-matching'); results.push('matching goal cards, availability, grounded reasons');
    await page.getByRole('button',{name:'Kế hoạch',exact:true}).first().click();
    await page.locator('.commit-banner').waitFor();
    await page.getByRole('heading',{name:'🤝 Hai bạn đã cùng cam kết',exact:true}).waitFor();
    await shot(page,'03-plan'); results.push('real generated plan and both commitments');
    await page.getByRole('button',{name:'Check-in',exact:true}).first().click();
    await page.getByRole('heading',{name:'Lưu một buổi học, giữ một lời hứa',exact:true}).waitFor();
    await page.locator('.journey-card').waitFor();
    await shot(page,'04-checkin'); results.push('study locket, real check-in and friendship milestone');
    await page.getByRole('button',{name:'Phiên học',exact:true}).first().click();
    await page.locator('.calendar-slot.free-both:not(:disabled)').first().waitFor();
    await page.getByRole('button',{name:'25 phút',exact:true}).click();
    await page.getByRole('button',{name:'🤖 Gợi ý mục tiêu',exact:true}).click();
    await page.locator('.calendar-slot.free-both:not(:disabled)').first().click();
    await shot(page,'05-booking');
    await page.getByRole('button',{name:'Đặt lịch học cùng →',exact:true}).click();
    await page.locator('.form-success').waitFor();
    await page.locator('.session-list-product article').first().getByRole('button',{name:'Vào phòng học →'}).click();
    await page.locator('.focus-timer').waitFor();
    await page.getByText('Hai bạn có thể nhắn tin và chia sẻ điều đang vướng.',{exact:true}).waitFor({timeout:30010});
    await page.getByRole('button',{name:'Bắt đầu tập trung',exact:true}).click();
    await page.locator('.icebreaker').getByRole('button').filter({hasText:'Chào Quốc Huy'}).first().click();
    const input=page.getByRole('textbox',{name:'Message'});
    if(!(await input.inputValue()).includes('Quốc Huy'))throw new Error('Icebreaker not copied to draft');
    await input.fill('Chào bạn! Mình sẽ tập giới thiệu bản thân trong 2 phút hôm nay.');
    await page.getByRole('button',{name:'Send message',exact:true}).click();
    await page.getByText('Chào bạn! Mình sẽ tập giới thiệu bản thân trong 2 phút hôm nay.',{exact:true}).waitFor({timeout:30010});
    await shot(page,'06-study-room'); results.push('booking shared availability, goal suggestion, timer, icebreaker draft, WebSocket chat');
    await page.reload({waitUntil:'networkidle'});
    await page.getByText('Chào bạn! Mình sẽ tập giới thiệu bản thân trong 2 phút hôm nay.',{exact:true}).waitFor({timeout:30010});
    results.push('chat history restored after reload');
    await page.getByRole('button',{name:'Kết thúc & check-in',exact:true}).click();
    await page.getByRole('heading',{name:'Lưu một buổi học, giữ một lời hứa',exact:true}).waitFor();
    await page.setViewportSize({width:390,height:844});
    await shot(page,'07-mobile-checkin');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
    if(overflow)failures.push('Mobile horizontal overflow');
    results.push('session finish to check-in and mobile responsive');
  } catch(e) { failures.push(e.stack); await shot(page,'failure'); }
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({results,failures},null,2));
  console.log(JSON.stringify({results,failures},null,2));
  await browser.close();
  if(failures.length)process.exitCode=1;
})();
