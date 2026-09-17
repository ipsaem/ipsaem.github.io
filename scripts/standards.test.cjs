const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const id of ['xml','yaml']){
 const spec=require(`../data/standards/${id}.json`);
 test(`${id}: source links, chapter targets and translation scope`,()=>{
  assert.equal(spec.chapters.length,6);assert.equal(new Set(spec.chapters.map(c=>c.id)).size,6);
  assert.ok(spec.scopeNote.includes('전문 번역이 아닙니다'));
  assert.ok(spec.sourceUrl.startsWith('https://'));assert.match(spec.sourceSha256,/^[a-f0-9]{64}$/);
  for(const c of spec.chapters){assert.ok(c.references.length);assert.ok(c.examples.length);assert.ok(c.notes.length);for(const r of c.references)assert.ok(r.anchor&&r.label);}
  const quotes=spec.chapters.flatMap(c=>c.translations).map(t=>t.original).join(' ');
  assert.ok(quotes.split(/\s+/).length<=25);
 });
}
test('all pages retain fixed code, dictionary and standards destinations',()=>{
 for(const path of ['index.html','analysis.html','standards.html']){
  const html=fs.readFileSync(path,'utf8');const nav=html.match(/<nav class="activity-bar"[\s\S]*?<\/nav>/)[0];
  assert.match(nav,/href="analysis.html"[^>]*>\{\}<\/a>/);
  assert.match(nav,/href="index.html#dictionary"[^>]*>Aa<\/a>/);
  assert.match(nav,/href="standards.html"[^>]*>§<\/a>/);
  assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
 }
});
