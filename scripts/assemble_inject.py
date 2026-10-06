#!/usr/bin/env python3
from pathlib import Path
# No-op: cinematic UI is committed in-tree
Path('scripts/inject_cinematic_ui.py').write_text(
    '#!/usr/bin/env python3\nprint("inject skipped — UI already in source")\n'
)
print('assembled inject noop')
