#!/usr/bin/env python3
from pathlib import Path
parts = sorted(Path("scripts/inject_parts").glob("part_*.txt"))
text = "".join(p.read_text() for p in parts)
Path("scripts/inject_cinematic_ui.py").write_text(text)
print("assembled inject", len(text))
