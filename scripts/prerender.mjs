import { spawn } from 'child_process';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const INDEX = path.join(DIST, 'index.html');
const SHELL_INDEX = path.join(DIST, 'index.shell.html');

const ROUTES = ['/'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cleanHtml = (html) =>
  html.replace(/\s(src|href)="blob:http:\/\/localhost:5199\/[^"]*"/g, '');

async function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', '5199', '--strictPort'], {
      cwd: path.resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });

    let resolved = false;

    const onData = (data) => {
      const text = data.toString();
      console.log('[server]', text.trim());
      if (!resolved && text.includes('Local:')) {
        resolved = true;
        resolve(proc);
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);

    proc.on('error', reject);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 10000);
  });
}

async function prerender() {
  console.log('Starting preview server...');
  const server = await startServer();
  await sleep(2000);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      const url = `http://localhost:5199${route}`;
      console.log(`\nPrerendering ${url}...`);

      const page = await browser.newPage();
      page.setViewport({ width: 1920, height: 1080 });

      // Skip splash screen during prerender
      await page.evaluateOnNewDocument(() => {
        sessionStorage.setItem('alphaMatrixSplashSeen', 'true');
      });

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Wait for HeroSection H1 to appear (confirms React rendered main content)
      await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {
        console.log('  Warning: <h1> not found within timeout');
      });

      // Small extra settle time for lazy-loaded components
      await sleep(1000);

      const html = cleanHtml(await page.content());

      if (route === '/' && fs.existsSync(INDEX) && !fs.existsSync(SHELL_INDEX)) {
        fs.copyFileSync(INDEX, SHELL_INDEX);
        console.log(`  Backed up original app shell to ${SHELL_INDEX}`);
      }

      // Make the canonical URL serve full HTML. Some static hosts ignore
      // .htaccess, so crawler-only rewrites are not reliable.
      if (route === '/') {
        fs.writeFileSync(INDEX, html, 'utf-8');
        console.log(`  Replaced ${INDEX} with prerendered HTML (${html.length} bytes)`);
      }

      const prerenderedPath = path.join(DIST, 'index.prerendered.html');
      fs.writeFileSync(prerenderedPath, html, 'utf-8');
      console.log(`  Saved to ${prerenderedPath} (${html.length} bytes)`);

      await page.close();
    }
  } finally {
    await browser.close();
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill('SIGTERM');
    }
    console.log('\nDone.');
  }
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
