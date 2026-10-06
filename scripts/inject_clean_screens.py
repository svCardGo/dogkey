#!/usr/bin/env python3
import base64, pathlib, subprocess, sys
# Runs inject_B and inject_C if present as parts
for name in ('inject_B.py', 'inject_C.py'):
    p = pathlib.Path('scripts') / name
    if p.exists():
        subprocess.check_call([sys.executable, str(p)])
    else:
        print('missing', p)
