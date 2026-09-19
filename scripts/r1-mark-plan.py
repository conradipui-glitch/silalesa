#!/usr/bin/env python3
from pathlib import Path
p = Path('docs/CONTENT-CONVERSION-REVISION-PLAN.md')
s = p.read_text(encoding='utf-8')
rows = [line for line in s.splitlines() if line.startswith('| **R1** |')]
assert len(rows) == 1, 'expected one canonical R1 row'
old = rows[0]
assert old.endswith('| ☐ План |'), old
new = old.replace('| ☐ План |', '| ☑ Выполнено · PR #16; TypeScript, build, SEO/no-JS и CI проверены; финальный Pages см. отчёт |')
p.write_text(s.replace(old, new, 1), encoding='utf-8')
print('Canonical R1 row prepared for merge after CI; Pages requires separate post-merge verification')
