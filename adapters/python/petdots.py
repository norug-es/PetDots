"""Tiny zero-dependency PetDots adapter for Python repositories."""

from __future__ import annotations

import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

AGENTS = {"architect", "backend", "frontend", "security", "qa", "release"}
STATES = {"idle", "working", "blocked", "reviewing", "done"}


class PetDots:
    def __init__(self, project: str, root: str | None = None) -> None:
        self.project = project
        self.root = Path(root or os.environ.get("PETDOTS_HOME", ".petdots"))
        self.event_file = self.root / "events.jsonl"

    def emit(
        self,
        agent: str,
        state: str,
        message: str = "",
        source: str = "python-adapter",
        evidence: list[str] | None = None,
        simulated: bool = False,
    ) -> dict:
        if agent not in AGENTS:
            raise ValueError(f"unknown agent: {agent}")
        if state not in STATES:
            raise ValueError(f"unknown state: {state}")
        event = {
            "version": 1,
            "id": f"{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "project": self.project,
            "agent": agent,
            "state": state,
            "message": str(message)[:500],
            "source": str(source)[:120],
            "simulated": bool(simulated),
            "evidence": [str(item)[:300] for item in (evidence or [])[:10]],
        }
        self.root.mkdir(parents=True, exist_ok=True)
        with self.event_file.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event, ensure_ascii=False) + "\n")
        return event
