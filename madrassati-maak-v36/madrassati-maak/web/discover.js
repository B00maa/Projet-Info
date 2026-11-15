'use strict';

// Recherche, favoris et parties en pause : aucune requête distante n'est requise.
const DISCOVER_AR={
 'Rechercher':'بحث','Chercher un cours, un jeu…':'ابحث عن درس أو لعبة…',
 'Recherche rapide':'البحث السريع','Rechercher dans mon espace':'البحث في فضائي',
 'À portée de main':'في متناولك','Résultats':'نتائج','Aucun résultat pour cette recherche':'لا توجد نتائج لهذا البحث',
 'Essaie une matière comme « mathématiques », ou un mot du titre.':'جرّب اسم مادة مثل الرياضيات أو كلمة من العنوان.',
 'Recherche limitée aux rubriques de votre profil.':'يقتصر البحث على أقسام حسابك.',
 'Ouvrir la rubrique':'فتح القسم','Ressource pédagogique':'مورد دراسي','Activité de ma classe':'نشاط قسمي',
 'Aventure éducative':'مغامرة تعليمية','Ma bibliothèque':'مكتبتي','Des idées à portée de main.':'أفكار في متناولك.',
 'Retrouve une leçon, garde-la en favori et reviens quand tu veux.':'ابحث عن درس وأضفه إلى المفضّلة وعد إليه متى شئت.',
 'Mes favoris':'مفضّلتي','Toutes les ressources':'كل الموارد','Ajouter aux favoris':'إضافة إلى المفضّلة',
 'Retirer des favoris':'إزالة من المفضّلة','Ressource ajoutée aux favoris.':'أُضيف المورد إلى المفضّلة.',
 'Ressource retirée des favoris.':'أُزيل المورد من المفضّلة.',
 'Aucun favori pour le moment':'لا توجد موارد مفضّلة بعد',
 'Le marque-page permet de garder une ressource ici.':'استعمل علامة الكتاب للاحتفاظ بمورد هنا.',
 'Aucun favori ne correspond à la recherche':'لا يوجد مورد مفضّل يطابق البحث',
 'Afficher toutes les ressources':'عرض كل الموارد','Favoris de mon espace':'مفضّلات فضائي',
 'TES DÉCOUVERTES':'اكتشافاتك','Une aventure t’attend.':'مغامرتك تنتظرك.',
 'Reprends là où tu t’es arrêté.':'واصل من حيث توقّفت.',
 'Nouvelle partie':'لعبة جديدة','Reprendre':'متابعة','Partie sauvegardée':'حُفِظت اللعبة','Mettre en pause':'إيقاف مؤقّت',
 'Tu peux fermer cette page. Ta partie reste disponible ici.':'يمكنك إغلاق هذه الصفحة. ستجد لعبتك هنا لاحقًا.',
 'Cette partie ne peut plus être reprise. Tu peux commencer une nouvelle aventure.':'تعذّرت متابعة هذه اللعبة. يمكنك بدء مغامرة جديدة.',
 'Accueil':'الرئيسية','Jeux':'الألعاب','Messages':'الرسائل','Suivi':'المتابعة','Résultats scolaires':'النتائج',
 'Planning':'الجدول','Classes':'الأقسام','Comptes':'الحسابات','Dossiers':'الملفّات',
 'Navigation rapide':'التنقّل السريع','Terminé':'مكتمل',
 'Pour retrouver tes découvertes':'للعثور على اكتشافاتك',
 'Tes favoris et tes jeux en pause restent enregistrés dans ce navigateur.':'تُحفَظ مواردك المفضّلة وألعابك المتوقّفة في هذا المتصفّح.'
};
for(const [fr,ar] of Object.entries(DISCOVER_AR))AR_LOOKUP.set(localeKey(fr),ar);

function bilingualSearchText(...parts){
  return searchKey(parts.flatMap(value=>[String(value||''),AR_LOOKUP.get(localeKey(String(value||'')))||'']).join(' '));
}
function favoriteIds(role=state.role){
  const ids=state.favoriteResources?.[role];
  return Array.isArray(ids)?[...new Set(ids.filter(id=>libraryResources(role).some(r=>r.id===id)))]:[];
}
function isFavoriteResource(id){return favoriteIds().includes(id)}
function favoriteResourceButton(id,small=false){
  const saved=isFavoriteResource(id),label=saved?'Retirer des favoris':'Ajouter aux favoris',title=libraryResource(id)?libraryText(libraryResource(id),'title'):'';
  return `<button class="${small?'icon-button resource-bookmark':'btn secondary favorite-lesson'} ${saved?'is-saved':''}" data-action="favorite-resource" data-id="${esc(id)}" aria-label="${esc(tr(label)+': '+tr(title))}" title="${esc(tr(label)+': '+tr(title))}" aria-pressed="${saved}">${icon('bookmark','sm')}${small?'':`<span>${label}</span>`}</button>`;
}
function toggleFavoriteResource(id){
  if(!libraryResource(id)||!allowedPages().has('resources'))return;
  const saved=isFavoriteResource(id),stored=state.favoriteResources?.[state.role];
  const ids=Array.isArray(stored)?[...new Set(stored)]:[];
  state.favoriteResources={...state.favoriteResources,[state.role]:saved?ids.filter(x=>x!==id):[...ids,id]};
  const lessonOpen=!!document.querySelector('.lesson-view');
  persist();render();
  if(lessonOpen){openResource(id);previousFocus=document.querySelector(`[data-action="resource-open"][data-id="${id}"]`)||document.getElementById('main')||previousFocus;}else (document.querySelector(`[data-action="favorite-resource"][data-id="${id}"]`)||document.querySelector('[data-action="favorite-filter"]'))?.focus();
  toast(saved?'Ressource retirée des favoris.':'Ressource ajoutée aux favoris.');
}
function filteredResourceList(){
  const tokens=searchKey(state.resourceSearch).trim().split(/\s+/).filter(Boolean);
  return libraryResources().filter(r=>(state.resourceType==='all'||r.type===state.resourceType)&&(!state.resourceSavedOnly||isFavoriteResource(r.id))&&(state.libraryClass==='all'||r.classId===state.libraryClass)&&(state.librarySubject==='all'||r.subjectId===state.librarySubject)&&(state.libraryLanguage==='all'||r.language===state.libraryLanguage||r.language==='bi'&&['fr','ar'].includes(state.libraryLanguage))&&tokens.every(t=>bilingualSearchText(r.title,r.subject,r.kind,r.description).includes(t)));
}
function resourceLibraryResults(){
  const list=filteredResourceList();
  if(!libraryResources().length)return `<div class="library-empty">${tile('book','mint')}<h2>Aucune ressource publiée.</h2><p>Les ressources de votre classe apparaîtront ici.</p></div>`;
  if(!list.length&&state.resourceSavedOnly)return `<div class="library-empty">${tile('bookmark','mint')}<h2>${favoriteIds().length?'Aucun favori ne correspond à la recherche':'Aucun favori pour le moment'}</h2><p>${state.resourceSearch?'Essaie une matière comme « mathématiques », ou un mot du titre.':'Le marque-page permet de garder une ressource ici.'}</p><button class="btn secondary" data-action="show-all-resources">Afficher toutes les ressources</button></div>`;
  return resourceCards(list);
}
function renderResourceLibrary(){return renderLibraryPage()}

let quickSearchValue='';
function searchCatalogue(){
  const entries=menu[state.role].filter(([id])=>allowedPages().has(id)).map(([id,i,title])=>({key:'page:'+id,title,meta:'Ouvrir la rubrique',icon:i,type:'page',id}));
  entries.push(...libraryResources().map(r=>({key:'resource:'+r.id,title:r.title,meta:r.subject,icon:r.icon,type:'resource',id:r.id,kind:r.kind})));
  if(['eleve','parent','professeur'].includes(state.role))entries.push(...homeworkList().map(a=>({key:'assignment:'+a.id,title:a.title,meta:'Activité de ma classe',icon:'clipboard',type:'assignment',id:String(a.id)})));
  if(state.role==='eleve'&&state.examples)entries.push(...GAME_DEFS.map(g=>({key:'game:'+g.id,title:g.title,meta:g.subject,icon:g.icon,type:'game',id:g.id,kind:'Aventure éducative'})));
  return entries;
}
function quickSearchResults(){
  const query=searchKey(quickSearchValue).trim(),tokens=query.split(/\s+/).filter(Boolean),all=searchCatalogue();
  let list;
  if(!tokens.length)list=[...all.filter(e=>e.type==='resource'&&isFavoriteResource(e.id)).slice(0,3),...all.filter(e=>e.type==='page').slice(0,4)];
  else list=all.filter(e=>tokens.every(t=>bilingualSearchText(e.title,e.meta,e.kind).includes(t))).sort((a,b)=>Number(bilingualSearchText(b.title).startsWith(query))-Number(bilingualSearchText(a.title).startsWith(query))).slice(0,12);
  return `<div class="search-result-heading"><span>${tokens.length?'Résultats':'À portée de main'}</span><span>${list.length}</span></div>${list.length?list.map(e=>`<button class="catalog-result" data-action="catalog-open" data-value="${esc(e.key)}">${tile(e.icon,e.type==='game'?'orange':e.type==='resource'?'mint':'')}<span><strong>${esc(e.title)}</strong><small>${esc(e.meta)}</small></span>${icon('arrow','sm')}</button>`).join(''):`<div class="search-no-results">${icon('search')}<h3>Aucun résultat pour cette recherche</h3><p>Essaie une matière comme « mathématiques », ou un mot du titre.</p></div>`}`;
}
function openQuickSearch(){
  quickSearchValue='';
  openModal('Recherche rapide',`<div class="quick-search-field">${icon('search')}<label class="sr-only" for="quickSearchInput">Rechercher dans mon espace</label><input id="quickSearchInput" dir="auto" type="search" placeholder="Chercher un cours, un jeu…" maxlength="100" autocomplete="off"></div><div class="catalog-results" id="catalogResults" aria-live="polite">${quickSearchResults()}</div><p class="catalog-scope">${icon('shield','sm')}Recherche limitée aux rubriques de votre profil.</p>`,false,'quick-search-modal');
  document.getElementById('quickSearchInput')?.focus();
}
function openCatalogueEntry(key){
  const entry=searchCatalogue().find(e=>e.key===key);if(!entry)return;
  closeModal();
  if(entry.type==='resource')openResource(entry.id);
  if(entry.type==='assignment')openAssignment(entry.id);
  if(entry.type==='page')go(entry.id);
  if(entry.type==='game'){
    go('jeux');
    startGame(entry.id);
  }
}

// Les parties sont reconstruites à partir de la banque d'exercices ; le score
// n'est jamais restauré depuis un nombre fourni par le stockage.
function restoredGame(raw){
  if(!raw||raw.version!==1||raw.completed||raw.phase!=='playing'||!['decouverte','explorateur'].includes(raw.difficulty))return null;
  const def=GAME_DEFS.find(g=>g.id===raw.id);if(!def||raw.kind!==def.kind)return null;
  const a={id:raw.id,kind:raw.kind,difficulty:raw.difficulty,phase:'playing',completed:false,index:0,correct:0,choice:null};
  if(a.kind==='quiz'){
    const bank=QUIZ_BANK[a.id]?.[a.difficulty];
    if(!Array.isArray(raw.questions)||![3,5].includes(raw.questions.length)||!Number.isInteger(raw.index)||raw.index<0||raw.index>=raw.questions.length||!Array.isArray(raw.answers))return null;
    const seen=new Set(),questions=[];
    for(const q of raw.questions){
      const row=bank.find(r=>r[0]===q?.prompt);
      if(!row||seen.has(q.prompt)||!Array.isArray(q.options)||q.options.length!==4)return null;
      seen.add(q.prompt);
      const order=q.options.map(o=>row[1].indexOf(o?.text));
      if(order.some(n=>n<0)||new Set(order).size!==4)return null;
      questions.push({prompt:row[0],explanation:row[3],options:order.map(n=>({text:row[1][n],correct:n===row[2]}))});
    }
    if(raw.answers.length!==raw.index+(raw.choice===null?0:1)||raw.answers.some(n=>!Number.isInteger(n)||n<0||n>3)||raw.choice!==null&&raw.choice!==raw.answers[raw.index])return null;
    a.questions=questions;a.index=raw.index;a.choice=raw.choice;a.answers=raw.answers.slice();
    a.correct=a.answers.reduce((n,answer,i)=>n+Number(questions[i].options[answer].correct),0);
  }else{
    if(![3,4,6].includes(raw.total)||!Array.isArray(raw.cards)||raw.cards.length!==raw.total*2||!Array.isArray(raw.matched)||!Array.isArray(raw.open))return null;
    const pairBank=new Map(),seen=new Set();a.cards=[];
    for(const c of raw.cards){
      if(!c||!Number.isInteger(c.pair)||c.pair<0||c.pair>=raw.total||![0,1].includes(c.side)||seen.has(c.pair+':'+c.side))return null;
      const bankIndex=MEMORY_PAIRS.findIndex(p=>p[c.side]===c.text);
      if(bankIndex<0||pairBank.has(c.pair)&&pairBank.get(c.pair)!==bankIndex)return null;
      seen.add(c.pair+':'+c.side);pairBank.set(c.pair,bankIndex);a.cards.push({pair:c.pair,side:c.side,text:MEMORY_PAIRS[bankIndex][c.side]});
    }
    if(new Set(pairBank.values()).size!==raw.total||new Set(raw.matched).size!==raw.matched.length||raw.matched.some(n=>!Number.isInteger(n)||!pairBank.has(n)))return null;
    a.total=raw.total;a.matched=raw.matched.slice();a.correct=a.matched.length;a.moves=Number.isInteger(raw.moves)&&raw.moves>=0?Math.min(raw.moves,100000):0;
    a.open=raw.open.length===1&&Number.isInteger(raw.open[0])&&a.cards[raw.open[0]]&&!a.matched.includes(a.cards[raw.open[0]].pair)?raw.open.slice():[];
    a.locked=false;
  }
  return a;
}
function restoreSavedGames(saved){
  const result={};
  for(const def of GAME_DEFS){const a=restoredGame(saved?.[def.id]);if(a)result[def.id]={...a,version:1};}
  return result;
}
function checkpointGame(){
  const a=state.activeGame;if(state.role!=='eleve'||!a)return;
  if(a.completed){delete state.savedGames[a.id];return;}
  const raw={...a,version:1};
  const clean=restoredGame(raw);
  if(clean)state.savedGames[a.id]={...clean,version:1};
}
function resumeGame(id){
  if(state.role!=='eleve')return;
  const a=restoredGame(state.savedGames[id]);
  if(!a){delete state.savedGames[id];persist();toast('Cette partie ne peut plus être reprise. Tu peux commencer une nouvelle aventure.');return;}
  clearTimeout(state.memoryTimer);state.activeGame=a;go('jeux');render();
}
function pausedGameBanner(){
  const def=GAME_DEFS.find(g=>state.savedGames[g.id]);if(!def)return '';
  const a=state.savedGames[def.id];
  return `<section class="resume-adventure"><span class="resume-game-icon">${icon(def.icon)}</span><div><span class="section-kicker">Partie sauvegardée</span><h2>${def.title}</h2><p>Reprends là où tu t’es arrêté.</p><span class="resume-progress">${a.kind==='quiz'?`Question ${a.index+1} sur ${a.questions.length}`:`${a.matched.length} / ${a.total} paires retrouvées`}</span></div><button class="btn secondary" data-action="game-resume" data-id="${def.id}">${icon('play','sm')}Reprendre</button></section>`;
}
function dashboardDiscovery(){
  return `${state.examples?pausedGameBanner():''}${favoriteIds().length?`<section class="dashboard-favorites"><div class="card-heading"><h2>Mes favoris</h2><button class="text-link" data-action="open-favorites">Voir tout ${icon('arrow','sm')}</button></div><div class="favorite-shortcuts">${favoriteIds().slice(0,2).map(id=>{const r=libraryResource(id);return `<button data-action="resource-open" data-id="${r.id}">${tile(r.icon,'mint')}<span>${libraryTextHTML(r,'title','strong')}<small>${r.subject}</small></span>${icon('right','sm')}</button>`}).join('')}</div></section>`:''}`;
}
function mobileNavigation(){
  if(['accueil','connexion'].includes(state.page))return '';
  const tabs={eleve:[['dashboard','home','Accueil'],state.examples?['jeux','gamepad','Jeux']:['calendrier','calendar','Planning'],['devoirs','clipboard','Devoirs'],['messagerie','mail','Messages']],parent:[['dashboard','home','Suivi'],['calendrier','calendar','Planning'],['devoirs','clipboard','Devoirs'],['messagerie','mail','Messages']],professeur:[['dashboard','home','Accueil'],['classes','users','Classes'],['calendrier','calendar','Planning'],['messagerie','mail','Messages']],administration:[['dashboard','home','Accueil'],['calendrier','calendar','Planning'],['classes','cap','Classes'],['comptes','users','Comptes']]};
  return `<nav class="mobile-dock" aria-label="Navigation rapide">${tabs[state.role].filter(([page])=>allowedPages().has(page)).map(([page,i,label])=>`<a href="#${state.role}/${page}" class="dock-link ${state.page===page?'active':''}" ${state.page===page?'aria-current="page"':''}>${icon(i)}<span>${label}</span></a>`).join('')}</nav>`;
}
