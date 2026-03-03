import { spawn } from 'node:child_process';

const NODE20 = '/Users/kabigon/project/.tools/node-v20.19.0-darwin-arm64/bin/node';
const MCP_SERVER = '/Users/kabigon/project/todo-plus/node_modules/chrome-devtools-mcp/build/src/index.js';
const TARGET_URL = 'http://127.0.0.1:4173';
const SCREENSHOT_PATH = '/tmp/todo-plus-mcp-smoke.png';

const server = spawn(
  NODE20,
  [MCP_SERVER, '--headless', '--isolated', '--no-usage-statistics'],
  { stdio: ['pipe', 'pipe', 'pipe'] }
);

let nextId = 1;
const pending = new Map();
let lineBuffer = '';

function parseMessages() {
  while (true) {
    const idx = lineBuffer.indexOf('\n');
    if (idx === -1) return;

    const line = lineBuffer.slice(0, idx).trim();
    lineBuffer = lineBuffer.slice(idx + 1);
    if (!line) continue;

    const message = JSON.parse(line);
    if (Object.prototype.hasOwnProperty.call(message, 'id') && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    }
  }
}

server.stdout.on('data', (chunk) => {
  lineBuffer += chunk.toString('utf8');
  parseMessages();
});

server.stderr.on('data', (chunk) => {
  const text = chunk.toString('utf8').trim();
  if (text) process.stderr.write(`[mcp-stderr] ${text}\n`);
});

server.on('exit', (code, signal) => {
  for (const { reject, timer } of pending.values()) {
    clearTimeout(timer);
    reject(new Error(`MCP server exited: code=${code} signal=${signal}`));
  }
  pending.clear();
});

function send(method, params) {
  const id = nextId++;
  const payload = {
    jsonrpc: '2.0',
    id,
    method,
    ...(params ? { params } : {}),
  };
  const json = JSON.stringify(payload);
  const packet = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`;
  const promise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      reject(new Error(`MCP timeout for method ${method}`));
    }, 20000);
    pending.set(id, { resolve, reject, timer });
  });
  server.stdin.write(`${json}\n`);
  return promise;
}

function notify(method, params) {
  const payload = {
    jsonrpc: '2.0',
    method,
    ...(params ? { params } : {}),
  };
  const json = JSON.stringify(payload);
  server.stdin.write(`${json}\n`);
}

function extractText(result) {
  const lines = [];
  for (const item of result?.content ?? []) {
    if (item?.type === 'text' && typeof item.text === 'string') lines.push(item.text);
  }
  return lines.join('\n');
}

async function callTool(name, args = {}) {
  const result = await send('tools/call', {
    name,
    arguments: args,
  });
  return {
    raw: result,
    text: extractText(result),
  };
}

async function main() {
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'todo-plus-smoke', version: '1.0.0' },
  });
  notify('notifications/initialized');

  await send('tools/list');

  await callTool('new_page', { url: TARGET_URL, timeout: 15000 });
  await callTool('wait_for', { text: 'Todo Plus', timeout: 15000 });

  const interaction = await callTool('evaluate_script', {
    function: `async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const waitButton = async (text, timeout = 3000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
          const btn = [...document.querySelectorAll('button')].find((b) => b.textContent && b.textContent.trim() === text);
          if (btn) return btn;
          await sleep(100);
        }
        throw new Error('Button not found: ' + text);
      };
      const fireInput = (el, value) => {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const clickButton = async (text) => {
        const btn = await waitButton(text);
        btn.click();
      };

      await clickButton('新增任务');
      await sleep(200);
      const todoTitle = document.querySelector('input[placeholder="任务标题"]');
      const todoDesc = document.querySelector('input[placeholder="任务描述"]');
      if (!todoTitle || !todoDesc) throw new Error('Todo dialog fields not found');
      fireInput(todoTitle, 'E2E todo');
      fireInput(todoDesc, 'browser check');
      await clickButton('保存');
      await sleep(300);
      const todoAdded = [...document.querySelectorAll('p.font-semibold')].some((el) => el.textContent && el.textContent.includes('E2E todo'));

      await clickButton('想法看板');
      await sleep(200);
      await clickButton('新增想法');
      await sleep(200);
      const ideaTitle = document.querySelector('input[placeholder="想法标题"]');
      const ideaDesc = document.querySelector('input[placeholder="想法描述"]');
      if (!ideaTitle || !ideaDesc) throw new Error('Idea dialog fields not found');
      fireInput(ideaTitle, 'E2E idea');
      fireInput(ideaDesc, 'browser check');
      await clickButton('保存');
      await sleep(300);
      const ideaAdded = [...document.querySelectorAll('p.font-semibold')].some((el) => el.textContent && el.textContent.includes('E2E idea'));

      return {
        url: location.href,
        title: document.title,
        todoAdded,
        ideaAdded,
      };
    }`,
  });

  const consoleData = await callTool('list_console_messages', {});
  const networkData = await callTool('list_network_requests', {});
  await callTool('take_screenshot', { filePath: SCREENSHOT_PATH, fullPage: true, format: 'png' });

  const report = {
    screenshotPath: SCREENSHOT_PATH,
    interaction: interaction.text,
    consoleMessages: consoleData.text,
    networkRequests: networkData.text,
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    server.kill('SIGTERM');
  });
