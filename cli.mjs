#!/usr/bin/env node
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AGENTS, STATES, makeEvent, reduceState } from './protocol.mjs';

const root = process.env.PETDOTS_HOME || join(process.cwd(), '.petdots');
const eventFile = join(root, 'events.jsonl');

async function ensureStore() { await mkdir(root, { recursive: true }); }
async function events() {
  try { return (await readFile(eventFile, 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
function value(flag, fallback = '') { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] || fallback : fallback; }

const command = process.argv[2] || 'state';
await ensureStore();
if (command === 'emit') {
  const event = makeEvent({ agent: value('--agent'), state: value('--state'), message: value('--message'), source: value('--source', 'petdots-cli'), simulated: process.argv.includes('--simulated') });
  await appendFile(eventFile, `${JSON.stringify(event)}\n`, 'utf8');
  console.log(JSON.stringify(event));
} else if (command === 'demo') {
  const sequence = [
    makeEvent({ agent: 'architect', state: 'working', message: 'Dividiendo la tarea', source: 'demo', simulated: true }),
    makeEvent({ agent: 'backend', state: 'working', message: 'Preparando el adaptador', source: 'demo', simulated: true }),
    makeEvent({ agent: 'qa', state: 'reviewing', message: 'Esperando evidencia', source: 'demo', simulated: true }),
  ];
  await appendFile(eventFile, sequence.map((item) => JSON.stringify(item)).join('\n') + '\n', 'utf8');
  console.log('DEMO_ONLY: eventos simulados escritos en', eventFile);
} else if (command === 'state') {
  console.log(JSON.stringify({ eventFile, agents: AGENTS, state: reduceState(await events()) }, null, 2));
} else {
  console.error(`Uso: node cli.mjs [state|demo|emit --agent <id> --state <${STATES.join('|')}>]`);
  process.exitCode = 1;
}
