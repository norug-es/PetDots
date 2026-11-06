#!/usr/bin/env node
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import readline from 'node:readline';

const AGENTS = {
  architect: { label: 'Architect', species: 'orb-weaver', hue: '#a78bfa' },
  backend: { label: 'Backend', species: 'moss-crawler', hue: '#34d399' },
  frontend: { label: 'Frontend', species: 'glass-moth', hue: '#60a5fa' },
  security: { label: 'Security', species: 'lock-finch', hue: '#fbbf24' },
  qa: { label: 'QA', species: 'error-goblin', hue: '#fb7185' },
  release: { label: 'Release', species: 'chrome-beetle', hue: '#f472b6' },
};
const STATES = ['idle', 'working', 'blocked', 'reviewing', 'done'];
const root = process.env.PETDOTS_HOME || join(process.cwd(), '.petdots');
const eventFile = join(root, 'events.jsonl');
await mkdir(root, { recursive: true });
const readEvents = async () => { try { return (await readFile(eventFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); } catch (error) { if (error.code === 'ENOENT') return []; throw error; } };
const makeEvent = ({ agent, state, message = '', source = 'codex-plugin', evidence = [] }) => {
  if (!AGENTS[agent]) throw new Error(`Unknown agent: ${agent}`);
  if (!STATES.includes(state)) throw new Error(`Unknown state: ${state}`);
  return { version: 1, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: new Date().toISOString(), agent, state, message: String(message).slice(0, 500), source: String(source).slice(0, 120), simulated: false, evidence: Array.isArray(evidence) ? evidence.slice(0, 10) : [] };
};
const reduceState = (events) => { const state = Object.fromEntries(Object.keys(AGENTS).map((agent) => [agent, { agent, state: 'idle', message: '', source: '', simulated: false, evidence: [] }])); for (const event of events) if (event && state[event.agent] && STATES.includes(event.state)) state[event.agent] = { ...state[event.agent], ...event }; return state; };
const reply = (id, result) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`);
const fail = (id, code, message) => process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })}\n`);
readline.createInterface({ input: process.stdin }).on('line', async (line) => {
  let request;
  try {
    request = JSON.parse(line);
    if (request.method === 'initialize') return reply(request.id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'petdots', version: '0.1.0' } });
    if (request.method === 'notifications/initialized') return;
    if (request.method === 'tools/list') return reply(request.id, { tools: [
      { name: 'petdots_emit_event', description: 'Emit a verified agent lifecycle event to PetDots.', inputSchema: { type: 'object', required: ['agent', 'state'], properties: { agent: { type: 'string', enum: Object.keys(AGENTS) }, state: { type: 'string', enum: STATES }, message: { type: 'string' }, source: { type: 'string' }, evidence: { type: 'array', items: { type: 'string' } } } } },
      { name: 'petdots_get_state', description: 'Read the current PetDots state from the local event store.', inputSchema: { type: 'object', properties: {} } },
    ] });
    if (request.method === 'tools/call') { const { name, arguments: args = {} } = request.params || {}; if (name === 'petdots_get_state') return reply(request.id, { content: [{ type: 'text', text: JSON.stringify({ eventFile, state: reduceState(await readEvents()) }, null, 2) }] }); if (name === 'petdots_emit_event') { const event = makeEvent(args); await appendFile(eventFile, `${JSON.stringify(event)}\n`, 'utf8'); return reply(request.id, { content: [{ type: 'text', text: JSON.stringify(event) }] }); } return fail(request.id, -32602, `Unknown tool: ${name}`); }
    if (request.id !== undefined) fail(request.id, -32601, `Unknown method: ${request.method}`);
  } catch (error) { if (request?.id !== undefined) fail(request.id, -32700, error.message); }
});
