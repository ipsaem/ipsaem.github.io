#!/usr/bin/env python3
"""Check authored XML examples; no network or external entities are used."""
from pathlib import Path
import json, shutil, subprocess
import xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/standards/xml.json').read_text())
checked=0
for chapter in data['chapters']:
    for example in chapter['examples']:
        code=example['code'].encode('utf-8')
        try:
            node=ET.fromstring(code)
        except ET.ParseError:
            assert not example['valid'],example['title']
        else:
            assert example['valid'],example['title']
            if 'root' in example: assert node.tag==example['root']
            if 'texts' in example: assert [child.text for child in node]==example['texts']
            if 'attribute' in example:
                name,value=example['attribute'];assert node.attrib[name]==value
        if 'dtdValid' in example:
            if shutil.which('xmllint'):
                result=subprocess.run(['xmllint','--nonet','--noout','--valid','-'],input=code,capture_output=True)
                assert (result.returncode==0)==example['dtdValid'],result.stderr
            else:
                print('SKIP DTD validation: xmllint unavailable')
        checked+=1
print(f'Checked {checked} XML examples')
