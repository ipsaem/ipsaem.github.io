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
let entries = [], dictionaries = [], consonant = '', page = 1, selectedDictionary = '';
const inDictionary = (entries, id) => id ? entries.filter(e => e.dictionaryId === id) : entries;
const pageSize = 12;
const params = new URLSearchParams(location.search);
selectedDictionary = params.get('dictionary') || '';
$('search').value = params.get('q') || '';
if (['kor','eng','contributor'].includes(params.get('sort'))) $('sort').value = params.get('sort');
if (INITIALS.includes(params.get('initial'))) consonant = params.get('initial');
page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
function saveUrl() {
 const p = new URLSearchParams();
 if (selectedDictionary) p.set('dictionary', selectedDictionary);
 if ($('search').value) p.set('q', $('search').value);
 if (consonant) p.set('initial', consonant);
 if ($('sort').value !== 'kor') p.set('sort', $('sort').value);
 if (page > 1) p.set('page', page);
 history.replaceState(null, '', location.pathname + (p.size ? '?' + p : '') + location.hash);
}
function button(text, action) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click', action); return b; }
function render() {
 const scoped = inDictionary(entries, selectedDictionary);
 const filtered = selectEntries(scoped, $('search').value, consonant, $('sort').value);
 const selected = dictionaries.find(d => d.id === selectedDictionary);
 $('dictionary-title').textContent = selected ? selected.title : '모든 사전';
 document.title = selected ? `${selected.title} · 잎샘` : '잎샘 · 단어와 코드를 읽는 곳';
 for (const b of document.querySelectorAll('[data-dictionary]')) b.setAttribute('aria-pressed', String(b.dataset.dictionary === selectedDictionary));
 for (const section of $('dictionary-about').children) section.hidden = !!selectedDictionary && section.dataset.about !== selectedDictionary;
 const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); page = Math.min(page, pages);
 $('result-count').textContent = `${filtered.length}개 항목 / 전체 ${scoped.length}개` + (consonant ? ` · ${consonant}` : '');
 $('entries').replaceChildren();
 for (const entry of filtered.slice((page - 1) * pageSize, page * pageSize)) {
  const tr = document.createElement('tr');
  for (const text of [entry.kor, entry.eng, entry.contributor]) {const td = document.createElement('td'); td.textContent = text; tr.append(td);}
  if (!selectedDictionary) { const label = document.createElement('small'); label.className = 'entry-dictionary'; label.textContent = entry.dictionaryTitle; tr.firstChild.append(label); }
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
async function readJson(path) {
 const response = await fetch(path);
 if (!response.ok) throw Error(`${path}: ${response.status}`);
 return response.json();
}
function chooseDictionary(id) {
 selectedDictionary = id; page = 1; render();
 $('sidebar-container').classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
 $('dictionary').scrollIntoView({block:'start'});
}
function dictionaryButton(title, id) {
 const b = button(title, () => chooseDictionary(id));
 b.dataset.dictionary = id; b.setAttribute('aria-pressed', String(id === selectedDictionary));
 return b;
}
function populateCatalog() {
 const all = dictionaryButton('모든 사전', ''); all.className = 'file-item dictionary-nav-item'; $('dictionary-nav').append(all);
 for (const dictionary of dictionaries) {
  const nav = dictionaryButton(dictionary.title, dictionary.id); nav.className = 'file-item dictionary-nav-item'; $('dictionary-nav').append(nav);
  const card = dictionaryButton('', dictionary.id); card.className = 'dictionary-card';
  const title = document.createElement('strong'); title.textContent = dictionary.title;
  const description = document.createElement('span'); description.textContent = dictionary.description;
  const count = document.createElement('small'); count.textContent = `${dictionary.entries.length}개 항목 · ${dictionary.period}`;
  card.append(title, description, count); $('dictionary-cards').append(card);
  const section = document.createElement('section'); section.dataset.about = dictionary.id;
  const heading = document.createElement('h3'); heading.textContent = dictionary.title; section.append(heading);
  for (const paragraph of dictionary.about) { const p = document.createElement('p'); p.textContent = paragraph; section.append(p); }
  const links = document.createElement('div'); links.className = 'archive-links';
  const source = document.createElement('a'); source.href = dictionary.sourceUrl; source.textContent = '원문 보기 ↗'; source.target = '_blank'; source.rel = 'noreferrer';
  const download = document.createElement('a'); download.href = dictionary.data; download.download = ''; download.textContent = '사전 데이터 내려받기 ↓';
  links.append(source, download); section.append(links);
  const note = document.createElement('p'); note.className = 'source-note'; note.textContent = dictionary.note; section.append(note);
  $('dictionary-about').append(section);
 }
}
(async () => {
 try {
  const catalog = await readJson('data/catalog.json');
  dictionaries = await Promise.all(catalog.dictionaries.map(async dictionary => {
   const data = await readJson(dictionary.data);
   return {...dictionary, entries: data.entries, sources: data.sources};
  }));
  entries = dictionaries.flatMap(d => d.entries.map(entry => ({...entry, dictionaryId:d.id, dictionaryTitle:d.title})));
  if (!dictionaries.some(d => d.id === selectedDictionary)) selectedDictionary = '';
  $('meta-count').textContent = `${entries.length} entries`;
  $('collection-count').textContent = `${dictionaries.length} dictionaries`;
  $('source-note').textContent = `사전 ${dictionaries.length}개 · 전체 ${entries.length}개 항목`;
  populateCatalog(); render();
 } catch {
  $('result-count').textContent = '사전 데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.';
 }
})();
}
