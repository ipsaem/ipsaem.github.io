'use strict';
const $ = id => document.getElementById(id);
const standardId = new URLSearchParams(location.search).get('standard') === 'yaml' ? 'yaml' : 'xml';
let standard, current = 0;
const menu = document.querySelector('.menu-toggle');
function closeMenu(){ $('sidebar-container').classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String($('sidebar-container').classList.toggle('open'))));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
function theme(value){document.documentElement.dataset.theme=value;$('theme').setAttribute('aria-label',value==='dark'?'밝은 테마로 전환':'어두운 테마로 전환');}
try{theme(localStorage.getItem('theme')==='light'?'light':'dark');}catch{theme('dark');}
$('theme').addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(value);try{localStorage.setItem('theme',value);}catch{}});
function element(tag,text,className){const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;}
function pageUrl(index){return `standards.html?standard=${standardId}&chapter=${standard.chapters[index].id}`;}
function render(){
 const chapter=standard.chapters[current];
 $('chapter-title').textContent=chapter.title;$('chapter-number').textContent=`${String(current+1).padStart(2,'0')} / ${standard.chapters.length}`;
 const title=`${chapter.title} · ${standard.title} · 잎샘`;document.title=title;
 document.querySelector('meta[property="og:title"]').content=title;
 document.querySelector('meta[name="description"]').content=chapter.notes[0];document.querySelector('meta[property="og:description"]').content=chapter.notes[0];
 $('translations').replaceChildren();
 for(const quote of chapter.translations){
  const box=element('section','','translation');box.append(element('h3','짧은 조항 번역'));
  const original=element('blockquote',quote.original);original.lang='en';
  box.append(original,element('p',quote.ko,'translated-text'));
  const link=element('a',quote.section+' 원문 ↗');link.href=standard.sourceUrl+'#'+quote.anchor;link.target='_blank';link.rel='noreferrer';box.append(link);$('translations').append(box);
 }
 $('chapter-notes').replaceChildren(...chapter.notes.map(text=>element('p',text)));
 $('chapter-question').textContent=chapter.question;
 $('clause-links').replaceChildren();
 for(const clause of chapter.references){const a=element('a',clause.label+' ↗');a.href=standard.sourceUrl+'#'+clause.anchor;a.target='_blank';a.rel='noreferrer';$('clause-links').append(a);}
 $('examples').replaceChildren();
 for(const example of chapter.examples){
  const box=element('section','','standard-example');box.append(element('h3',example.title),element('span','잎샘 작성 예제','example-label'));
  const pre=document.createElement('pre');pre.append(element('code',example.code));box.append(pre,element('p',example.result));$('examples').append(box);
 }
 document.querySelectorAll('[data-chapter]').forEach(a=>{if(a.dataset.chapter===chapter.id)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 $('previous').disabled=current===0;$('next').disabled=current===standard.chapters.length-1;$('chapter-permalink').href=pageUrl(current);
}
function choose(index){current=index;history.pushState(null,'',pageUrl(index));render();closeMenu();$('chapter-title').scrollIntoView({block:'start'});}
function restore(){const id=new URLSearchParams(location.search).get('chapter');current=Math.max(0,standard.chapters.findIndex(c=>c.id===id));render();}
$('previous').addEventListener('click',()=>{if(current>0)choose(current-1);});
$('next').addEventListener('click',()=>{if(current<standard.chapters.length-1)choose(current+1);});
window.addEventListener('popstate',()=>{if(standard)restore();});
(async()=>{
 try{
  const response=await fetch(`data/standards/${standardId}.json`);if(!response.ok)throw Error(response.status);standard=await response.json();
  $('standard-name').textContent=standard.title;$('standard-version').textContent=standard.version;$('standard-scope').textContent=standard.scope;
  $('standard-heading').textContent=standard.title;$('standard-description').textContent=standard.description;$('standard-status').textContent=standard.status;
  $('panel-title').textContent=`${standardId}/standard.notes`;$('scope-note').textContent=standard.scopeNote;
  $('standard-source').href=standard.sourceUrl;$('standard-errata').href=standard.errataUrl;
  $('attribution').textContent=standard.attribution;$('license-link').href=standard.licenseUrl;$('translation-notice').textContent=standard.notice;
  for(const term of standard.glossary){$('glossary').append(element('dt',term.en),element('dd',term.ko));}
  document.querySelector(`[data-standard="${standardId}"]`).setAttribute('aria-current','page');
  standard.chapters.forEach((chapter,index)=>{
   for(const parent of [$('chapter-nav'),$('reading-flow')]){const a=element('a',`${String(index+1).padStart(2,'0')} ${chapter.title}`);a.href=pageUrl(index);a.dataset.chapter=chapter.id;a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();choose(index);});parent.append(a);}
  });
  $('standard-body').hidden=false;$('load-status').hidden=true;restore();
 }catch{$('load-status').textContent='표준 노트를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';}
})();
