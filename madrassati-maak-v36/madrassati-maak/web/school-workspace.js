'use strict';

const SCHOOL_ADMIN_GROUPS=[
  ['Pilotage',[['dashboard','home'],['planning','calendar'],['absences','clipboard']]],
  ['Scolarité',[['classes','cap'],['eleves','users'],['professeurs','user'],['parents','users'],['notes','chart'],['evaluations','edit'],['comptes','shield']]],
  ['Outils',[['historique','clipboard'],['bibliotheque','folder'],['statistiques','chart'],['messages','mail'],['annonces','bell'],['parametres','settings']]]
];

const SCHOOL_SPACES={
  administration:{title:'Espace administration',label:'Navigation de l’administration',groups:SCHOOL_ADMIN_GROUPS},
  professeur:{title:'Espace professeur',label:'Navigation du professeur',groups:[
    ['Mes classes et élèves',[['dashboard','home'],['messages','mail'],['classes','users'],['eleves','user'],['notes','chart'],['evaluations','edit']]],
    ['Mon organisation',[['planning','calendar'],['presences','clipboard'],['cours','book'],['coach','robot'],
      ['devoirs','file'],['bibliotheque','folder'],['annonces','bell']]]
  ]},
  eleve:{title:'Espace élève',label:'Navigation de l’élève',groups:[
    ['Mon apprentissage',[['aujourdhui','home'],['cours','book'],['devoirs','clipboard'],['evaluations','edit'],['notes','chart'],['coach','robot']]],
    ['Mon quotidien',[['planning','calendar'],['rattrapage','clock'],['absences','clipboard'],['bibliotheque','folder'],
      ['messages','mail'],['fatigue','heart'],['annonces','bell']]]
  ]},
  parent:{title:'Espace parent',label:'Navigation du parent',groups:[
    ['Le suivi scolaire',[['famille','home'],['planning','calendar'],['devoirs','clipboard'],['rattrapage','clock'],['notes','chart'],
      ['absences','clipboard'],['evaluations','edit'],['semaine','file']]],
    ['Échanges et ressources',[['messages','mail'],['bibliotheque','folder'],['fatigue','heart'],['annonces','bell']]]
  ]}
};

function schWorkspaceAvatar(name) {
  const initials=name.trim().split(/\s+/u).slice(0,2).map(word=>[...word][0]||'').join('').toLocaleUpperCase('fr');
  return '<span class="avatar mint" data-no-i18n="true" aria-hidden="true">'+schEsc(initials)+'</span>';
}

function schWorkspaceNavigation(page,data) {
  const role=data.account.role;
  const space=SCHOOL_SPACES[role];
  const labels=new Map(SCHOOL_NAV[role]);
  const notices={messages:data.notices?.messages,annonces:data.notices?.announcements,fatigue:data.notices?.fatigue};
  return `<button type="button" class="mobile-overlay ${schoolUI.sidebarOpen?'visible':''}" tabindex="-1"
    data-school-action="workspace-menu-close" aria-label="Fermer le menu"></button>
    <aside class="sidebar school-workspace-sidebar ${schoolUI.sidebarOpen?'open':''}" id="schoolWorkspaceSidebar">
      <button type="button" class="icon-button school-workspace-menu-close" data-school-action="workspace-menu-close" aria-label="Fermer le menu">${siteIcon('close')}</button>
      <a class="brand" href="#${SCHOOL_NAV[role][0][0]}"><img src="/assets/logo.svg" width="36" height="41" alt="">
        <span><strong>Madrassati Maâk</strong><small>L’école à mes côtés · <span lang="ar">مدرستي معاك</span></small></span></a>
      <span class="side-kicker">${space.title}</span>
      <nav class="nav-list" aria-label="${space.label}">${space.groups.map(([group,links])=>
        `<div class="nav-group"><p class="nav-group-label">${group}</p>${links.map(([key,icon])=>
          `<a class="nav-item ${page===key?'active':''}" href="#${key}" ${page===key?'aria-current="page"':''}>
            ${siteIcon(icon)}<span>${labels.get(key)}</span>${notices[key]?'<span class="school-nav-count" data-no-i18n="true">'+notices[key]+'</span>':''}</a>`
        ).join('')}</div>`).join('')}</nav>
    </aside>`;
}

function schWorkspaceHeader(page,role) {
  const title=SCHOOL_NAV[role].find(([id])=>id===page)?.[1];
  return `<div class="school-workspace-location">
    <button type="button" class="icon-button mobile-toggle" aria-expanded="${schoolUI.sidebarOpen}" aria-controls="schoolWorkspaceSidebar"
      aria-label="Ouvrir le menu" data-school-action="workspace-menu">${siteIcon('menu')}</button>
    <div class="breadcrumb"><span class="breadcrumb-space">${SCHOOL_SPACES[role].title}</span>${siteIcon('right')}<strong>${title}</strong></div>
  </div>`;
}

function schWorkspaceMenu(open) {
  if(!SCHOOL_SPACES[schoolUI.data?.account.role]||schoolUI.sidebarOpen===open)return;
  schoolUI.sidebarOpen=open;
  const sidebar=schNode('schoolWorkspaceSidebar');
  sidebar.classList.toggle('open',open);
  schNode('schoolWorkspaceNavigation').querySelector('.mobile-overlay').classList.toggle('visible',open);
  const trigger=schNode('schoolHeader').querySelector('[data-school-action="workspace-menu"]');
  trigger.setAttribute('aria-expanded',String(open));
  (open?sidebar.querySelector('[data-school-action="workspace-menu-close"]'):trigger)?.focus({preventScroll:true});
}

const schClassRosterLink=id=>'#eleves?classe='+encodeURIComponent(id);
const schCountLabel=(count,singular,plural)=>`<bdi>${count}</bdi> <span>${count===1?singular:plural}</span>`;

