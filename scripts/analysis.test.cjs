const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
for(const id of ['sqlite','linux']) {
 const data=require(`../data/analysis/${id}.json`);
 test(`${id}: chapter targets and preserved source hashes`,()=>{
  assert.equal(data.id,id);assert.equal(data.chapters.length,id==='linux'?26:6);
  assert.equal(new Set(data.chapters.map(c=>c.id)).size,data.chapters.length);
  for(const source of Object.values(data.files)) assert.equal(crypto.createHash('sha256').update(source.text).digest('hex'),source.sha256);
  for(const chapter of data.chapters){
   const source=data.files[chapter.file];assert.ok(source,chapter.file);
   assert.ok(chapter.start>0&&chapter.end>=chapter.start&&chapter.end<=source.text.split('\n').length);
   assert.equal(chapter.notes.length,3);assert.ok(chapter.question);
  }
 });
 test(`${id}: pinned version and reference integrity`,()=>{
  assert.equal(data.version,id==='sqlite'?'2.0.0':'0.11');
  assert.match(data.archiveSha256,/^[a-f0-9]{64}$/);
  assert.ok(data.sourceUrl.startsWith('https://'));assert.ok(data.archiveUrl.startsWith('https://'));
  if(id==='sqlite'){assert.equal(data.revision,'61090c5f320741c178a08937070de08a722cbd25');assert.ok(data.files['src/main.c'].text.includes('int sqlite_exec('));}
  else assert.ok(data.files['kernel/sched.c'].text.includes('void schedule(void)'));
 });
}
test('dictionary catalog still resolves original restored data',()=>{
 const catalog=require('../data/catalog.json');
 for(const d of catalog.dictionaries){const records=JSON.parse(fs.readFileSync(d.data));assert.ok(records.entries.length>0);}
});

test('Linux lecture source stays exact and chapter excerpts point into the supplied file',()=>{
 const d=require('../data/analysis/linux.json');
 const bytes=fs.readFileSync('data/analysis/lecture/main.c');
 assert.equal(bytes.toString(),d.files['lab/init/main.c'].text);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.files['lab/init/main.c'].sha256);
 const chapters=d.chapters.filter(c=>c.file==='lab/init/main.c');assert.equal(chapters.length,6);
 assert.ok(d.chapters.some(c=>c.id==='boot'));
 assert.ok(d.files['init/main.c'].text!==bytes.toString());
 for(const chapter of chapters)assert.ok(bytes.toString().split('\n').slice(chapter.start-1,chapter.end).join('\n').trim());
});

test('Linux directory guide covers every official directory and source file',()=>{
 const d=require('../data/analysis/linux.json');
 const path=require('node:path').posix;
 const sources=Object.keys(d.files).filter(f=>!f.startsWith('lab/'));
 const expected=[...new Set(sources.map(f=>path.dirname(f)))].sort();
 assert.equal(sources.length,100);
 assert.deepEqual(d.directories.map(x=>x.path).sort(),expected);
 assert.equal(d.directories.length,15);
 for(const dir of d.directories){
  assert.deepEqual([...dir.files].sort(),sources.filter(f=>path.dirname(f)===dir.path).sort());
  assert.ok(d.chapters.some(c=>c.id===dir.chapter&&c.directory===dir.path));
 }
 for(const chapter of d.chapters)assert.ok(expected.includes(chapter.directory));
});
