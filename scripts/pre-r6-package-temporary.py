from pathlib import Path
p = Path('package.json')
s = p.read_text()
a = 'node scripts/check-r5.mjs"'
b = 'node scripts/check-r5.mjs && node scripts/check-pre-r6.mjs"'
assert s.count(a) == 1, 'Expected unique R5 build chain'
p.write_text(s.replace(a, b))
print('Added pre-R6 verification to permanent build chain')
