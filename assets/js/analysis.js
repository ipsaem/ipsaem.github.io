'use strict';
const $ = id => document.getElementById(id);
const query = new URLSearchParams(location.search);
const projectId = query.get('project') === 'linux' ? 'linux' : 'sqlite';
let project, current = 0, file = '', full = false;
const menu = document.querySelector('.menu-toggle');
function closeMenu(){ $('sidebar-container').classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String($('sidebar-container').classList.toggle('open'))));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
function theme(value){ document.documentElement.dataset.theme=value; $('theme').setAttribute('aria-label',value==='dark'?'밝은 테마로 전환':'어두운 테마로 전환'); }
try{theme(localStorage.getItem('theme')==='light'?'light':'dark');}catch{theme('dark');}
$('theme').addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(value);try{localStorage.setItem('theme',value);}catch{}});
function pageUrl(line){
 const p = new URLSearchParams({project:projectId,chapter:project.chapters[current].id});
 if(full) {p.set('file',file); p.set('view','full');}
 return 'analysis.html?'+p+(line ? '#L'+line : '');
}
function renderCode(){
 const chapter = project.chapters[current];
 const lines = project.files[file].text.split('\n');
 if (lines.at(-1)==='') lines.pop();
 const start = full ? 1 : chapter.start, end = full ? lines.length : chapter.end;
 $('source-file').value=file;
 $('excerpt').setAttribute('aria-pressed',String(!full)); $('full-file').setAttribute('aria-pressed',String(full));
 $('code-location').textContent=`${file} · L${start}–L${end}`;
 const fragment = document.createDocumentFragment();
 for(let n=start;n<=end;n++) {
  const row = document.createElement('span'); row.className='code-line'; row.id='L'+n;
  const number = document.createElement('a'); number.className='line-number'; number.href=pageUrl(n); number.textContent=n; number.setAttribute('aria-label',`${n}번 줄 링크`);
  const code = document.createElement('code'); code.textContent=lines[n-1] || ' ';
  row.append(number,code); fragment.append(row);
 }
 $('source-code').replaceChildren(fragment);
 $('code-permalink').href=pageUrl(start);
 document.querySelector('.code-scroll').scrollTop=0;
}
function render(){
 const chapter=project.chapters[current];
 $('chapter-title').textContent=chapter.title; $('chapter-number').textContent=`${String(current+1).padStart(2,'0')} / ${project.chapters.length}`;
 $('chapter-summary').textContent=chapter.summary; $('chapter-question').textContent=chapter.question;
 $('chapter-notes').replaceChildren();
 for(const note of chapter.notes){const section=document.createElement('section'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=note.title;p.textContent=note.body;section.append(h,p);$('chapter-notes').append(section);}
 document.querySelectorAll('[data-chapter]').forEach(a=>{if(a.dataset.chapter===chapter.id)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 $('previous').disabled=current===0; $('next').disabled=current===project.chapters.length-1;
 const title=`${chapter.title} · ${project.title} ${project.version} · 잎샘`;
 document.title=title;document.querySelector('meta[property="og:title"]').content=title;
 document.querySelector('meta[name="description"]').content=chapter.summary;document.querySelector('meta[property="og:description"]').content=chapter.summary;
 renderCode();
}
function choose(index){
 current=index;file=project.chapters[current].file;full=false;
 history.pushState(null,'',pageUrl());render();closeMenu();
 $('chapter-title').scrollIntoView({block:'start'});
}
function restoreLocation(){
 const p=new URLSearchParams(location.search);
 current=Math.max(0,project.chapters.findIndex(c=>c.id===p.get('chapter')));
 const selected=p.get('file');full=p.get('view')==='full' && Object.hasOwn(project.files,selected);
 file=full?selected:project.chapters[current].file;render();
 const line=document.getElementById(location.hash.slice(1));if(line)line.scrollIntoView({block:'center'});
}
$('previous').addEventListener('click',()=>{if(current>0)choose(current-1);});
$('next').addEventListener('click',()=>{if(current<project.chapters.length-1)choose(current+1);});
$('source-file').addEventListener('change',()=>{file=$('source-file').value;full=true;history.pushState(null,'',pageUrl());renderCode();});
$('excerpt').addEventListener('click',()=>{file=project.chapters[current].file;full=false;history.pushState(null,'',pageUrl());renderCode();});
$('full-file').addEventListener('click',()=>{full=true;history.pushState(null,'',pageUrl());renderCode();});
window.addEventListener('popstate',()=>{if(project)restoreLocation();});
(async()=>{
 try{
  const response=await fetch(`data/analysis/${projectId}.json`);if(!response.ok)throw Error(response.status);project=await response.json();
  $('project-name').textContent=project.title; $('project-version').textContent=project.version; $('project-heading').textContent=`${project.title} ${project.version}`;
  $('panel-title').textContent=`${projectId}/source.notes`; $('project-description').textContent=project.description;
  $('project-source').href=project.sourceUrl; $('project-archive').href=project.archiveUrl;
  $('revision').textContent=`분석 기준: ${project.revision}`; $('archive-hash').textContent=`원본 압축 파일 SHA-256: ${project.archiveSha256}`;
  document.querySelector(`[data-project="${projectId}"]`).setAttribute('aria-current','page');
  project.chapters.forEach((chapter,index)=>{
   for(const parent of [$('chapter-nav'),$('reading-flow')]) {const a=document.createElement('a');a.href=`analysis.html?project=${projectId}&chapter=${chapter.id}`;a.dataset.chapter=chapter.id;a.textContent=`${String(index+1).padStart(2,'0')} ${chapter.title}`;a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();choose(index);});parent.append(a);}
  });
  for(const name of Object.keys(project.files)){const option=document.createElement('option');option.value=name;option.textContent=name;$('source-file').append(option);}
  $('analysis-body').hidden=false; $('load-status').hidden=true;restoreLocation();
 }catch{$('load-status').textContent='분석 데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';}
})();
