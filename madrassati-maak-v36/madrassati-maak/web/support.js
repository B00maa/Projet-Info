'use strict';

const SUPPORT_AR = {
  'J’ai besoin d’aide': 'أحتاج إلى مساعدة', 'Explique où tu bloques.': 'اشرح أين تواجه صعوبة.',
  'Ta question': 'سؤالك', 'Demander de l’aide': 'طلب مساعدة',
  'Une demande est déjà en attente.': 'يوجد طلب مساعدة قيد الانتظار.',
  'Ta question a été transmise dans la démo.': 'تم تسجيل سؤالك في العرض التوضيحي.',
  'Question de Yassine': 'سؤال ياسين', 'En attente de réponse': 'في انتظار الرد',
  'Répondre à la demande d’aide': 'الرد على طلب المساعدة', 'Réponse de l’enseignant': 'رد الأستاذ',
  'Publier la réponse': 'نشر الرد', 'La réponse a été publiée.': 'تم نشر الرد.',
  'Demandes d’aide': 'طلبات المساعدة', 'Nouvelle correction': 'تصحيح جديد',
  'Un délai a été accordé': 'تم تمديد المهلة', 'La date de remise est maintenue': 'تم الإبقاء على موعد التسليم',
  'Réponse à ta question': 'رد على سؤالك', 'Un devoir a été remis': 'تم تسليم واجب',
  'Une demande de délai à examiner': 'طلب مهلة للمراجعة', 'Une question de Yassine': 'سؤال من ياسين',
  'Nouvelle ressource dans la bibliothèque': 'مورد جديد في المكتبة',
  'Devoir à rendre': 'واجب مطلوب تسليمه', 'Aucune notification pour le moment.': 'لا توجد إشعارات حاليًا.',
  'Nouvelle notification': 'إشعار جديد', 'Notification lue': 'إشعار مقروء',
  'Un compte attend son activation': 'حساب في انتظار التفعيل', 'Un dossier attend sa vérification': 'ملف في انتظار المراجعة',
  'Une séance est à reprogrammer': 'حصة تحتاج إلى إعادة البرمجة'
};
for (const [fr, ar] of Object.entries(SUPPORT_AR)) AR_LOOKUP.set(localeKey(fr), ar);

function homeworkHelpPanel(assignment) {
  const request = homeworkBoard().helpRequests?.[assignment.id];
  if (request) {
    const question = `<h3>Question de Yassine</h3><p dir="auto" data-no-i18n="true">${esc(request.question)}</p>`;
    if (request.status === 'answered') return `<section class="homework-help">${question}<h3>Réponse de l’enseignant</h3><p dir="auto" data-no-i18n="true">${esc(request.answer)}</p></section>`;
    const response = state.role === 'professeur' ? `<form id="homeworkHelpReplyForm" class="form" data-id="${esc(assignment.id)}"><label for="homeworkHelpReply">Répondre à la demande d’aide</label><textarea id="homeworkHelpReply" name="answer" dir="auto" maxlength="1500" rows="3" required></textarea><button type="submit" class="btn primary">Publier la réponse</button></form>` : '<p class="tiny muted">En attente de réponse</p>';
    return `<section class="homework-help">${question}${response}</section>`;
  }
  if (state.role !== 'eleve') return '';
  return `<details class="homework-help"><summary>J’ai besoin d’aide</summary><p class="tiny muted">Explique où tu bloques.</p><form id="homeworkHelpForm" data-id="${esc(assignment.id)}" class="form"><label for="homeworkHelpQuestion">Ta question</label><textarea id="homeworkHelpQuestion" name="question" dir="auto" rows="3" maxlength="1500" required></textarea><button class="btn secondary" type="submit">Demander de l’aide</button></form></details>`;
}

function sendHomeworkHelp(id, question) {
  if (state.role !== 'eleve' || !findHomework(id) || !question.trim()) return;
  const saved = saveHomework(board => {
    if (!board.assignments.some(a => a.id === id)) return false;
    board.helpRequests ||= {};
    if (board.helpRequests[id]) { toast('Une demande est déjà en attente.'); return false; }
    board.helpRequests[id] = {status:'pending',question:question.trim().slice(0,1500),askedAt:new Date().toISOString()};
    return true;
  });
  if (saved) refreshHomework(id,'Ta question a été transmise dans la démo.');
}

function answerHomeworkHelp(id, answer) {
  if (state.role !== 'professeur' || !findHomework(id) || !answer.trim()) return;
  const saved = saveHomework(board => {
    const request = board.helpRequests?.[id];
    if (request?.status !== 'pending') return false;
    board.helpRequests[id] = {...request,status:'answered',answer:answer.trim().slice(0,1500),answeredAt:new Date().toISOString()};
    return true;
  });
  if (saved) refreshHomework(id,'La réponse a été publiée.');
}

function supportNotices() {
  const notices = [];
  const board = homeworkBoard();
  const teacher = state.role === 'professeur';
  const learner = ['eleve','parent'].includes(state.role);
  const add = (kind, assignment, stamp, title) => notices.push({key:`${kind}:${assignment.id}:${stamp || 'base'}`,title,detail:homeworkText(assignment,'title'),icon:'clipboard',id:assignment.id,type:'homework',at:kind === 'due' ? assignment.publishedAt || '' : stamp || assignment.dueDate});
  for (const assignment of homeworkList()) {
    const submission = board.submissions[assignment.id];
    const extension = board.extensions[assignment.id];
    const request = board.helpRequests?.[assignment.id];
    if (teacher) {
      if (submission?.status === 'submitted') add('submitted',assignment,submission.submittedAt,'Un devoir a été remis');
      if (extension?.status === 'pending') add('extension-request',assignment,extension.requestedAt,'Une demande de délai à examiner');
      if (request?.status === 'pending') add('help-request',assignment,request.askedAt,'Une question de Yassine');
    }
    if (learner) {
      if (submission?.status === 'corrected') add('corrected',assignment,submission.correctedAt,'Nouvelle correction');
      if (extension && ['approved','declined'].includes(extension.status)) add('extension-'+extension.status,assignment,extension.resolvedAt || extension.requestedAt,extension.status === 'approved' ? 'Un délai a été accordé' : 'La date de remise est maintenue');
      if (request?.status === 'answered') add('help-answer',assignment,request.answeredAt,'Réponse à ta question');
      if (homeworkCanEdit(assignment.id) && homeworkDue(assignment) >= dayKey()) add('due',assignment,homeworkDue(assignment),'Devoir à rendre');
    }
  }
  if (learner) for (const resource of libraryResources().filter(r => r.uploaded)) {
    notices.push({key:`resource:${resource.id}`,title:'Nouvelle ressource dans la bibliothèque',detail:libraryText(resource,'title'),icon:resource.icon,id:resource.id,type:'resource',at:resource.publishedAt});
  }
  if (state.role === 'administration') {
    for (const account of state.accounts.filter(a => a.pendingActivation && !a.active)) notices.push({key:`account:${account.email}`,title:'Un compte attend son activation',detail:account.name,icon:'users',id:'comptes',type:'page',at:''});
    for (const session of scheduledSessions().filter(s => s.needsReschedule)) notices.push({key:`session:${session.id}`,title:'Une séance est à reprogrammer',detail:session.title,icon:'calendar',id:session.id,type:'session',at:''});
  }
  const read = libraryMemory().readNotices[state.role] || [];
  return notices.sort((a,b) => (b.at || '').localeCompare(a.at || '')).map(n => ({...n,read:read.includes(n.key)}));
}

function renderSupportNotifications() {
  const list = supportNotices();
  const count = list.filter(n => !n.read).length;
  const label = state.lang === 'ar' ? `الإشعارات: ${count} غير مقروءة` : `Notifications : ${count} non lues`;
  return `<div class="notification-wrap"><button class="icon-button notification-trigger" data-action="notifications" data-count="${count}" aria-label="${esc(label)}" aria-expanded="false">${icon('bell')}</button><div id="notifications-popover" class="popover hidden"><div class="popover-title">Notifications & rappels</div><div class="support-notices">${list.length ? list.map(n => `<button class="notice-item full ${n.read ? 'is-read' : 'is-unread'}" data-action="support-notice" data-value="${esc(n.key)}">${tile(n.icon,'mint')}<div><strong>${n.title}</strong><p dir="auto" data-no-i18n="true">${esc(n.detail)}</p><small>${n.read ? 'Notification lue' : 'Nouvelle notification'}</small></div></button>`).join('') : '<p class="tiny muted">Aucune notification pour le moment.</p>'}</div>${count ? '<button class="text-link mt" data-action="read-notifications">Tout marquer comme lu</button>' : ''}</div></div>`;
}

function readSupportNotices(keys) {
  return saveLibraryMemory(data => {
    const old = data.readNotices[state.role] || [];
    data.readNotices[state.role] = [...new Set([...old,...keys])];
  },true);
}

function markSupportNoticesRead() {
  if (!readSupportNotices(supportNotices().map(n => n.key))) return;
  render();
  toast('Toutes les notifications ont été marquées comme lues.');
}

function openSupportNotice(key) {
  const notice = supportNotices().find(n => n.key === key);
  if (!notice) return;
  readSupportNotices([key]);
  closePopovers();
  render();
  if (notice.type === 'homework') openHomework(notice.id);
  if (notice.type === 'resource') openLibraryResource(notice.id);
  if (notice.type === 'session') newSession(notice.id);
  if (notice.type === 'page') go(notice.id);
}

function handleLibraryForm(form, values) {
  if (form.id === 'libraryEditorForm') { publishLibraryResource(form,values); return true; }
  if (form.id === 'homeworkHelpForm') { sendHomeworkHelp(form.dataset.id,String(values.question || '')); return true; }
  if (form.id === 'homeworkHelpReplyForm') { answerHomeworkHelp(form.dataset.id,String(values.answer || '')); return true; }
  return false;
}
