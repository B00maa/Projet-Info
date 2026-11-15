'use strict';

const SCHOOL_ADMIN_GROUPS=[
  ['Pilotage',[['dashboard','home'],['planning','calendar'],['absences','clipboard']]],
  ['Scolarité',[['classes','cap'],['eleves','users'],['professeurs','user'],['parents','users'],['notes','chart'],['evaluations','edit'],['comptes','shield']]],
  ['Outils',[['historique','clipboard'],['bibliotheque','folder'],['statistiques','chart'],['messages','mail'],['annonces','bell'],['parametres','settings']]]
];

const SCHOOL_STAFF_SPACES={
  administration:{title:'Espace administration',label:'Navigation de l’administration',groups:SCHOOL_ADMIN_GROUPS},
  professeur:{title:'Espace professeur',label:'Navigation du professeur',groups:[
    ['Mes classes et élèves',[['dashboard','home'],['messages','mail'],['classes','users'],['eleves','user'],['notes','chart'],['evaluations','edit']]],
    ['Mon organisation',[['planning','calendar'],['presences','clipboard'],['cours','book'],['coach','robot'],
      ['devoirs','file'],['bibliotheque','folder'],['annonces','bell']]]
  ]}
};

function schStaffAvatar(name) {
  const initials=name.trim().split(/\s+/u).slice(0,2).map(word=>[...word][0]||'').join('').toLocaleUpperCase('fr');
  return '<span class="avatar mint" data-no-i18n="true" aria-hidden="true">'+schEsc(initials)+'</span>';
}

function schStaffNavigation(page,data) {
  const role=data.account.role;
  const space=SCHOOL_STAFF_SPACES[role];
  const labels=new Map(SCHOOL_NAV[role]);
  const notices={messages:data.notices?.messages,annonces:data.notices?.announcements};
  return `<button type="button" class="mobile-overlay ${schoolUI.staffMenu?'visible':''}" tabindex="-1"
    data-school-action="staff-menu-close" aria-label="Fermer le menu"></button>
    <aside class="sidebar school-staff-sidebar ${schoolUI.staffMenu?'open':''}" id="schoolStaffSidebar">
      <button type="button" class="icon-button school-staff-menu-close" data-school-action="staff-menu-close" aria-label="Fermer le menu">${siteIcon('close')}</button>
      <a class="brand" href="#dashboard"><img src="/assets/logo.svg" width="36" height="41" alt="">
        <span><strong>Madrassati Maâk</strong><small>L’école à mes côtés · <span lang="ar">مدرستي معاك</span></small></span></a>
      <span class="side-kicker">${space.title}</span>
      <nav class="nav-list" aria-label="${space.label}">${space.groups.map(([group,links])=>
        `<div class="nav-group"><p class="nav-group-label">${group}</p>${links.map(([key,icon])=>
          `<a class="nav-item ${page===key?'active':''}" href="#${key}" ${page===key?'aria-current="page"':''}>
            ${siteIcon(icon)}<span>${labels.get(key)}</span>${notices[key]?'<span class="school-nav-count">'+notices[key]+'</span>':''}</a>`
        ).join('')}</div>`).join('')}</nav>
    </aside>`;
}

function schStaffHeader(page,role) {
  const title=SCHOOL_NAV[role].find(([id])=>id===page)?.[1];
  return `<div class="school-staff-location">
    <button type="button" class="icon-button mobile-toggle" aria-expanded="${schoolUI.staffMenu}" aria-controls="schoolStaffSidebar"
      aria-label="Ouvrir le menu" data-school-action="staff-menu">${siteIcon('menu')}</button>
    <div class="breadcrumb"><span class="breadcrumb-space">${SCHOOL_STAFF_SPACES[role].title}</span>${siteIcon('right')}<strong>${title}</strong></div>
  </div>`;
}

function schStaffMenu(open) {
  if(!SCHOOL_STAFF_SPACES[schoolUI.data?.account.role]||schoolUI.staffMenu===open)return;
  schoolUI.staffMenu=open;
  const sidebar=schNode('schoolStaffSidebar');
  sidebar.classList.toggle('open',open);
  schNode('schoolStaffNavigation').querySelector('.mobile-overlay').classList.toggle('visible',open);
  const trigger=schNode('schoolHeader').querySelector('[data-school-action="staff-menu"]');
  trigger.setAttribute('aria-expanded',String(open));
  (open?sidebar.querySelector('[data-school-action="staff-menu-close"]'):trigger)?.focus({preventScroll:true});
}

const schClassRosterLink=id=>'#eleves?classe='+encodeURIComponent(id);
const schCountLabel=(count,singular,plural)=>`<bdi>${count}</bdi> <span>${count===1?singular:plural}</span>`;

