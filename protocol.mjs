export const STATES = Object.freeze([
  'idle',
  'working',
  'blocked',
  'reviewing',
  'done',
]);

export const AGENTS = Object.freeze({
  architect: { label: 'Architect', species: 'orb-weaver', hue: '#a78bfa' },
  backend: { label: 'Backend', species: 'moss-crawler', hue: '#34d399' },
  frontend: { label: 'Frontend', species: 'glass-moth', hue: '#60a5fa' },
  security: { label: 'Security', species: 'lock-finch', hue: '#fbbf24' },
  qa: { label: 'QA', species: 'error-goblin', hue: '#fb7185' },
  release: { label: 'Release', species: 'chrome-beetle', hue: '#f472b6' },
});

export function makeEvent({ agent, state, message = '', source = 'unknown',
  simulated = false, evidence = [] }) {
  if (!AGENTS[agent]) throw new Error(`Unknown agent: ${agent}`);
  if (!STATES.includes(state)) throw new Error(`Unknown state: ${state}`);
  return {
    version: 1,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    agent,
    state,
    message: String(message).slice(0, 500),
    source: String(source).slice(0, 120),
    simulated: Boolean(simulated),
    evidence: Array.isArray(evidence) ? evidence.slice(0, 10) : [],
  };
}

export function reduceState(events) {
  const state = Object.fromEntries(Object.keys(AGENTS).map((agent) => [agent, {
    agent, state: 'idle', message: '', source: '', simulated: false, evidence: [],
  }]));
  for (const event of events) {
    if (event && state[event.agent] && STATES.includes(event.state)) {
      state[event.agent] = { ...state[event.agent], ...event };
    }
  }
  return state;
}
