'use strict';

const AI_COACH_ACCESS = {
  loading:'Vérification de l’accès au coach IA…',
  school:'Le coach en ligne est accessible depuis le compte scolaire.',
  'needs-key':'La connexion au service IA doit être configurée par l’établissement.',
  'sign-in':'Reconnecte-toi à ton espace scolaire.',
  forbidden:'Ce compte ne dispose pas de l’accès au coach IA.',
  offline:'Le coach IA est indisponible pour le moment.'
};
const AI_COACH_ACCOUNT_STATES = ['needs-key','sign-in','forbidden'];

async function readAICoachAccess(school) {
  if (!school) return 'school';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(),7000);
  try {
    const response = await fetch('/api/school/coach/status',{cache:'no-store',signal:controller.signal});
    const {status} = await response.json();
    if (response.ok && (status === 'ready' || AI_COACH_ACCOUNT_STATES.includes(status))) return status;
    if (response.status===401) return 'sign-in';
    if (response.status===403) return 'forbidden';
  } catch { /* Les questions couvertes localement restent disponibles. */ }
  finally { clearTimeout(timeout); }
  return 'offline';
}

async function requestAICoach(payload,signal,route='/api/coach') {
  const response = await fetch(route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
  const data = await response.json().catch(() => ({status:'invalid-response'}));
  return {ok:response.ok,data:data || {status:'invalid-response'}};
}

function coachRetryDelay(seconds) {
  if(!Number.isInteger(seconds)||seconds<=0)return '';
  const [unit,divisor]=seconds>=3600?['hour',3600]:seconds>=60?['minute',60]:['second',1];
  return new Intl.NumberFormat(state.lang==='ar'?'ar':'fr',{style:'unit',unit}).format(Math.ceil(seconds/divisor));
}

function coachSchoolLink() {
  return '<a class="btn secondary" href="/ecole#coach">Ouvrir l’espace scolaire</a>';
}

function aiCoachAccessPanel(access) {
  const message = AI_COACH_ACCESS[access] || AI_COACH_ACCESS.loading;
  const action = ['school','sign-in'].includes(access) ? coachSchoolLink() :
    access === 'offline' ? '<button type="button" class="btn secondary" data-action="coach-retry">Réessayer</button>' : '';
  return `<div class="coach-ai-status"><p role="status">${message}</p>${action}</div>`;
}
