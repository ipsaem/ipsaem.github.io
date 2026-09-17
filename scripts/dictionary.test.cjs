const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {initial,selectEntries}=require('../assets/js/dictionary.js');
const data=require('../data/dictionary.json');
test('117 unique original IDs and 11 captures, without broken Korean',()=>{
 assert.equal(data.entries.length,117);assert.equal(new Set(data.entries.map(e=>e.id)).size,117);assert.equal(data.sources.length,11);
 assert.equal(JSON.stringify(data).includes('\ufffd'),false);
 const crypto=require('node:crypto');
 for(const s of data.sources){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(s.file)).digest('hex'),s.sha256);assert.ok(s.rows>0);}
 for(const e of data.entries){assert.ok(e.kor&&e.eng&&e.contributor);assert.ok(e.sources.every(s=>s.url.startsWith('https://web.archive.org/web/')));}
 const later=data.entries.filter(e=>e.sources.some(s=>s.timestamp.startsWith('2003')));assert.equal(later.length,117);
});
test('Korean/English search, normalization and empty results',()=>{
 assert.ok(selectEntries(data.entries,' SHELL ','','kor').some(e=>e.kor==='껍데기'));
 assert.equal(selectEntries(data.entries,'대롱','','kor').filter(e=>e.kor==='대롱').length,2);
 assert.equal(selectEntries(data.entries,'no-such-word-here','','kor').length,0);
 assert.ok(selectEntries(data.entries,'roadmap','','kor').some(e=>e.eng==='road map'));
});
test('Korean initials and combined filters',()=>{
 assert.equal(initial('껍데기'),'ㄲ');assert.equal(initial('힣'),'ㅎ');assert.equal(initial('shell'),'');
 const found=selectEntries(data.entries,'','ㄲ','kor');assert.ok(found.length);assert.ok(found.every(e=>initial(e.kor)==='ㄲ'));
 assert.equal(selectEntries(data.entries,'shell','ㄱ','kor').length,0);
});
test('sorting preserves all entries and source spelling',()=>{
 assert.equal(selectEntries(data.entries,'','','eng').length,117);
 assert.ok(data.entries.some(e=>e.kor==='지렁이'&&e.eng==='warm'));
 const sorted=selectEntries(data.entries,'','','eng');for(let i=1;i<sorted.length;i++)assert.ok(sorted[i-1].eng.localeCompare(sorted[i].eng,'en')<=0);
});
