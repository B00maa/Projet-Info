'use strict';

const state={lang:'fr'};
try { state.lang=localStorage.getItem('madrassati-school-language')==='ar' ? 'ar' : 'fr'; } catch {}
const schoolUI={data:null,error:null,week:'',child:'',request:0,clock:null,dirty:false,busy:false,editor:null,previewUrl:'',
  timer:null,toast:null,peer:'',adminFilters:null,sidebarOpen:false,rosterQuery:'',setupState:'',
  resultFilters:{subject:'',from:'',to:''}};
const SCHOOL_API='/api/school';
const schShowSetup = () => ['ready','missing-code','invalid-code'].includes(schoolUI.setupState);
const SCHOOL_ROLE_NAMES={administration:'Administration',professeur:'Professeur',eleve:'Élève',parent:'Parent'};
const SCHOOL_NAV={
  administration:[['dashboard','Vue d’ensemble'],['planning','Planning des séances'],['absences','Absences et justificatifs'],
    ['classes','Classes'],['eleves','Élèves inscrits'],['professeurs','Professeurs'],['parents','Parents'],['notes','Périodes et résultats'],
    ['evaluations','Évaluations'],['comptes','Gestion des comptes'],['historique','Historique des comptes'],['bibliotheque','Bibliothèque'],
    ['statistiques','Statistiques'],['messages','Messagerie'],['annonces','Annonces'],['parametres','Paramètres'],['notifications','Notifications']],
  professeur:[['dashboard','Mon tableau de bord'],['messages','Messagerie'],['classes','Mes classes'],['eleves','Mes élèves'],
    ['notes','Saisie des notes'],['evaluations','Évaluations'],['planning','Mes séances'],['presences','Suivi des présences'],
    ['cours','Mes cours'],['coach','Coach pédagogique'],['devoirs','Devoirs de mes classes'],['bibliotheque','Bibliothèque'],['annonces','Annonces'],['notifications','Notifications']],
  eleve:[['aujourdhui','Mon tableau de bord'],['planning','Mon calendrier'],['absences','Mes absences'],['fatigue','Mode fatigue'],['cours','Mes matières'],['bibliotheque','Bibliothèque'],
    ['devoirs','Mes devoirs'],['evaluations','Évaluations'],['rattrapage','À rattraper'],['notes','Mes notes et progrès'],
    ['coach','Coach d’études'],['messages','Mes messages'],['annonces','Annonces'],['notifications','Notifications']],
  parent:[['famille','Suivi de mon enfant'],['semaine','Résumé de la semaine'],['planning','Son planning'],['rattrapage','Séances passées'],
    ['absences','Son assiduité'],['fatigue','Mode fatigue'],['devoirs','Ses devoirs'],['evaluations','Évaluations'],
    ['notes','Ses résultats'],['messages','Contacter les enseignants'],['bibliotheque','Bibliothèque'],['annonces','Annonces'],['notifications','Notifications']]
};
const SCHOOL_PERIOD_LABELS={scheduled:'Ouverture programmée',open:'Saisie ouverte',closed:'Saisie fermée',
  'publication-planned':'Publication programmée',published:'Notes publiées'};
const SCHOOL_AR={
  'Espace scolaire':'الفضاء المدرسي','Chargement de l’espace scolaire…':'جارٍ تحميل الفضاء المدرسي…',
  'Comptes et classes':'الحسابات والأقسام','Périodes et résultats':'فترات إدخال النقط والنتائج',
  'Saisie des notes':'إدخال النقط','Mes résultats':'نتائجي','Résumé de la semaine':'ملخّص الأسبوع',
  'Aucun élève associé à ce compte.':'لا يوجد تلميذ مرتبط بهذا الحساب.',
  'Suivi des absences':'متابعة الحصص الفائتة','Aucune séance passée.':'لا توجد حصة سابقة.',
  'Consulter le support':'الاطّلاع على المورد','Faire l’exercice':'إنجاز التمرين',
  'Marquer la séance comme rattrapée':'وضع علامة استدراك الحصة','Étape terminée':'اكتملت الخطوة',
  'Rattrapage terminé':'اكتمل الاستدراك','Voir la séance':'عرض الحصة','Modifier la séance':'تعديل الحصة',
  'Télécharger le dossier de la semaine':'تنزيل ملف الأسبوع','Télécharger le support':'تنزيل المورد',
  'Vidéo en ligne':'فيديو على الإنترنت','Le lien vidéo nécessite une connexion.':'يتطلّب رابط الفيديو اتصالاً بالإنترنت.',
  'Ouvre index.html après avoir décompressé le dossier.':'افتح index.html بعد فك ضغط الملف.',
  'Semaine précédente':'الأسبوع السابق','Semaine suivante':'الأسبوع التالي','Cette semaine':'هذا الأسبوع',
  'Changements de planning':'تغييرات الجدول','Nouvelles notes':'النقط الجديدة','Devoirs de la semaine':'واجبات الأسبوع',
  'Aucun changement cette semaine.':'لا توجد تغييرات هذا الأسبوع.',
  'Aucun devoir cette semaine.':'لا يوجد واجب هذا الأسبوع.',
  'Aucune note publiée.':'لا توجد نقط منشورة.','Aucune séance cette semaine.':'لا توجد حصة هذا الأسبوع.',
  'Consigne':'التعليمات','Date de remise':'تاريخ التسليم','Proposer des créneaux':'اقتراح مواعيد',
  'Aucun créneau trouvé dans les deux prochaines semaines.':'لم يُعثر على موعد متاح في الأسبوعين القادمين.',
  'Créneaux proposés, du lundi au vendredi, entre 8 h et 18 h.':'المواعيد المقترحة من الاثنين إلى الجمعة بين 8 و18.',
  'Vérifier la séance avant publication':'مراجعة الحصة قبل النشر','Retour au formulaire':'العودة إلى الاستمارة',
  'Publier la séance':'نشر الحصة','Enregistrer la séance':'حفظ الحصة','La séance a été enregistrée.':'تم حفظ الحصة.',
  'Nouvelle classe':'قسم جديد','Créer la classe':'إنشاء القسم','Nom de la classe':'اسم القسم',
  'Comptes scolaires':'الحسابات المدرسية','Nouveau compte':'حساب جديد','Créer le compte':'إنشاء الحساب',
  'Aucun compte scolaire créé.':'لم يُنشأ أي حساب مدرسي.',
  'En attente de connexion':'في انتظار تسجيل الدخول','Connecté':'تم تسجيل الدخول',
  'Suspendu':'موقوف','Suspendre':'تعليق','Réactiver':'إعادة التفعيل','Classes enseignées':'الأقسام التي يدرّسها الأستاذ',
  'Élèves associés':'التلاميذ المرتبطون','Crée une classe pour commencer.':'أنشئ قسماً للبدء.',
  'La classe a été créée.':'تم إنشاء القسم.','Le compte a été enregistré.':'تم حفظ الحساب.',
  'Le statut du compte a été modifié.':'تم تغيير حالة الحساب.',
  'Période de saisie':'فترة إدخال النقط','Saisie ouverte':'إدخال النقط مفتوح','Saisie fermée':'إدخال النقط مغلق',
  'Ouverture programmée':'الفتح مبرمج','Publication programmée':'النشر مبرمج','Notes publiées':'النقط المنشورة',
  'Ouverture':'الفتح','Fermeture':'الإغلاق','Publication':'النشر','Horaires du Maroc (GMT)':'بتوقيت المغرب (GMT)',
  'Activer la période':'تفعيل الفترة','Fermer la saisie':'إغلاق إدخال النقط',
  'Programmer la publication':'برمجة النشر','Publier maintenant':'النشر الآن','Annuler la programmation':'إلغاء البرمجة',
  'Date et heure de publication':'تاريخ ووقت النشر','Avancement de la saisie':'تقدّم إدخال النقط',
  'Notes saisies':'النقط المُدخلة','Aucune évaluation dans cette période.':'لا يوجد تقييم في هذه الفترة.',
  'Nouvelle évaluation':'تقييم جديد','Aucune évaluation enregistrée.':'لا يوجد تقييم مسجل.',
  'Notes de l’évaluation':'نقط التقييم','Brouillon':'مسودة','Enregistrer les notes':'حفظ النقط',
  'Lecture seule':'للقراءة فقط','L’administration publie les notes après la saisie.':'تنشر الإدارة النقط بعد إدخالها.',
  'La période a été enregistrée.':'تم حفظ الفترة.','La saisie a été fermée.':'تم إغلاق إدخال النقط.',
  'La publication a été programmée.':'تمت برمجة النشر.','Les notes ont été publiées.':'تم نشر النقط.',
  'La programmation a été annulée.':'أُلغيت برمجة النشر.','Les notes ont été enregistrées.':'تم حفظ النقط.',
  'Se déconnecter':'تسجيل الخروج','Connexion scolaire':'تسجيل الدخول المدرسي',
  'Actualiser':'تحديث','Choisis une classe':'اختر قسماً',
  'Ouvre le fichier joint':'افتح الملف المرفق','Aucun support joint':'لا يوجد مورد مرفق',
  'Rôle':'الدور','Compte scolaire':'حساب مدرسي','Élève suivi':'التلميذ المتابَع',
  'Les horaires du planning utilisent l’heure du Maroc.':'تستخدم مواعيد الجدول توقيت المغرب.',
  'Accès à l’espace scolaire':'الدخول إلى الفضاء المدرسي',
  'Utilise l’adresse communiquée à ton établissement pour retrouver ton espace.':'استخدم العنوان الذي قدّمته لمؤسستك للدخول إلى فضائك.',
  'Le premier compte d’administration doit être activé.':'يجب تفعيل أول حساب للإدارة.',
  'Cette adresse n’est pas encore autorisée par l’établissement.':'هذا العنوان غير مخوّل من المؤسسة بعد.',
  'Ce compte scolaire est suspendu.':'هذا الحساب المدرسي موقوف.',
  'Le stockage de l’espace scolaire est indisponible.':'التخزين المدرسي غير متاح.'
};
for(const [fr,ar] of Object.entries(SCHOOL_AR)) AR_LOOKUP.set(localeKey(fr),ar);

const schEsc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const esc=schEsc;
const schValue=value=>`<bdi data-no-i18n="true">${schEsc(value)}</bdi>`;
const schNode=id=>document.getElementById(id);
const schDialog=()=>schNode('schoolDialog');
const schDay=timestamp=>new Date(timestamp).toISOString().slice(0,10);
const SCHOOL_TIME_ZONE='Africa/Casablanca';
const schMinute=timestamp=>new Intl.DateTimeFormat('sv-SE',{timeZone:SCHOOL_TIME_ZONE,year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(timestamp).replace(' ','T');
const schNow=()=>schoolUI.clock ? schoolUI.clock.now+(performance.now()-schoolUI.clock.at) : Date.now();
const schClock=minute=>`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
const schLocale=()=>state.lang==='ar' ? 'ar-MA-u-ca-gregory-nu-latn' : 'fr-MA';
const schDate=(date,opts={day:'numeric',month:'short'})=>new Intl.DateTimeFormat(schLocale(),{timeZone:'UTC',...opts})
  .format(new Date(date+'T12:00:00Z'));
const schTimestamp=ms=>new Intl.DateTimeFormat(schLocale(),{timeZone:SCHOOL_TIME_ZONE,dateStyle:'medium',timeStyle:'short'}).format(ms);
const schOpt=(value,label,selected)=>`<option value="${schEsc(value)}" ${value===selected?'selected':''}>${schEsc(label)}</option>`;
const schEmpty=label=>`<p class="school-empty">${label}</p>`;
const schError=()=>'<p class="school-form-note" data-school-error role="alert"></p>';
const schRequestedPage=()=>location.hash.slice(1).split('?')[0];
const schViewParams=()=>new URLSearchParams(location.hash.split('?')[1]||'');
const schPage=()=>{
  const tabs=SCHOOL_NAV[schoolUI.data.account.role];
  const requested=schRequestedPage();
  return tabs.some(([key])=>key===requested) ? requested : tabs[0][0];
};
const schPeriod=()=>{
  const value=schoolUI.data?.period;
  if(!value)return null;
  const now=schNow();
  const phase=value.publish_at!==null && value.publish_at<=now ? 'published' :
    value.closed_at!==null || value.closes_at<=now ? (value.publish_at!==null?'publication-planned':'closed') :
    value.opens_at>now ? 'scheduled' : 'open';
  return {...value,phase};
};

function schSafeLink(value) {
  if(!value)return '';
  try { const url=new URL(value);return url.protocol==='https:' ? url.href : ''; }
  catch { return ''; }
}

function schFileLink(id,view=false,childId=schoolUI.data?.child?.id) {
  const params=new URLSearchParams();
  if (view) params.set('view','1');
  if (schoolUI.data?.account.role==='parent' && childId) params.set('child',childId);
  return SCHOOL_API+'/file/'+encodeURIComponent(id)+(params.size ? '?'+params : '');
}

function schClearWorkspaceRoute() {
  const entry={...history.state};
  delete entry.schoolAccount;
  history.replaceState(entry,'',location.pathname+location.search);
}

function schResetWorkspace(clearRoute) {
  clearTimeout(schoolUI.timer);
  clearTimeout(schoolUI.toast);
  schNode('schoolToast').classList.remove('visible');
  if(schoolUI.editor?.kind==='grade') {
    clearTimeout(schoolUI.editor.draftTimer);
    schoolUI.editor.pendingScores=null;
  }
  schClearPreview();
  Object.assign(schoolUI,{data:null,error:null,clock:null,dirty:false,week:'',child:'',peer:'',editor:null,credentials:null,
    adminFilters:null,sidebarOpen:false,rosterQuery:'',resultFilters:{subject:'',from:'',to:''}});
  if(schDialog().open)schDialog().close();
  resetTeacherCoach();
  resetAICoach();
  if(clearRoute) {
    schClearWorkspaceRoute();
    window.scrollTo({top:0,behavior:'instant'});
  }
}

function schToast(text) {
  const toast=schNode('schoolToast');
  toast.textContent=tr(text);
  toast.classList.add('visible');
  clearTimeout(schoolUI.toast);
  schoolUI.toast=setTimeout(()=>toast.classList.remove('visible'),3600);
}

async function schRequest(path,body) {
  const init={cache:'no-store'};
  if (body!==undefined) {
    init.method='POST';
    init.body=body instanceof FormData ? body : JSON.stringify(body);
    if (!(body instanceof FormData)) init.headers={'Content-Type':'application/json'};
  }
  const response=await fetch(SCHOOL_API+path,init);
  if (response.ok) return response.json();
  const payload=await response.json().catch(()=>({}));
  const error=new Error(payload.message||'L’action a échoué. Réessaie.');
  error.status=response.status;
  error.code=payload.code;
  throw error;
}

async function schLoad({quiet=false}={}) {
  const request=++schoolUI.request;
  const params=new URLSearchParams();
  const wanted=schRequestedPage();
  if(schoolUI.data)params.set('view',schPage());
  else if(Object.values(SCHOOL_NAV).some(tabs=>tabs.some(([key])=>key===wanted)))params.set('view',wanted);
  if(schoolUI.week&&params.get('view')!=='dashboard')params.set('week',schoolUI.week);
  if(schoolUI.child)params.set('child',schoolUI.child);
  if(params.get('view')==='historique')params.set('page',schViewParams().get('page')||'1');
  try {
    const data=await schRequest('/state?'+params);
    if(request!==schoolUI.request)return;
    const account=data.account;
    const previous=schoolUI.data?.account;
    const entryAccount=history.state?.schoolAccount;
    const changedAccount=previous&&(previous.id!==account.id||previous.role!==account.role||previous.auth!==account.auth);
    if(changedAccount||(entryAccount&&entryAccount!==account.id)) {
      schResetWorkspace(true);
      schRender();
      return schLoad();
    }
    if(entryAccount!==account.id)history.replaceState({...history.state,schoolAccount:account.id},'');
    const unchanged=schoolUI.data && JSON.stringify({...data,now:0})===JSON.stringify({...schoolUI.data,now:0});
    schoolUI.data=data;
    schoolUI.error=null;
    schoolUI.clock={now:data.now,at:performance.now()};
    if(data.account.passwordSetup) {
      clearTimeout(schoolUI.timer);
      if(!unchanged||!quiet)schRender();
      return;
    }
    schoolUI.week=data.week.start;
    schoolUI.child=data.child?.id||'';
    if(data.view!==schPage())return schLoad({quiet});
    if(quiet && (unchanged || schDialog().open || schoolUI.dirty)) {
      schSyncEditor();
      schScheduleBoundary();
    } else schRender();
  } catch(error) {
    if(request!==schoolUI.request)return;
    if(error.status===404&&params.has('child')) {
      schoolUI.child='';
      return schLoad({quiet});
    }
    const signedOut=error.status===401||error.status===403;
    if(quiet&&!signedOut)return;
    schResetWorkspace(signedOut);
    schoolUI.error=error;
    schRender();
    if(signedOut&&schoolUI.setupState!=='complete') {
      const info=await schRequest('/auth/info').catch(()=>null);
      if(request===schoolUI.request&&info) {
        schoolUI.setupState=info.setupState||(info.setupAvailable?'ready':'');
        const button=schNode('schoolSetupAction');
        if(button)button.hidden=!schShowSetup();
      }
    }
  }
}

function schShowDialog(title,markup) {
  schNode('schoolDialogTitle').textContent=tr(title);
  schNode('schoolClose').textContent=tr('Fermer');
  schNode('schoolDialogBody').innerHTML=localizeHTML(markup);
  if(!schDialog().open)schDialog().showModal();
}

const schCanChangePassword=account=>account.auth==='school'&&['professeur','eleve','parent'].includes(account.role);

function schPasswordForm(firstLogin=false) {
  return `<form class="form" data-school-form="change-password">
    <div><label for="schoolCurrentPassword">${firstLogin?'Code personnel':'Mot de passe actuel'}</label>
      <input id="schoolCurrentPassword" name="currentPassword" type="password" dir="auto"
        autocomplete="current-password" maxlength="256" required></div>
    <div><label for="schoolNewPassword">Nouveau mot de passe</label>
      <input id="schoolNewPassword" name="newPassword" type="password" dir="auto"
        autocomplete="new-password" minlength="15" maxlength="256" aria-describedby="schoolPasswordHelp" required>
      <p id="schoolPasswordHelp" class="school-muted school-small">Utilise une phrase de 15 à 128 caractères que tu peux retenir.</p></div>
    <div><label for="schoolConfirmPassword">Confirmer le nouveau mot de passe</label>
      <input id="schoolConfirmPassword" name="confirmation" type="password" dir="auto"
        autocomplete="new-password" minlength="15" maxlength="256" required></div>
    ${schError()}<div><button type="submit" class="btn primary">Enregistrer le nouveau mot de passe</button></div>
  </form>`;
}

function schPasswordDialog() {
  schShowDialog('Changer le mot de passe',schPasswordForm());
  schNode('schoolCurrentPassword').focus();
}

function schPasswordSubmit(form,button) {
  const values=new FormData(form);
  const currentPassword=values.get('currentPassword');
  const newPassword=values.get('newPassword');
  if(newPassword.normalize('NFC')!==values.get('confirmation').normalize('NFC')) {
    form.querySelector('[data-school-error]').textContent=tr('Les deux nouveaux mots de passe doivent être identiques.');
    schNode('schoolConfirmPassword').focus();
    return;
  }
  const firstLogin=schoolUI.data.account.passwordSetup;
  return schMutation(button,'/auth/password',{currentPassword,newPassword},
    firstLogin?'Ton compte scolaire est activé.':'Mot de passe modifié. Les autres sessions ont été fermées.',{close:true});
}

function schClearPreview() {
  if (schoolUI.previewUrl) URL.revokeObjectURL(schoolUI.previewUrl);
  schoolUI.previewUrl='';
}

function schAuth() {
  const error=schoolUI.error;
  const ready=error?.status===401||error?.status===403;
  const audience=[['cap','Élève'],['users','Parent'],['book','Professeur'],['building','Administration']];
  return `<section class="school-auth" aria-labelledby="schoolAuthTitle">
    <div class="school-auth-welcome">
      <p lang="ar" dir="rtl" class="school-auth-name" data-no-i18n="true">مدرستي معاك</p>
      <p class="school-auth-motto">L’école à mes côtés</p>
      <img src="/assets/family-learning-v3.webp" width="1100" height="733" alt="">
      <ul class="school-auth-audience" aria-label="Profils scolaires">${audience.map(([symbol,label])=>
        `<li>${siteIcon(symbol,'sm')}<span>${label}</span></li>`).join('')}</ul>
    </div>
    <div class="school-auth-card school-stack">
      <div class="school-auth-heading"><span class="school-auth-lock">${siteIcon('lock')}</span>
        <h1 id="schoolAuthTitle">Espace scolaire</h1>
        ${ready?'<p class="school-muted">Connectez-vous avec les accès remis par votre établissement.</p>':''}
      </div>
      ${ready?`<form class="form school-auth-form" data-school-form="school-login">
        <div><label for="schoolLoginId">Identifiant scolaire</label>
          <input id="schoolLoginId" name="login" dir="ltr" autocomplete="username" autocapitalize="none"
            spellcheck="false" maxlength="40" required></div>
        <div><label for="schoolLoginCode">Mot de passe ou code personnel</label>
          <div class="school-auth-password">
            <input id="schoolLoginCode" type="password" name="code" dir="auto" autocomplete="current-password" maxlength="256" required>
            <button type="button" class="school-header-icon" data-school-action="toggle-login-code" aria-controls="schoolLoginCode"
              aria-label="Afficher le mot de passe" title="Afficher le mot de passe">${siteIcon('eye','sm')}</button>
          </div></div>
        ${schError()}<button type="submit" class="btn primary school-auth-submit"><span>Se connecter à l’école</span>${siteIcon('arrow','sm')}</button>
      </form>`:`<p role="status" class="school-muted">${schEsc(error?.message||'Chargement de l’espace scolaire…')}</p>
        ${error?'<div><button type="button" class="btn secondary" data-school-action="refresh">Réessayer</button></div>':''}`}
      <div id="schoolSetupAction" ${ready&&schShowSetup()?'':'hidden'}>
        <div class="school-auth-footer"><button type="button" class="btn secondary small"
          data-school-action="activate-administration">${siteIcon('settings','sm')}<span>Activer l’administration</span></button></div>
      </div>
    </div>
  </section>`;
}

function schToggleLoginCode(button) {
  const input=schNode('schoolLoginCode');
  const visible=input.type==='password';
  input.type=visible?'text':'password';
  const label=tr(visible?'Masquer le mot de passe':'Afficher le mot de passe');
  button.setAttribute('aria-label',label);
  button.title=label;
  button.innerHTML=siteIcon(visible?'eye-off':'eye','sm');
}

function schChildPicker(data) {
  if(data.account.role!=='parent'||data.children.length<2)return '';
  return `<div class="school-child-picker"><label for="schoolChild">Élève suivi</label>
    <select id="schoolChild">${data.children.map(child=>schOpt(child.id,child.name,data.child?.id)).join('')}</select></div>`;
}

function schHeaderTools(data,workspace=false) {
  const languageLabel=state.lang==='ar'?'Afficher le site en français':'Afficher le site en arabe';
  const language=`<button type="button" class="school-header-icon school-language" data-school-action="language"
    aria-label="${languageLabel}" title="${languageLabel}"><span data-no-i18n="true">${state.lang==='ar'?'FR':'العربية'}</span></button>`;
  if(!data)return `<div class="school-header-tools">${language}</div>`;
  const {account}=data;
  const user=`<span class="school-user">${schWorkspaceAvatar(account.name)}
    <span class="school-user-name"><strong>${schValue(account.name)}</strong>
      ${account.name!==SCHOOL_ROLE_NAMES[account.role]?'<small>'+SCHOOL_ROLE_NAMES[account.role]+'</small>':''}</span></span>`;
  const count=data.unreadNotifications||0;
  const notifications=`<a class="school-header-icon school-inbox-link" href="#notifications" aria-label="Notifications" title="Notifications"
    ${schPage()==='notifications'?'aria-current="page"':''} ${count?'aria-describedby="schoolUnreadNotifications"':''}>
    ${siteIcon('bell')}${count?`<span class="school-icon-count" aria-hidden="true">${count>99?'99+':count}</span>`:''}</a>
    ${count?`<span class="sr-only" id="schoolUnreadNotifications">${schCountLabel(count,'notification non lue','notifications non lues')}</span>`:''}`;
  const logoutLabel='aria-label="Se déconnecter" title="Se déconnecter"';
  const logout=account.auth==='school'?`<button type="button" class="school-header-icon school-logout-icon"
    data-school-action="school-logout" ${logoutLabel}>${siteIcon('logout')}</button>`:
    `<a class="school-header-icon school-logout-icon" href="/signout-with-chatgpt?return_to=%2Fecole" target="_top"
      data-school-action="external-logout" ${logoutLabel}>${siteIcon('logout')}</a>`;
  return `<div class="school-header-tools">${language}${workspace?notifications:''}${logout}
    ${workspace?`<details class="school-account-menu"><summary aria-label="Menu du compte" title="Menu du compte">
      ${user}${siteIcon('chevron','sm')}</summary>
      <div class="school-account-actions">${schCanChangePassword(account)?`<button type="button" data-school-action="change-password">
        ${siteIcon('lock','sm')}<span>Changer le mot de passe</span></button>`:''}
        <button type="button" data-school-action="refresh">${siteIcon('refresh','sm')}<span>Actualiser</span></button></div></details>`:''}</div>`;
}

function schRender() {
  const scroll=schoolScrollSnapshot();
  applyLanguage();
  const data=schoolUI.data;
  const role=data?.account.role;
  const admin=role==='administration';
  const passwordSetup=data?.account.passwordSetup;
  const workspace=!!SCHOOL_SPACES[role]&&!passwordSetup;
  const page=data?schPage():'';
  const nav=schNode('schoolWorkspaceNavigation');
  const header=schNode('schoolHeader');
  if(workspace)document.body.dataset.space=role;
  else delete document.body.dataset.space;
  nav.hidden=!workspace;
  nav.innerHTML=workspace?localizeHTML(schWorkspaceNavigation(page,data)):'';
  header.className=workspace?'topbar school-workspace-topbar':'school-header';
  header.innerHTML=localizeHTML((workspace?schWorkspaceHeader(page,role):
    '<a class="school-brand" href="/"><img src="/assets/logo.svg" width="42" height="42" alt=""><strong>Madrassati Maâk</strong></a>')+
    schHeaderTools(data,workspace));
  if(!data){schNode('schoolApp').innerHTML=localizeHTML(schAuth());return;}
  if(passwordSetup) {
    schNode('schoolApp').innerHTML=localizeHTML(`<section class="card school-stack school-password-setup">
      <h1>Choisis ton mot de passe</h1><p>Saisis le code remis par l’établissement, puis choisis le mot de passe de ton compte scolaire.</p>
      ${schPasswordForm(true)}</section>`);
    return;
  }
  const chooser=['famille','messages','annonces','notifications'].includes(page)?'':schChildPicker(data);
  const content={dashboard:admin?schAdminDashboard:schTeacherDashboard,classes:admin?schAdminClasses:schTeacherClasses,
    eleves:admin?schAccountsPage:schTeacherStudents,professeurs:schAccountsPage,presences:schTeacherAttendance,
    comptes:schAccountsPage,parents:schAccountsPage,historique:schAdminHistory,statistiques:schAdminStatistics,parametres:schAdminSettings,
    aujourdhui:schTodayPage,famille:schFamilyPage,planning:schPlanningPage,notes:schNotesPage,rattrapage:schCatchupPage,semaine:schParentPage,
    absences:schAbsencesPage,fatigue:schFatiguePage,cours:schCoursesPage,bibliotheque:schLibraryPage,devoirs:schHomeworkPage,
    evaluations:schAssessmentsPage,messages:schMessagesPage,annonces:schAnnouncementsPage,notifications:schNotificationsPage,
    coach:data.account.role==='eleve'?studentCoachPage:teacherCoachPage};
  const view=data.view===page?content[page]():'<p role="status" class="school-empty">Chargement de l’espace scolaire…</p>';
  schNode('schoolApp').innerHTML=localizeHTML(chooser+view);
  restoreSchoolScroll(scroll);
  schoolUI.dirty=false;
  schScheduleBoundary();
  if(page==='coach') {
    if(data.account.role==='eleve') {
      scrollAICoach();
      if(!aiCoach.access)checkAICoachAccess();
    } else {
      if(!teacherCoach.access)checkTeacherCoachAccess();
      loadTeacherCourse();
    }
  }
}

function schWeekBar(showPack=false) {
  const week=schoolUI.data.week;
  const [start,end]=[schDate(week.start),schDate(week.end,{day:'numeric',month:'short',year:'numeric'})];
  return `<div class="school-week">
    <div class="school-actions">
      <button type="button" class="btn secondary small" data-school-action="week" data-value="-1">Semaine précédente</button>
      <time data-no-i18n="true" datetime="${week.start}">${schEsc(start+' – '+end)}</time>
      <button type="button" class="btn secondary small" data-school-action="week" data-value="1">Semaine suivante</button>
    </div>
    <div class="school-actions"><button type="button" class="btn secondary small" data-school-action="week" data-value="0">Cette semaine</button>
      ${showPack?`<button type="button" class="btn primary" data-school-action="download-pack" ${schoolUI.data.sessions.length||schoolUI.data.assignments?.length?'':'disabled'}>Télécharger le dossier de la semaine</button>
        <button type="button" class="btn secondary" data-school-action="weekly-pdf" ${schoolUI.data.sessions.length||schoolUI.data.assignments?.length?'':'disabled'}>Fiche de la semaine PDF</button>`:''}</div>
  </div>`;
}

function schSessionMeta(item) {
  return `<div class="school-meta"><span>${schValue(item.class_name)}</span><span>·</span><span>${schValue(item.subject)}</span>
    <span>·</span><time data-no-i18n="true" datetime="${item.date}">${schEsc(schDate(item.date))} · <bdi dir="ltr">${schClock(item.start_minute)}–${schClock(item.start_minute+item.duration)}</bdi></time></div>`;
}

function schSessionRow(item,edit=false,showTeacher=true,showQuiz=false) {
  const now=schMinute(schNow());
  const future=item.date+'T'+schClock(item.start_minute)>now;
  const cancelled=item.cancelled_at!=null;
  const {account,directory}=schoolUI.data;
  const admin=account.role==='administration';
  const canEdit=edit&&!cancelled&&['administration','professeur'].includes(account.role);
  const needsTeacher=admin&&schAdminSessionNeedsTeacher(item,directory,now);
  return `<article class="school-session"><div class="school-session-top"><div><h3>${schValue(item.title)}</h3>
    ${schSessionMeta(item)}${showTeacher?`<p class="school-muted school-small">${schValue(item.teacher_name)}</p>`:''}
    ${needsTeacher?'<span class="tag orange">Professeur à réattribuer</span>':''}
    ${item.series_id?'<span class="tag soft">Série hebdomadaire</span>':''}
    ${cancelled?'<span class="tag orange">Séance annulée</span>':''}</div>
    <div class="school-actions"><button type="button" class="btn secondary small" data-school-action="view-session" data-id="${item.id}">Voir la séance</button>
    ${showQuiz?schQuizActions(item):''}
    ${canEdit&&!future?`<button type="button" class="btn secondary small" data-school-action="attendance" data-id="${item.id}">Faire l’appel</button>`:''}
    ${canEdit?`<button type="button" class="btn secondary small" data-school-action="edit-session" data-id="${item.id}">Modifier la séance</button>`:''}
    ${edit&&admin&&future?`<button type="button" class="btn secondary small" data-school-action="session-cancellation" data-id="${item.id}">
      ${cancelled?'Rétablir la séance':'Annuler la séance'}</button>`:''}</div></div></article>`;
}

function schLessonReading(description) {
  const lesson=teacherLessonReferences(description);
  if(!lesson)return '<p data-no-i18n="true" dir="auto">'+schEsc(description)+'</p>';
  const language=/[\p{Script=Arabic}]/u.test(description.slice(0,500))?'ar':
    description.startsWith(TEACHER_LESSON_TERMS.en.objectives)?'en':'fr';
  const headings=new Map([...lesson.sections].map(([number,section])=>[section.index,{number,title:section.title}]));
  return '<article class="school-lesson-reading" dir="auto" data-no-i18n="true">'+lesson.parts.map((part,index)=>{
    const heading=headings.get(index);
    const lines=part.split('\n');
    const title=heading?'<h4 tabindex="-1" data-lesson-section="'+index+'">'+schEsc(lines.shift())+'</h4>':'';
    const body=lines.map(line=>lesson.links.has(line)?
      '<button type="button" class="lesson-reference" data-lesson-reference="'+lesson.links.get(line)+'">'+schEsc(line)+'</button>':schEsc(line)).join('\n');
    const figure=heading&&lessonDiagramForHeading(heading.title);
    return title+'<p>'+body+'</p>'+(figure?renderLessonFigure(figure,language):'');
  }).join('')+'</article>';
}

function schSessionContent(item,previewUrl='',childId=schoolUI.data?.child?.id) {
  const file=item.file;
  const support=previewUrl || (file && item.id ? schFileLink(item.id,true,childId) : '');
  const video=schSafeLink(item.video_url);
  const cancelled=item.cancelled_at!=null;
  const meeting=cancelled?'':schSafeLink(item.meeting_url);
  const calm=schoolUI.data?.account.role==='eleve'&&schFatigueCurrent()?.status==='approved';
  const work=calm&&item.short_exercise?item.short_exercise:item.exercise;
  const quiz=schQuizActions(item);
  return `<div class="school-stack">
    ${schSessionMeta(item)}
    ${cancelled?`<section class="school-callout school-cancelled-note"><h3>Séance annulée</h3>
      <p data-no-i18n="true" dir="auto">${schEsc(item.cancel_reason)}</p></section>`:''}
    ${item.description?`<section class="school-block"><h3>Consigne</h3>${schLessonReading(item.description)}</section>`:''}
    ${file&&support?`<section class="school-block"><h3>Support de la séance</h3>
      ${file.type?.startsWith('video/')?`<video controls preload="metadata" src="${schEsc(support)}"></video>`:''}
      <a class="btn secondary" href="${schEsc(support)}" target="_blank" rel="noopener noreferrer">${schValue(file.name)}</a>
      ${previewUrl?'':`<a class="btn secondary" href="${schEsc(schFileLink(item.id,false,childId))}">Télécharger le support</a>`}</section>`:''}
    ${video?`<section class="school-block"><a href="${schEsc(video)}" target="_blank" rel="noopener noreferrer" class="btn secondary">Vidéo en ligne</a></section>`:''}
    ${work?`<section class="school-block"><h3>${work===item.short_exercise&&calm?'Exercice en version courte':'Exercice associé'}</h3>
      <p data-no-i18n="true" dir="auto">${schEsc(work)}</p>
      <p class="school-small school-muted"><span>Date de remise</span> · ${schValue(schDate(item.due_date||item.date))}</p></section>`:''}
    ${meeting?`<div><a class="btn primary" href="${schEsc(meeting)}" target="_blank" rel="noopener noreferrer">Rejoindre la séance</a></div>`:''}
    ${quiz?`<div class="school-actions">${quiz}</div>`:''}</div>`;
}

function schPlanningPage() {
  const data=schoolUI.data;
  const admin=data.account.role==='administration';
  const edit=admin||data.account.role==='professeur';
  const ready=admin?schAdminCanSchedule(data.directory):!!data.directory.classes?.length;
  const review=admin&&schViewParams().get('etat')==='reaffecter';
  const now=schMinute(schNow());
  const sessions=review?data.sessions.filter(item=>schAdminSessionNeedsTeacher(item,data.directory,now)):data.sessions;
  return `<div class="school-title"><h1>${SCHOOL_NAV[data.account.role].find(([key])=>key==='planning')[1]}</h1>
    ${edit?`<button type="button" class="btn primary" data-school-action="edit-session" ${ready?'':'disabled'}>Nouvelle séance</button>`:''}</div>
    ${schFatigueBanner()}
    ${schWeekBar(data.account.role==='eleve')}
    ${admin?`<nav class="school-actions school-directory-tabs" aria-label="État des séances">
      <a class="btn ${review?'secondary':'primary'} small" href="#planning" ${review?'':'aria-current="page"'}>Toutes les séances</a>
      <a class="btn ${review?'primary':'secondary'} small" href="#planning?etat=reaffecter" ${review?'aria-current="page"':''}>À réattribuer</a></nav>`:''}
    ${data.account.role==='eleve'?'<p class="school-small school-muted school-note">Ouvre index.html après avoir décompressé le dossier. Le lien vidéo nécessite une connexion.</p>':''}
    <section class="card">${sessions.length?sessions.map(item=>schSessionRow(item,edit)).join(''):
      schEmpty(review?'Aucune séance à réattribuer cette semaine.':'Aucune séance cette semaine.')}</section>`;
}

function schFindSession(id) {
  const data=schoolUI.data;
  return [...data.sessions,...(data.upcoming||[]),...(data.catchup||[]),...(data.changes||[]),...(data.assignments||[]),
    ...(data.courses||[]),...(data.supports||[])].find(item=>item.id===id);
}

function schCatchupPage() {
  const focus=schViewParams().get('seance');
  const previous=[...(schoolUI.data.catchup||[])].sort((a,b)=>Number(b.id===focus)-Number(a.id===focus));
  if(schoolUI.data.account.role==='parent')return `<div class="school-title"><h1>Séances passées</h1></div>
    <section class="card">${previous.length?previous.map(item=>schSessionRow(item)).join(''):schEmpty('Aucune séance passée.')}</section>`;
  const labels=['Consulter le support','Faire l’exercice','Marquer la séance comme rattrapée'];
  const render=item=>`<section class="card school-stack">
      <div class="school-session-top"><div><h2>${schValue(item.title)}</h2>${schSessionMeta(item)}</div>
        ${item.step===3?'<span class="tag mint">Rattrapage terminé</span>':item.missed?'<span class="tag orange">Séance manquée</span>':''}
      </div><ol class="school-checks">${labels.map((label,i)=>`<li class="${item.step>i?'done':''}">
        <span class="school-step-number" aria-hidden="true">${item.step>i?'✓':i+1}</span>
        <span>${label}</span>${item.step>i?'<span class="sr-only">Étape terminée</span>':''}</li>`).join('')}</ol>
      <div class="school-actions"><button type="button" class="btn secondary" data-school-action="view-session" data-id="${item.id}">Voir la séance</button>
        ${item.step<3?`<button type="button" class="btn primary" data-school-action="catchup" data-id="${item.id}" data-value="${item.step+1}">${['Support consulté','Exercice fait','Marquer la séance comme rattrapée'][item.step]}</button>`:''}</div>
      </section>`;
  const missed=previous.filter(item=>item.missed);
  const other=previous.filter(item=>!item.missed);
  return `<div class="school-title"><h1>À rattraper</h1></div>
    <div class="school-stack">${missed.length?missed.map(render).join(''):
      `<section class="card">${schEmpty('Aucune séance manquée signalée.')}</section>`}
    ${other.length?`<details class="card school-details"><summary>Autres séances passées</summary>
      <div class="school-stack school-note">${other.map(render).join('')}</div></details>`:''}</div>`;
}

function schGradesTable(grades) {
  if(!grades.length)return schEmpty('Aucune note publiée.');
  const number=new Intl.NumberFormat(schLocale(),{maximumFractionDigits:2});
  return `<div class="school-table-wrap"><table class="school-table"><thead><tr><th scope="col">Matière</th><th scope="col">Évaluation</th>
    <th scope="col">Date</th><th scope="col">Note / 20</th></tr></thead><tbody>
    ${grades.map(item=>`<tr><td>${schValue(item.subject)}</td><td>${schValue(item.title)}</td>
      <td>${schValue(schDate(item.date))}</td><td><span class="tag mint">${schValue(number.format(item.score))}</span></td></tr>`).join('')}
    </tbody></table></div>`;
}

function schParentPage() {
  const data=schoolUI.data;
  const childSelect=data.children.length===1?`<span class="tag mint">${schValue(data.child.name)}</span>`:'';
  if(!data.child)return `<div class="school-title"><h1>Résumé de la semaine</h1></div>${schParentLifeSummary()}<section class="card">${schEmpty('Aucun élève associé à ce compte.')}</section>`;
  const assignments=data.assignments||[];
  const changes=data.changes||[];
  return `<div class="school-title"><h1>Résumé de la semaine</h1>${childSelect}</div>
    ${schParentLifeSummary()}
    ${schWeekBar()}<div class="school-grid">
    <section class="card"><h2>Devoirs de la semaine</h2>${assignments.length?assignments.map(item=>
      `<article class="school-session"><h3>${schValue(item.title)}</h3><div class="school-meta">${schValue(item.subject)} · ${schValue(schDate(item.due_date))}</div>
      <button class="btn secondary small" type="button" data-school-action="view-session" data-id="${item.id}">Voir la séance</button></article>`
    ).join(''):schEmpty('Aucun devoir cette semaine.')}</section>
    <section class="card"><h2>Changements de planning</h2>${changes.length?changes.map(item=>schSessionRow(item)).join(''):schEmpty('Aucun changement cette semaine.')}</section>
    <section class="card school-full"><div class="school-session-top"><h2>Nouvelles notes</h2>${schGradeReportButton()}</div>
      ${schGradesTable(data.grades||[])}</section>
    <section class="card school-full"><h2>Séances de la semaine</h2>${data.sessions.length?data.sessions.map(item=>schSessionRow(item)).join(''):schEmpty('Aucune séance cette semaine.')}</section>
    </div>`;
}

async function schDownloadPack(button) {
  button.disabled=true;
  try {
    const response=await fetch(SCHOOL_API+'/pack?week='+encodeURIComponent(schoolUI.data.week.start),{cache:'no-store'});
    if(!response.ok)throw new Error((await response.json().catch(()=>({}))).message||'Le téléchargement a échoué.');
    const url=URL.createObjectURL(await response.blob());
    const link=document.createElement('a');
    link.href=url;
    link.download='Madrassati-Maak-'+schoolUI.data.week.start+'.zip';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  } catch(error) { schToast(error.message); }
  finally { button.disabled=false; }
}

function schScheduleBoundary() {
  clearTimeout(schoolUI.timer);
  const period=schPeriod();
  const now=schNow();
  const fatigue=schFatigueCurrent();
  const next=[period?.opens_at,period?.end,period?.publish_at,fatigue?.expires_at]
    .filter(time=>time>now).sort((a,b)=>a-b)[0];
  if(next)schoolUI.timer=setTimeout(()=>{
    schSyncEditor();
    if(!schDialog().open && !schoolUI.dirty)schRender();
    schLoad({quiet:true});
  },Math.min(next-now+20,2147483647));
}

async function schMutation(button,path,data,success,{close=false,week,onSaved}={}) {
  if(schoolUI.busy)return;
  schoolUI.busy=true;
  if(button)button.disabled=true;
  const error=button?.closest('form')?.querySelector('[data-school-error]');
  if(error)error.textContent='';
  try {
    const result=await schRequest(path,data);
    if(close && schDialog().open)schDialog().close();
    if(week)schoolUI.week=week;
    schoolUI.dirty=false;
    await schLoad();
    if(onSaved)await onSaved(result);
    if(success)schToast(success);
  } catch(failure) {
    if(error)error.textContent=tr(failure.message);
    else schToast(failure.message);
  } finally {
    schoolUI.busy=false;
    if(button && button.isConnected)button.disabled=false;
    schSyncEditor();
  }
}

window.addEventListener('DOMContentLoaded',()=>{
  schNode('schoolClose').addEventListener('click',()=>schDialog().close());
  schDialog().addEventListener('close',()=>{
    if(schDialog().open)return;
    schCloseGradeEditor(schoolUI.editor);
    schoolUI.editor=null;schoolUI.credentials=null;schClearPreview();
    if(!schoolUI.dirty&&schoolUI.data)schRender();
  });
  document.addEventListener('input',event=>{
    if(schGradeInput(event.target))return;
    if(event.target.matches('input[data-school-directory]')&&schDirectoryInput(event.target))return;
    if(event.target.id==='schoolRosterSearch'&&schTeacherSearch(event.target))return;
    if(event.target.id==='coachAIInput'){aiCoach.draft=event.target.value;schoolUI.dirty=!!aiCoach.draft;return;}
    rememberTeacherCoachInput(event.target);
    if(event.target.closest('#schoolApp form'))schoolUI.dirty=true;
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='teacherCourseSelect') {
      if(event.target.value)loadTeacherCourse(event.target.value);
      else newTeacherCourse();
      return;
    }
    if(event.target.matches('select[data-school-directory]')&&schDirectoryInput(event.target))return;
    if(event.target.id==='schoolTeacherClassFilter'&&schTeacherChangeClass(event.target))return;
    if(schResultChange(event.target))return;
    if(rememberTeacherCoachInput(event.target))return;
    if(event.target.id==='schoolChild'){
      schoolUI.child=event.target.value;
      schLoad().then(()=>schNode('schoolChild')?.focus({preventScroll:true}));
      return;
    }
    schLifeChange(event.target);
    schStaffChange(event.target);
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='coachAIForm'){
      event.preventDefault();
      schoolUI.dirty=false;
      sendAIQuestion(new FormData(event.target).get('question'));
      return;
    }
    if(event.target.id==='teacherCoachForm'){
      event.preventDefault();
      generateTeacherDraft(Object.fromEntries(new FormData(event.target)));
      return;
    }
    if(!event.target.matches('[data-school-form]'))return;
    event.preventDefault();
    if(event.target.dataset.schoolForm==='change-password')return schPasswordSubmit(event.target,event.submitter);
    if(event.target.dataset.schoolForm==='teacher-course')return submitTeacherCourseForm(event.target,event.submitter);
    if(['quiz-save','quiz-submit'].includes(event.target.dataset.schoolForm))return schQuizSubmit(event.target,event.submitter);
    if(!schLifeSubmit(event.target,event.submitter))schStaffSubmit(event.target,event.submitter);
  });
  document.addEventListener('click',event=>{
    const openAccount=schNode('schoolHeader').querySelector('.school-account-menu[open]');
    if(openAccount&&!openAccount.contains(event.target))openAccount.open=false;
    if(event.target.closest('#schoolWorkspaceSidebar a[href^="#"]')&&schoolUI.sidebarOpen)schWorkspaceMenu(false);
    const lessonReference=event.target.closest('[data-lesson-reference]');
    if(lessonReference){
      const heading=lessonReference.closest('.school-lesson-reading')
        ?.querySelector('[data-lesson-section="'+Number(lessonReference.dataset.lessonReference)+'"]');
      heading?.focus({preventScroll:true});heading?.scrollIntoView({block:'start'});
      return;
    }
    const coachButton=event.target.closest('#teacherCoachWorkspace [data-action]');
    if(coachButton) {
      if(coachButton.dataset.action==='coach-retry')return checkTeacherCoachAccess();
      if(teacherCoachAction(coachButton.dataset.action,coachButton.dataset.value)){
        event.preventDefault();return;
      }
    }
    const studentCoach=event.target.closest('#aiCoachPanel [data-action]');
    if(studentCoach){
      const {action,value}=studentCoach.dataset;
      if(action==='coach-prompt')return chooseCoachPrompt(value);
      if(action==='coach-retry')return checkAICoachAccess();
      if(action==='coach-retry-answer')return sendAIQuestion('',true);
    }
    const button=event.target.closest('[data-school-action]');
    if(!button || button.disabled)return;
    const {schoolAction:action,id,value}=button.dataset;
    const accountMenu=button.closest('.school-account-menu');
    if(accountMenu)accountMenu.open=false;
    if(action==='language'){
      state.lang=state.lang==='fr'?'ar':'fr';
      try { localStorage.setItem('madrassati-school-language',state.lang); } catch {}
      schRender();
    } else if(action==='refresh')schLoad();
    else if(action==='toggle-login-code')schToggleLoginCode(button);
    else if(action==='external-logout')schClearWorkspaceRoute();
    else if(action==='activate-administration'&&schShowSetup())schSetupDialog();
    else if(action==='download-codes'&&schDialog().open&&schoolUI.credentials)schCodesWorkbook();
    else if(!schoolUI.data)return;
    else if(action==='change-password'&&schCanChangePassword(schoolUI.data.account))schPasswordDialog();
    else if(action==='workspace-menu')schWorkspaceMenu(true);
    else if(action==='workspace-menu-close')schWorkspaceMenu(false);
    else if(action==='week'){
      schoolUI.week=Number(value)===0?'':schDay(schoolUI.data.week.from+Number(value)*7*86400000);
      schLoad();
    } else if(action==='view-session'){
      const session=schFindSession(id);
      if(session)schShowDialog(session.title,schSessionContent(session));
    } else if(action==='catchup')schMutation(button,'/catchup',{id,step:Number(value)},'Étape terminée');
    else if(action==='open-notification')schOpenNotification(button);
    else if(action==='grade-detail')schOpenGrade(button);
    else if(action==='quiz'||action.startsWith('quiz-'))schQuizAction(button);
    else if(action==='download-pack')schDownloadPack(button);
    else if(!schLifeAction(button))schStaffAction(button);
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const openAccount=schNode('schoolHeader').querySelector('.school-account-menu[open]');
    if(openAccount) {
      openAccount.open=false;
      openAccount.querySelector('summary').focus({preventScroll:true});
    }
    if(schoolUI.sidebarOpen)schWorkspaceMenu(false);
  });
  window.addEventListener('hashchange',()=>{
    if(!schoolUI.data)return;
    if(schoolUI.data.account.passwordSetup)return;
    if(history.state?.schoolAccount&&history.state.schoolAccount!==schoolUI.data.account.id)schClearWorkspaceRoute();
    if(schDialog().open)schDialog().close();
    if(SCHOOL_SPACES[schoolUI.data.account.role]) {
      schoolUI.adminFilters=null;
      schoolUI.rosterQuery='';
      schWorkspaceMenu(false);
      window.scrollTo({top:0,behavior:'instant'});
    }
    schLoad();
  });
  window.addEventListener('focus',()=>{if(schoolUI.data && !schoolUI.busy)schLoad({quiet:true});});
  setInterval(()=>{if(!document.hidden && schoolUI.data && !schoolUI.busy)schLoad({quiet:true});},25000);
  schLoad();
});
