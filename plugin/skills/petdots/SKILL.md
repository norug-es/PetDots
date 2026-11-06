---
name: petdots
description: Use when the user wants to inspect or update the visual state of PetDots agent creatures.
---

# PetDots

Use `petdots_get_state` to inspect the local event store. Use
`petdots_emit_event` only when the caller has a real lifecycle event and include
the source plus concise evidence paths or commands when available.

Never emit `working`, `done`, or `reviewing` based only on a planned action.
For demonstrations, set the event's `simulated` field in the local CLI instead
of presenting the event as execution evidence.
