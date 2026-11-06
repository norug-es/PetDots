#!/usr/bin/env node
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import readline from 'node:readline';
import { AGENTS, STATES, makeEvent, reduceState } from './protocol.mjs';

const root = process.env.PETDOTS_HOME || join(process.cwd(), '.petdots');
const eventFile = join(root, 'events.jsonl');
await mkdir(root, { recursive: true });

async function readEvents() {
  try { return (await readFile(eventFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
function reply(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, result })}\n`); }
function error(id, code, message) { process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } })}\n`); }

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    if (request.method === 'initialize') return reply(request.id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'petdots', version: '0.1.0' } });
    if (request.method === 'notifications/initialized') return;
    if (request.method === 'tools/list') return reply(request.id, { tools: [
      { name: 'petdots_emit_event', description: 'Emit a verified agent lifecycle event to PetDots.', inputSchema: { type: 'object', required: ['agent', 'state'], properties: { agent: { type: 'string', enum: Object.keys(AGENTS) }, state: { type: 'string', enum: STATES }, message: { type: 'string' }, source: { type: 'string' }, evidence: { type: 'array', items: { type: 'string' } } } } },
      { name: 'petdots_get_state', description: 'Read the current PetDots state from the local event store.', inputSchema: { type: 'object', properties: {} } },
    ] });
    if (request.method === 'tools/call') {
      const { name, arguments: args = {} } = request.params || {};
      if (name === 'petdots_get_state') return reply(request.id, { content: [{ type: 'text', text: JSON.stringify({ eventFile, state: reduceState(await readEvents()) }, null, 2) }] });
      if (name === 'petdots_emit_event') {
        const event = makeEvent({ ...args, source: args.source || 'codex-plugin' });
        await appendFile(eventFile, `${JSON.stringify(event)}\n`, 'utf8');
        return reply(request.id, { content: [{ type: 'text', text: JSON.stringify(event) }] });
      }
      return error(request.id, -32602, `Unknown tool: ${name}`);
    }
    if (request.id !== undefined) return error(request.id, -32601, `Unknown method: ${request.method}`);
  } catch (err) { if (request?.id !== undefined) error(request.id, -32700, err.message); }
});
