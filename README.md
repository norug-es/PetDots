# PetDots

PetDots es un pequeño sistema de mascotas animadas para visualizar agentes de
desarrollo en VS Code, Codex Plugin y Codex CLI.

## Principios

- Las criaturas representan agentes, pero sus estados vienen de eventos reales.
- `demo` está marcado como simulado y nunca debe confundirse con ejecución real.
- El relay local usa JSON Lines para que cualquier agente pueda emitir eventos.
- No se envían credenciales ni se modifican procesos externos.

## Uso rápido

Desde `petdots/`:

```powershell
node .\cli.mjs demo
node .\cli.mjs emit --agent backend --state working --message "Revisando API"
node .\cli.mjs state
```

Los eventos se guardan en `.petdots/events.jsonl` dentro del workspace actual.

## Componentes

- `protocol.mjs`: estados, validación y criaturas.
- `bridge.mjs`: servidor MCP stdio mínimo para Codex Plugin.
- `cli.mjs`: emisor y lector local de eventos.
- `vscode-extension/`: extensión instalable de VS Code.
- `plugin/`: paquete portable Agent Plugin 1.0.
- `schemas/agent-event.schema.json`: contrato de integración estable.
- `adapters/python/`: adaptador sin dependencias para repositorios Python.
- `integrations/`: ejemplos de integración por repositorio.

## Integrar otro repositorio

Como CLI local:

```powershell
npm link .
petdots emit --agent backend --state working --message "Tarea iniciada"
```

Como adaptador Python, copia `adapters/python/petdots.py` o instálalo desde
un release posterior y emite eventos solo con evidencia real. El consumidor
no necesita importar la extensión VS Code ni el plugin Codex.

Para llevar este directorio a GitHub como repositorio independiente:

```powershell
cd petdots
git init
git add .
git commit -m "Initial PetDots platform"
git branch -M main
git remote add origin https://github.com/<owner>/petdots.git
git push -u origin main
```

El commit y el `push` son pasos manuales de publicación.

`export.ps1` genera `dist/petdots-codex-plugin-0.1.0.zip` para el plugin de
Codex y `dist/petdots-vscode-extension-0.1.0.vsix` para instalarlo en VS Code.

El paquete es un MVP local. La publicación global y la firma de marketplace
requieren revisión y autorización separadas.
