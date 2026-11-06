# Integración con Dark-Intelligence-Gateway

Esta integración debe permanecer desacoplada: PetDots recibe eventos y no
ejecuta análisis forense, no accede a credenciales y no modifica producción.

Desde la raíz del gateway:

```powershell
node .\petdots\cli.mjs emit --agent backend --state working --message "Revisando API" --source "gateway"
node .\petdots\cli.mjs emit --agent qa --state reviewing --message "Esperando evidencia" --source "gateway"
```

Para una integración automática, los puntos de entrada de cada agente deben
emitir `working`, `blocked`, `reviewing` o `done` solo después de disponer de
la evidencia correspondiente. Las rutas de evidencia deben ser relativas al
repositorio y no deben contener secretos.
