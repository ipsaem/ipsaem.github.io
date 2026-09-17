// Usage: node scripts/check_yaml_examples.cjs /path/to/node_modules/yaml
const assert=require('node:assert/strict');
const YAML=require(process.argv[2]||'yaml');
const data=require('../data/standards/yaml.json');
let count=0;
for(const chapter of data.chapters) for(const example of chapter.examples){
 const docs=YAML.parseAllDocuments(example.code,{version:'1.2',schema:'core',uniqueKeys:true});
 const errors=docs.flatMap(doc=>doc.errors);
 if(example.invalid){assert.ok(errors.length,example.title);}
 else{
  assert.equal(errors.length,0,example.title+': '+errors);
  const results=docs.map(doc=>doc.toJS());
  if(example.documents)assert.deepEqual(results,example.documents);
  else{assert.equal(results.length,1);assert.deepEqual(results[0],example.expected);}
  if(example.sameNodes){const [a,b]=example.sameNodes;assert.equal(results[0][a],results[0][b]);}
 }
 count++;
}
console.log(`Checked ${count} YAML 1.2 Core examples`);
