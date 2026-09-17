'use strict';
const INITIALS = [...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'];
const initial = word => { const code = word.charCodeAt(0) - 0xac00; return code >= 0 && code <= 11171 ? INITIALS[Math.floor(code / 588)] : ''; };
const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '');
function selectEntries(entries, query, consonant, sort) {
  const q = normalize(query);
  return entries.filter(e => (!consonant || initial(e.kor) === consonant) && (!q || normalize(e.kor).includes(q) || normalize(e.eng).includes(q)))
    .sort((a, b) => a[sort].localeCompare(b[sort], sort === 'eng' ? 'en' : 'ko') || a.kor.localeCompare(b.kor, 'ko') || Number(a.id) - Number(b.id));
}
if (typeof module !== 'undefined') module.exports = {initial, selectEntries};
if (typeof document !== 'undefined') {
const $ = id => document.getElementById(id);
let entries = [], consonant = '', page = 1;
const pageSize = 12;
const params = new URLSearchParams(location.search);
$('search').value = params.get('q') || '';
if (['kor','eng','contributor'].includes(params.get('sort'))) $('sort').value = params.get('sort');
if (INITIALS.includes(params.get('initial'))) consonant = params.get('initial');
page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
function saveUrl() {
 const p = new URLSearchParams();
 if ($('search').value) p.set('q', $('search').value);
 if (consonant) p.set('initial', consonant);
 if ($('sort').value !== 'kor') p.set('sort', $('sort').value);
 if (page > 1) p.set('page', page);
 history.replaceState(null, '', location.pathname + (p.size ? '?' + p : '') + location.hash);
}
function button(text, action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click', action); return b; }
function render() {
 const filtered = selectEntries(entries, $('search').value, consonant, $('sort').value);
 const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); page = Math.min(page, pages);
 $('result-count').textContent = `${filtered.length}개 항목 / 전체 ${entries.length}개` + (consonant ? ` · ${consonant}` : '');
 $('entries').replaceChildren();
 for (const entry of filtered.slice((page - 1) * pageSize, page * pageSize)) {
  const tr = document.createElement('tr');
  for (const text of [entry.kor, entry.eng, entry.contributor]) {const td = document.createElement('td'); td.textContent = text; tr.append(td);}
  const td = document.createElement('td'), a = document.createElement('a');
  const source = [...entry.sources].sort((a,b)=>a.timestamp.localeCompare(b.timestamp))[0];
  a.href = source.url; a.target = '_blank'; a.rel = 'noreferrer'; a.textContent = '원문 ↗'; a.setAttribute('aria-label', `${entry.kor} / ${entry.eng} 원문 (새 창)`); a.title = `${source.timestamp.slice(0,4)}-${source.timestamp.slice(4,6)}-${source.timestamp.slice(6,8)} 보존본`;
  td.append(a); tr.append(td); $('entries').append(tr);
 }
 $('empty').hidden = filtered.length > 0;
 $('pagination').replaceChildren();
 if (filtered.length > pageSize) {
  const move = n => {page = n; render(); $('dictionary').scrollIntoView({block:'start'}); const active = $('pagination').querySelector('[aria-current]'); if (active) active.focus({preventScroll:true});};
  const prev = button('←', ()=>move(page-1)); prev.disabled = page === 1; prev.setAttribute('aria-label','이전 페이지'); $('pagination').append(prev);
  for (let n=1;n<=pages;n++) {const b=button(String(n).padStart(2,'0'),()=>move(n)); b.setAttribute('aria-label',`${n}페이지`); if(n===page)b.setAttribute('aria-current','page'); $('pagination').append(b);}
  const next=button('→',()=>move(page+1)); next.disabled=page===pages; next.setAttribute('aria-label','다음 페이지'); $('pagination').append(next);
 }
 for (const b of $('initials').children) b.setAttribute('aria-pressed', String(b.dataset.initial === consonant));
 saveUrl();
}
for (const label of ['전체', ...INITIALS]) {const value = label==='전체'?'':label; const b=button(label,()=>{consonant=value;page=1;render();}); b.dataset.initial=value; b.setAttribute('aria-pressed',String(value===consonant)); $('initials').append(b);}
$('search-form').addEventListener('submit',e=>{e.preventDefault();page=1;render();});
$('search').addEventListener('input',()=>{page=1;render();});
$('sort').addEventListener('change',()=>{page=1;render();});
$('reset').addEventListener('click',()=>{$('search').value='';$('sort').value='kor';consonant='';page=1;render();});
document.addEventListener('keydown',e=>{if(e.key==='/' && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click',()=>{const open=$('sidebar-container').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
document.querySelectorAll('#sidebar-container a').forEach(a=>a.addEventListener('click',()=>{$('sidebar-container').classList.remove('open');menu.setAttribute('aria-expanded','false');}));
function theme(value) {document.documentElement.dataset.theme=value;$('theme').setAttribute('aria-label',value==='dark'?'밝은 테마로 전환':'어두운 테마로 전환');}
try {theme(localStorage.getItem('theme')==='light'?'light':'dark');} catch {}
$('theme').addEventListener('click',()=>{const value=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(value);try{localStorage.setItem('theme',value);}catch{}});
fetch('data/dictionary.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).then(data=>{
 entries=data.entries; $('meta-count').textContent=`${entries.length} restored`;
 $('source-note').textContent=`보존본 ${data.sources.length}개 · 복구 항목 ${entries.length}개 · 2002년 보존본의 표시 총수: 95개 / 2003년 보존본: 117개`;
 render();
}).catch(()=>{$('result-count').textContent='사전 데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';});
}
