'use strict';

const GRADE_PERIOD_KEY = 'madrassati-maak-periode-notes-v1';
// GMT is Morocco's legal time since September 2026. Keep deadlines consistent
// on browsers whose regional time-zone data predates the change.
const GRADE_PERIOD_ZONE = 'UTC';
const GRADE_PERIOD_STATUS = {
  closed:['Saisie fermée','orange','lock'],
  scheduled:['Ouverture programmée','blue','clock'],
  open:['Saisie ouverte','mint','check'],
  expired:['Période terminée','orange','lock']
};
let gradePeriodTimer;

const GRADE_PERIOD_AR = {
  'Période de saisie des notes':'فترة إدخال النقط',
  'Saisie fermée':'إدخال النقط مغلق', 'Saisie ouverte':'إدخال النقط مفتوح',
  'Ouverture programmée':'الفتح مبرمج', 'Période terminée':'انتهت الفترة',
  'Ouverture':'الفتح', 'Fermeture':'الإغلاق',
  'Date et heure d’ouverture':'تاريخ ووقت الفتح', 'Date et heure de fermeture':'تاريخ ووقت الإغلاق',
  'Horaires du Maroc (GMT)':'بتوقيت المغرب', 'Activer la période':'تفعيل الفترة',
  'Fermer la saisie':'إغلاق إدخال النقط', 'La période a été enregistrée.':'تم حفظ الفترة.',
  'La saisie des notes a été fermée.':'تم إغلاق إدخال النقط.',
  'Indiquez deux dates et heures valides en heure du Maroc.':'أدخلوا تاريخين ووقتين صالحين بتوقيت المغرب.',
  'La fermeture doit suivre l’ouverture et être dans le futur.':'يجب أن يكون وقت الإغلاق بعد الفتح وفي المستقبل.',
  'Impossible d’enregistrer la période dans ce navigateur.':'تعذّر حفظ الفترة في هذا المتصفّح.',
  'L’administration fixe la période de saisie des notes.':'تحدّد الإدارة فترة إدخال النقط.',
  'Cette période s’applique à tous les professeurs.':'تنطبق هذه الفترة على جميع الأساتذة.',
  'Réglage conservé dans ce navigateur.':'يُحفَظ هذا الإعداد في هذا المتصفّح.',
  'Lecture seule. La saisie est fermée.':'للقراءة فقط. إدخال النقط مغلق.',
  'La période de saisie est fermée.':'فترة إدخال النقط مغلقة.',
  'Voir les notes':'عرض النقط', 'Notes de l’évaluation':'نقط التقييم'
};
for (const [fr,ar] of Object.entries(GRADE_PERIOD_AR)) AR_LOOKUP.set(localeKey(fr),ar);

function gradePeriodInput(timestamp) {
  return new Date(timestamp).toISOString().slice(0,16);
}

function gradePeriodTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(value + ':00Z');
  return Number.isFinite(timestamp) && gradePeriodInput(timestamp) === value ? timestamp : null;
}

function readGradePeriod() {
  try {
    const period = JSON.parse(localStorage.getItem(GRADE_PERIOD_KEY));
    if (typeof period?.active !== 'boolean' || !Number.isFinite(period.opensAt) ||
        !Number.isFinite(period.closesAt) || period.opensAt >= period.closesAt ||
        !Number.isFinite(new Date(period.opensAt).getTime()) || !Number.isFinite(new Date(period.closesAt).getTime())) return null;
    return period;
  } catch { return null; }
}

function gradePeriodPhase(period,now) {
  if (!period?.active) return 'closed';
  if (now < period.opensAt) return 'scheduled';
  return now < period.closesAt ? 'open' : 'expired';
}

function gradePeriodIsOpen() {
  return gradePeriodPhase(readGradePeriod(),Date.now()) === 'open';
}

function gradePeriodTime(timestamp) {
  const locale = state.lang === 'ar' ? 'ar-MA-u-ca-gregory-nu-latn' : 'fr-MA';
  const formatter = new Intl.DateTimeFormat(locale,{timeZone:GRADE_PERIOD_ZONE,dateStyle:'medium',timeStyle:'short'});
  return `<time datetime="${new Date(timestamp).toISOString()}" data-no-i18n="true">${esc(formatter.format(timestamp))}</time>`;
}

function gradePeriodSummary(period,phase) {
  const [label,tone,symbol] = GRADE_PERIOD_STATUS[phase];
  return `<div class="grade-period-heading">
    <span class="tag ${tone}">${icon(symbol,'sm')}<span>${label}</span></span>
    ${period ? '<span class="tiny muted">Horaires du Maroc (GMT)</span>' : ''}
  </div>
  ${period ? `<dl class="grade-period-times">
    <div><dt>Ouverture</dt><dd>${gradePeriodTime(period.opensAt)}</dd></div>
    <div><dt>Fermeture</dt><dd>${gradePeriodTime(period.closesAt)}</dd></div>
  </dl>` : '<p class="tiny muted">L’administration fixe la période de saisie des notes.</p>'}`;
}

function adminGradePeriodPage() {
  const period = readGradePeriod();
  return `${heading('Période de saisie des notes')}
    <section class="card grade-period-panel">
      <div id="gradePeriodStatus" role="status"></div>
      <form class="form grade-period-form" id="gradePeriodForm">
        <p class="tiny muted">Cette période s’applique à tous les professeurs.</p>
        <div class="grade-period-dates">
          <div><label for="gradePeriodOpens">Date et heure d’ouverture</label>
            <input type="datetime-local" id="gradePeriodOpens" name="opensAt" dir="ltr" value="${gradePeriodInput(period?.opensAt ?? Date.now())}" required></div>
          <div><label for="gradePeriodCloses">Date et heure de fermeture</label>
            <input type="datetime-local" id="gradePeriodCloses" name="closesAt" dir="ltr" value="${period ? gradePeriodInput(period.closesAt) : ''}" required></div>
        </div>
        <p class="tiny muted"><span>Horaires du Maroc (GMT)</span> · <span>Réglage conservé dans ce navigateur.</span></p>
        <p class="error" id="gradePeriodError" role="alert"></p>
        <div class="homework-actions">
          <button class="btn primary" type="submit" id="gradePeriodActivate">${icon('check','sm')}<span>Activer la période</span></button>
          <button class="btn secondary" type="button" id="gradePeriodClose" data-action="grade-period-close">${icon('lock','sm')}<span>Fermer la saisie</span></button>
        </div>
      </form>
    </section>`;
}

function refreshGradePeriod() {
  clearTimeout(gradePeriodTimer);
  if (state.page !== 'notes' || !['administration','professeur'].includes(state.role)) return;
  const now = Date.now();
  const period = readGradePeriod();
  const phase = gradePeriodPhase(period,now);
  const summary = document.getElementById('gradePeriodStatus');
  const summaryKey = `${phase}:${period?.opensAt}:${period?.closesAt}`;
  if (summary && summary.dataset.period !== summaryKey) {
    summary.dataset.period = summaryKey;
    summary.innerHTML = localizeHTML(gradePeriodSummary(period,phase));
  }
  const active = phase === 'open' || phase === 'scheduled';
  if (state.role === 'professeur') syncGradebookAccess(phase === 'open');
  else {
    const form = document.getElementById('gradePeriodForm');
    if (form) {
      const saving = form.dataset.saving === 'true';
      document.getElementById('gradePeriodActivate').disabled = saving;
      document.getElementById('gradePeriodClose').disabled = saving || !active;
    }
  }
  if (active) {
    const boundary = phase === 'scheduled' ? period.opensAt : period.closesAt;
    gradePeriodTimer = setTimeout(refreshGradePeriod,Math.min(boundary - now,2147483647));
  }
}

async function updateGradePeriod(form,change,success,failure) {
  if (state.role !== 'administration' || state.page !== 'notes' || !form?.isConnected || form.dataset.saving === 'true') return;
  const error = form.querySelector('#gradePeriodError');
  form.dataset.saving = 'true';
  error.textContent = '';
  refreshGradePeriod();
  try {
    const saved = await withGradebookLock(() => {
      if (!form.isConnected || state.role !== 'administration' || state.page !== 'notes') return false;
      const next = change(readGradePeriod(),Date.now());
      if (!next) return false;
      localStorage.setItem(GRADE_PERIOD_KEY,JSON.stringify(next));
      return true;
    });
    if (!form.isConnected) return;
    if (saved) toast(success);
    else error.textContent = tr(failure);
  } catch {
    error.textContent = tr('Impossible d’enregistrer la période dans ce navigateur.');
  } finally {
    delete form.dataset.saving;
    refreshGradePeriod();
  }
}

function saveGradePeriod(form,values) {
  if (state.role !== 'administration' || state.page !== 'notes') return;
  const opensAt = gradePeriodTimestamp(values.opensAt);
  const closesAt = gradePeriodTimestamp(values.closesAt);
  const error = form.querySelector('#gradePeriodError');
  if (opensAt === null || closesAt === null) {
    error.textContent = tr('Indiquez deux dates et heures valides en heure du Maroc.');
    form.elements[opensAt === null ? 'opensAt' : 'closesAt'].focus();
    return;
  }
  const invalidEnd = 'La fermeture doit suivre l’ouverture et être dans le futur.';
  if (closesAt <= opensAt || closesAt <= Date.now()) {
    error.textContent = tr(invalidEnd);
    form.elements.closesAt.focus();
    return;
  }
  return updateGradePeriod(form,(_,now) => closesAt > now ? {opensAt,closesAt,active:true} : null,
    'La période a été enregistrée.',invalidEnd);
}

function closeGradePeriod() {
  const form = document.getElementById('gradePeriodForm');
  return updateGradePeriod(form,(period,now) => {
    const phase = gradePeriodPhase(period,now);
    return phase === 'open' || phase === 'scheduled' ? {...period,active:false} : null;
  },'La saisie des notes a été fermée.','La période de saisie est fermée.');
}
