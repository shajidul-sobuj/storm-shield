const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const assetsDir = path.join(__dirname, '..', 'assets', 'ui');
fs.mkdirSync(assetsDir, { recursive: true });

const distDir = path.join(__dirname, '..', '..', 'dist');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath);
  if (filePath.endsWith('/') || !path.extname(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mime = ext === '.js' ? 'application/javascript'
      : ext === '.css' ? 'text/css'
      : ext === '.png' ? 'image/png'
      : ext === '.svg' ? 'image/svg+xml'
      : 'text/html';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(8099, async () => {
  console.log('Static server listening on port 8099');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Overview Screen
  console.log('Capturing: ui_overview.png');
  await page.goto('http://127.0.0.1:8099/?tab=overview', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(assetsDir, 'ui_overview.png') });

  // 2. Health Twin Screen
  console.log('Capturing: ui_health_twin.png');
  await page.goto('http://127.0.0.1:8099/?tab=health-twin', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(assetsDir, 'ui_health_twin.png') });

  // 3. Storm Monitor Screen
  console.log('Capturing: ui_storm_monitor.png');
  await page.goto('http://127.0.0.1:8099/?tab=storm-monitor', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(assetsDir, 'ui_storm_monitor.png') });

  // 4. Care Mode Screen
  console.log('Capturing: ui_care_mode.png');
  await page.goto('http://127.0.0.1:8099/?tab=care-mode', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(assetsDir, 'ui_care_mode.png') });

  // 5. Handoff Screen
  console.log('Capturing: ui_handoff.png');
  await page.goto('http://127.0.0.1:8099/?tab=handoff', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(assetsDir, 'ui_handoff.png') });

  // 6. Crew Alert Modal
  console.log('Capturing: ui_crew_alert.png');
  await page.goto('http://127.0.0.1:8099/?tab=overview', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text && text.includes('ALERT CREW')) {
      await btn.click();
      console.log('Triggered Crew Alert Modal');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(assetsDir, 'ui_crew_alert.png') });

  console.log('All UI captures saved successfully in', assetsDir);
  await browser.close();
  server.close();
  process.exit(0);
});
