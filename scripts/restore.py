#!/usr/bin/env python3
"""Rebuild the dictionary from locally preserved, unmodified Wayback responses."""
from pathlib import Path
from html import unescape
import re, json, hashlib
ROOT = Path(__file__).resolve().parents[1]

def plain(value):
    return unescape(re.sub(r'<[^>]+>', '', value)).strip()

def build():
    entries, sources = {}, []
    for path in sorted((ROOT / 'data/archive').glob('*.html')):
        text = path.read_bytes().decode('cp949')
        source_file = path.with_suffix('.source.txt')
        response = source_file.read_text().strip()
        assert response.startswith('200 '), f'Failed response: {path}'
        url = response.split(' ', 1)[1].replace('id_/', '/')
        timestamp = re.search(r'/web/(\d{14})/', url).group(1)
        count = int(re.search(r'총\s*(\d+)\s*건', text).group(1))
        rows = []
        for row in re.findall(r'<tr\b[^>]*>(.*?)</tr>', text, re.S | re.I):
            uid = re.search(r'action=edit&uid=(\d+)', row)
            if not uid:
                continue
            cells = re.findall(r'<td\b[^>]*>(.*?)</td>', row, re.S | re.I)
            assert len(cells) == 4
            name, kor, eng = map(plain, cells[:3])
            key = (uid.group(1), kor, eng, name)
            entry = entries.setdefault(key, dict(id=uid.group(1), kor=kor, eng=eng, contributor=name, sources=[]))
            entry['sources'].append(dict(url=url, timestamp=timestamp))
            rows.append(key)
        assert rows, f'No dictionary rows: {path}'
        sources.append(dict(file=str(path.relative_to(ROOT)),url=url,timestamp=timestamp,reportedTotal=count,rows=len(rows),sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
    records = sorted(entries.values(), key=lambda e:(e['kor'],e['eng'],e['id']))
    result = dict(title='김치하 한영사전', restoredCount=len(records), sources=sources, entries=records)
    (ROOT/'data/dictionary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(f'Restored {len(records)} records from {len(sources)} captures')
if __name__ == '__main__': build()
