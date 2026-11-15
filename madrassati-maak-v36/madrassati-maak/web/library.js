'use strict';

const LIBRARY_KEY = 'madrassati-maak-lecture-v1';
const LIBRARY_FORMATS = {book: 'Livre', replay: 'Cours', pdf: 'Fiche et exercices', video: 'Vidéo', audio: 'Audio'};
const LIBRARY_LANGUAGES = {fr: 'Français', ar: 'Arabe', en: 'Anglais', bi: 'Français et arabe'};
const LIBRARY_AR = {
  'Ko': 'كيلوبايت', 'Mo': 'ميغابايت',
  'Bibliothèque': 'المكتبة', 'Une ressource pour chaque découverte.': 'مورد لكل اكتشاف.',
  'Ajouter une ressource': 'إضافة مورد', 'Publier la ressource': 'نشر المورد',
  'Continuer ma lecture': 'متابعة قراءتي', 'Reprendre la ressource': 'متابعة المورد',
  'Niveau / classe': 'المستوى / القسم', 'Toutes les classes': 'كل الأقسام',
  'Langue du contenu': 'لغة المحتوى', 'Toutes les langues': 'كل اللغات',
  'Français et arabe': 'الفرنسية والعربية', 'Livre': 'كتاب', 'Livres': 'كتب',
  'Cours': 'دروس', 'Fiche et exercices': 'بطاقة وتمارين', 'Vidéos': 'فيديوهات',
  'Audio': 'صوت', 'Audios': 'مواد صوتية', 'Lire': 'قراءة', 'Regarder': 'مشاهدة',
  'Réinitialiser les filtres': 'إعادة ضبط عوامل التصفية', 'Format du contenu': 'صيغة المحتوى',
  'Titre de la ressource': 'عنوان المورد', 'Description courte': 'وصف مختصر',
  'Texte à lire': 'نص للقراءة', 'Un paragraphe par page.': 'فقرة في كل صفحة.',
  'Fichier à partager': 'الملف المراد مشاركته', 'Nombre de pages du PDF': 'عدد صفحات ملف PDF',
  'Associer à un devoir': 'ربط بواجب', 'Aucun devoir': 'دون واجب',
  'Un texte ou un fichier est nécessaire.': 'أضف نصًا أو ملفًا.',
  'Ajoutez un fichier pour une vidéo ou un audio.': 'أضف ملفًا للفيديو أو الصوت.',
  'Choisissez un fichier adapté au format, de 30 Mo maximum.': 'اختر ملفًا مناسبًا للصيغة بحجم لا يتجاوز 30 ميغابايت.',
  'Vérifiez les informations de la ressource.': 'تحقّق من معلومات المورد.',
  'Publication en cours…': 'جارٍ النشر…', 'La ressource a été publiée.': 'تم نشر المورد.',
  'Impossible d’enregistrer ce fichier. Réessayez.': 'تعذّر حفظ الملف. أعد المحاولة.',
  'Cette ressource est indisponible sur cet appareil.': 'هذا المورد غير متاح على هذا الجهاز.',
  'Chargement du document…': 'جارٍ تحميل المستند…', 'Page de lecture': 'صفحة القراءة',
  'Page précédente': 'الصفحة السابقة', 'Page suivante': 'الصفحة التالية',
  'Marquer comme terminé': 'وضع علامة مكتمل', 'Lecture terminée': 'اكتملت القراءة',
  'Reprendre depuis le début': 'البدء من جديد', 'Position de lecture enregistrée.': 'حُفظ موضع القراءة.',
  'Impossible d’enregistrer la progression.': 'تعذّر حفظ التقدّم.',
  'Le téléchargement permet aussi de consulter le document hors ligne.': 'يسمح التنزيل بالاطّلاع على المستند دون اتصال.',
  'Si l’aperçu ne s’affiche pas, télécharge le document.': 'إذا لم تظهر المعاينة، نزّل المستند.',
  'Aperçu du document': 'معاينة المستند', 'Document': 'مستند',
  'PDF ou texte pour les livres et fiches, MP4 ou WebM pour la vidéo, MP3, M4A, OGG ou WAV pour l’audio. 30 Mo maximum.': 'PDF أو نص للكتب والبطاقات، وMP4 أو WebM للفيديو، وMP3 أو M4A أو OGG أو WAV للصوت. الحد الأقصى 30 ميغابايت.',
  'Documents et progression conservés dans ce navigateur de démonstration.': 'تُحفَظ المستندات والتقدّم في متصفّح العرض التوضيحي هذا.',
  'Le carnet des petites découvertes': 'دفتر الاكتشافات الصغيرة',
  'Une histoire originale en trois étapes pour lire et observer.': 'قصة أصلية في ثلاث مراحل للقراءة والملاحظة.',
  'Une histoire originale en arabe, avec une question à chaque étape.': 'قصة أصلية بالعربية، مع سؤال في كل مرحلة.',
  'Texte à écouter': 'نص للاستماع', 'Télécharger le document': 'تنزيل المستند',
  'Transcription': 'النص المكتوب', 'Ressource associée': 'المورد المرافق', 'Aucune ressource': 'دون مورد',
  'Ouvrir la ressource associée': 'فتح المورد المرافق',
  'Publié par': 'نشره',
  'Additionner deux fractions en images': 'جمع كسرين بالصور',
  'Trois étapes pour visualiser une moitié et un quart.': 'ثلاث خطوات لتصوّر النصف والربع.'
};
for (const [fr, ar] of Object.entries(LIBRARY_AR)) AR_LOOKUP.set(localeKey(fr), ar);

const LIBRARY_BOOKS = [
  {id: 'livre-decouvertes', title: 'Le carnet des petites découvertes', subject: 'Français', subjectId: 'francais', type: 'book', language: 'fr', classId: '6A', kind: 'Livre', icon: 'book', color: 'mint', description: 'Une histoire originale en trois étapes pour lire et observer.', pages: [
    'Le carnet\n\nChaque matin, Lina ouvrait un petit carnet vert. Elle y dessinait une chose qu’elle remarquait depuis sa fenêtre. Ce lundi, elle choisit une feuille qui tournait dans le vent. « Pourquoi ne tombe-t-elle pas tout droit ? » écrivit-elle.\n\nÀ toi de réfléchir. Quelle question poserais-tu sur un objet près de toi ?',
    'La rencontre\n\nLe lendemain, Lina montra son dessin à son ami Sami. Il proposa de laisser tomber une feuille de papier, puis une boule de papier. Tous deux observèrent les mouvements et notèrent leurs différences. Leur première idée changea après l’expérience.\n\nÀ toi de réfléchir. Pourquoi est-il utile d’observer avant de conclure ?',
    'Une nouvelle page\n\nVendredi, le carnet contenait des dessins, des questions et quelques réponses. Lina comprit qu’une découverte pouvait commencer par une toute petite observation. Elle tourna la page et écrivit « Aujourd’hui, je me demande… ».\n\nÀ toi d’écrire. Complète cette phrase avec une question de ton choix.'
  ]},
  {id: 'livre-ar-decouvertes', title: 'دفتر الأسئلة الصغيرة', subject: 'Arabe', subjectId: 'arabe', type: 'book', language: 'ar', classId: '6A', kind: 'Livre', icon: 'book', color: 'orange', description: 'Une histoire originale en arabe, avec une question à chaque étape.', pages: [
    'السؤال الأول\n\nفتحت سلمى دفترها ورسمت عصفورًا يقف قرب النافذة. كتبت سؤالًا: كيف يعرف طريقه إلى العش؟ قرّرت أن تراقبه بهدوء، وأن تسجّل ما تراه.\n\nفكّر. ما الشيء الذي تودّ أن تعرف عنه أكثر؟',
    'نتعلّم معًا\n\nشاركت سلمى سؤالها مع أخيها. لاحظا لون العصفور وحركته ومكان العش. اختلفت أفكارهما، لكنّهما اتّفقا على البحث عن معلومات تساعدهما.\n\nفكّر. كيف يساعدنا تبادل الأفكار على التعلّم؟',
    'صفحة جديدة\n\nفي نهاية الأسبوع، عادت سلمى إلى دفترها. أضافت رسمة جديدة، وكتبت ما تعلّمته وما زالت تريد معرفته. ابتسمت لأن كل سؤال يفتح بابًا لاكتشاف جديد.\n\nاكتب. أكمل الجملة: أريد أن أكتشف…'
  ]}
];

const LIBRARY_FRACTIONS_VIDEO = {
  id:'video-fractions', title:'Additionner deux fractions en images', subject:'Mathématiques', subjectId:'maths',
  type:'video', language:'fr', classId:'6A', kind:'Vidéo', icon:'video', color:'orange',
  description:'Trois étapes pour visualiser une moitié et un quart.',
  body:'Une moitié vaut deux quarts. On ajoute un quart aux deux quarts. On obtient trois quarts. 1/2 + 1/4 = 3/4.',
  mediaUrl:'assets/fractions-video.mp4', mediaSize:61304
};

let libraryReader = null;
let libraryBlobUrl = '';
let libraryOpenToken = 0;

function libraryResources(role = state.role, board = homeworkBoard()) {
  const subjectsByResource = {r1: 'maths', r2: 'svt', r3: 'francais', r4: 'maths', r5: 'histoire', r6: 'anglais', r7: 'arabe'};
  const languages = {r3: 'fr', r6: 'en', r7: 'ar'};
  const builtIn = resources.map(r => {
    const body = r.id === 'r7' ? 'بعد قراءة النص، حدّد الشخصيات والمكان والفكرة الأساسية. لخّص النص في ثلاث جمل، واشرح معاني ثلاث كلمات جديدة. انتبه إلى شكل الحروف وعلامات الترقيم.' : r.body;
    const media = r.id === 'r6' ? {mediaUrl:'assets/daily-routine.mp3',mediaSize:86444} : {};
    return {...r, ...media, body, subjectId: subjectsByResource[r.id], language: languages[r.id] || 'bi', classId: '6A', description: body, pages: [body]};
  });
  const uploaded = board.libraryResources || [];
  const linked = new Set(board.assignments.filter(a => !a.example).map(a => a.resourceId));
  const sessions = scheduledSessions(board);
  for (const session of sessions) if (session.resourceId) linked.add(session.resourceId);
  const examples = [...LIBRARY_BOOKS, {...LIBRARY_FRACTIONS_VIDEO,pages:[LIBRARY_FRACTIONS_VIDEO.body]}, ...builtIn];
  const list = [...uploaded, ...examples.filter(r => state.examples || linked.has(r.id))];
  return ['eleve', 'parent'].includes(role) ? list.filter(r => r.classId === childClassId()) : list;
}

function libraryResource(id) {
  return libraryResources().find(r => r.id === id);
}

function libraryText(resource, field) {
  const text = resource[field] || '';
  return resource.uploaded || field === 'title' && resource.type === 'book' ? text : tr(text);
}

function libraryTextHTML(resource, field, tagName = 'span') {
  return `<${tagName} dir="auto" data-no-i18n="true">${esc(libraryText(resource, field))}</${tagName}>`;
}

function libraryMemory() {
  try {
    const saved = JSON.parse(localStorage.getItem(LIBRARY_KEY));
    if (saved?.version === 1 && saved.reading && saved.readNotices) return saved;
  } catch { /* Une session neuve reste disponible si le stockage est désactivé. */ }
  return {version: 1, reading: {}, readNotices: {}};
}

function saveLibraryMemory(change, announce = false) {
  const data = libraryMemory();
  change(data);
  try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(data)); return true; }
  catch { if (announce) toast('Impossible d’enregistrer la progression.'); return false; }
}

function libraryReading(id) {
  return libraryMemory().reading[`${state.role}:${id}`] || null;
}

function libraryCheckpoint(id, changes, announce = false) {
  if (!libraryResource(id)) return false;
  return saveLibraryMemory(data => {
    const key = `${state.role}:${id}`;
    data.reading[key] = {...data.reading[key], ...changes, at: new Date().toISOString()};
  }, announce);
}

function libraryOptions(entries, selected) {
  return entries.map(([value, label]) => `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(label)}</option>`).join('');
}

function libraryClassName(resource) {
  return classData.find(c => c.id === resource.classId)?.name || '';
}

function libraryPageCount(resource) {
  return resource.attachment?.kind === 'pdf' ? resource.pageCount : Math.max(1, resource.pages?.length || 1);
}

function libraryPlayable(resource) {
  return ['audio','video'].includes(resource.type) && !!(resource.attachment || resource.mediaUrl);
}

function librarySize(size) {
  if (!size) return '';
  const amount = size < 1024 * 1024 ? Math.ceil(size / 1024) : (size / 1024 / 1024).toFixed(1);
  return `${amount} ${tr(size < 1024 * 1024 ? 'Ko' : 'Mo')}`;
}

function libraryPageLabel(page, total) {
  return state.lang === 'ar' ? `الصفحة ${page} من ${total}` : `Page ${page} sur ${total}`;
}

function libraryResumeBanner() {
  const data = libraryMemory().reading;
  const resource = libraryResources().filter(r => data[`${state.role}:${r.id}`] && !data[`${state.role}:${r.id}`].completed)
    .sort((a, b) => data[`${state.role}:${b.id}`].at.localeCompare(data[`${state.role}:${a.id}`].at))[0];
  if (!resource) return '';
  const reading = libraryReading(resource.id);
  const position = libraryPlayable(resource) ? timeLabelSeconds(reading.seconds || 0) : libraryPageLabel(reading.page || 1, libraryPageCount(resource));
  return `<section class="library-resume"><div>${tile(resource.icon, resource.color)}<div><h2>Continuer ma lecture</h2>${libraryTextHTML(resource, 'title', 'p')}<small data-no-i18n="true">${esc(position)}</small></div></div>${homeworkButton('Reprendre la ressource', 'resource-open', resource.id, 'primary', 'play')}</section>`;
}

function timeLabelSeconds(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function renderLibraryPage() {
  const classes = classData.filter(c => !['eleve', 'parent'].includes(state.role) || c.id === childClassId());
  const add = ['professeur','administration'].includes(state.role) ? homeworkButton('Ajouter une ressource', 'library-new', '', 'primary', 'plus') : '';
  return `${heading('Bibliothèque', 'Une ressource pour chaque découverte.', add)}${libraryResumeBanner()}
    <section class="card library-browser">
      <div class="library-search-row"><div class="search-box">${icon('search')}<label class="sr-only" for="resourceSearch">Rechercher une ressource</label><input id="resourceSearch" dir="auto" type="search" maxlength="100" placeholder="Rechercher une ressource…" value="${esc(state.resourceSearch)}"></div>
      <button class="saved-resources-toggle ${state.resourceSavedOnly ? 'selected' : ''}" data-action="favorite-filter" aria-pressed="${state.resourceSavedOnly}">${icon('bookmark','sm')}Mes favoris <span>${favoriteIds().length}</span></button></div>
      <div class="library-filters">
        <div><label for="libraryClassFilter">Niveau / classe</label><select id="libraryClassFilter">${libraryOptions([['all','Toutes les classes'], ...classes.map(c => [c.id,c.name])], state.libraryClass)}</select></div>
        <div><label for="librarySubjectFilter">Matière</label><select id="librarySubjectFilter">${libraryOptions([['all','Toutes les matières'], ...subjects.map(s => [s.id,s.name])], state.librarySubject)}</select></div>
        <div><label for="libraryLanguageFilter">Langue du contenu</label><select id="libraryLanguageFilter">${libraryOptions([['all','Toutes les langues'], ...Object.entries(LIBRARY_LANGUAGES)], state.libraryLanguage)}</select></div>
      </div>
      <div class="library-format-tabs" aria-label="Format du contenu">${[['all','Tout'],['book','Livres'],['replay','Cours'],['pdf','Fiches & exercices'],['video','Vidéos'],['audio','Audios']].map(([value,label]) => `<button class="tab ${state.resourceType === value ? 'active' : ''}" data-action="resource-filter" data-value="${value}" aria-pressed="${state.resourceType === value}">${label}</button>`).join('')}</div>
    </section>
    <div class="library-results-meta"><span>${state.resourceSavedOnly ? 'Favoris de mon espace' : 'Toutes les ressources'}</span><span id="resourceCount" aria-live="polite">${filteredResourceList().length}</span><button class="text-link" data-action="library-reset-filters">Réinitialiser les filtres</button></div>
    <div id="resourceResults" class="resources-grid">${resourceLibraryResults()}</div>
    ${libraryResources().length ? `<div class="library-offline">${homeworkButton('Télécharger les fiches de la semaine', 'homework-week-pdf', '', 'secondary', 'download')}<p>Le téléchargement permet aussi de consulter le document hors ligne.</p></div>` : ''}`;
}

function libraryCards(list) {
  return list.map(r => {
    const action = r.type === 'audio' ? 'Écouter' : r.type === 'video' ? 'Regarder' : 'Lire';
    const reading = libraryReading(r.id);
    const count = libraryPageCount(r);
    const size = r.attachment?.size || r.mediaSize;
    const detail = size ? librarySize(size) : r.type === 'audio' ? tr('Texte à écouter') : state.lang === 'ar' ? `${count} صفحة` : `${count} ${count === 1 ? 'page' : 'pages'}`;
    return `<article class="resource-card library-card"><div class="resource-card-top">${tile(r.icon,r.color)}${favoriteResourceButton(r.id,true)}</div><div class="resource-body"><span class="type-label">${LIBRARY_FORMATS[r.type]}</span>${libraryTextHTML(r,'title','h3')}
      <div class="library-card-meta"><span>${r.subject}</span><span>${libraryClassName(r)}</span><span>${LIBRARY_LANGUAGES[r.language]}</span></div>
      ${r.author ? `<small class="library-author"><span>Publié par</span> <bdi data-no-i18n="true">${esc(r.author)}</bdi></small>` : ''}
      ${libraryTextHTML(r,'description','p')}<small class="library-file-meta" data-no-i18n="true">${esc(detail)}</small>
      ${reading?.completed ? '<span class="tag mint">Lecture terminée</span>' : ''}
      ${homeworkButton(action,'resource-open',r.id,'secondary',r.type === 'audio' ? 'sound' : r.type === 'video' ? 'play' : 'book')}</div></article>`;
  }).join('') || empty('Aucune ressource trouvée','Essaie un autre mot ou une autre catégorie.');
}

function resetLibraryFilters() {
  state.resourceSavedOnly = false;
  state.resourceType = 'all';
  state.resourceSearch = '';
  state.libraryClass = 'all';
  state.librarySubject = 'all';
  state.libraryLanguage = 'all';
  render();
}

function updateLibraryFilter(input) {
  const filters = {libraryClassFilter: 'libraryClass', librarySubjectFilter: 'librarySubject', libraryLanguageFilter: 'libraryLanguage'};
  const key = filters[input.id];
  if (!key) return false;
  state[key] = input.value;
  render();
  document.getElementById(input.id)?.focus();
  return true;
}

function closeLibraryReader() {
  libraryOpenToken++;
  const media = document.getElementById('libraryMedia');
  if (libraryReader && media && !libraryReading(libraryReader.id)?.completed) libraryCheckpoint(libraryReader.id, {seconds: media.currentTime || 0});
  libraryReader = null;
  if (libraryBlobUrl) URL.revokeObjectURL(libraryBlobUrl);
  libraryBlobUrl = '';
}

async function openLibraryResource(id) {
  const resource = libraryResource(id);
  if (!resource) return;
  openModal(libraryTextHTML(resource,'title'), '<div id="libraryReaderBody" aria-live="polite">Chargement du document…</div>', true, 'lesson-view library-reader');
  const token = ++libraryOpenToken;
  const saved = libraryReading(id);
  libraryReader = {id, page: Math.max(1, Math.min(libraryPageCount(resource), saved?.page || 1))};
  if (resource.attachment) {
    try {
      const blob = await homeworkFileOperation('readonly', files => files.get(resource.attachment.id));
      if (token !== libraryOpenToken) return;
      if (!blob) throw new Error('Missing library file');
      libraryBlobUrl = URL.createObjectURL(new Blob([blob], {type: resource.attachment.mime}));
    } catch {
      if (token === libraryOpenToken) {
        document.getElementById('libraryReaderBody').innerHTML = localizeHTML('<p class="info-bar">Cette ressource est indisponible sur cet appareil.</p>');
      }
      return;
    }
  }
  if (token !== libraryOpenToken) return;
  libraryReader.saved = libraryCheckpoint(id, {page: libraryReader.page});
  renderLibraryReader();
}

function renderLibraryReader() {
  const resource = libraryReader && libraryResource(libraryReader.id);
  const root = document.getElementById('libraryReaderBody');
  if (!resource || !root) return;
  const pages = libraryPageCount(resource);
  const page = libraryReader.page;
  const mediaFile = libraryPlayable(resource);
  let content;
  if (mediaFile) {
    const seconds = libraryReading(resource.id)?.seconds || 0;
    content = `<${resource.type} id="libraryMedia" controls preload="metadata" src="${libraryBlobUrl || resource.mediaUrl}" data-resume="${seconds}" ${resource.type === 'video' ? 'playsinline' : ''}></${resource.type}>${resource.mediaUrl ? `<details class="library-transcript"><summary>Transcription</summary>${libraryTextHTML(resource,'body','p')}</details>` : ''}`;
  } else if (resource.attachment?.kind === 'pdf') {
    content = `<iframe class="library-pdf" title="${esc(tr('Aperçu du document'))}" tabindex="-1" src="${libraryBlobUrl}#page=${page}&amp;view=Fit&amp;toolbar=0&amp;navpanes=0"></iframe><p class="tiny muted">Si l’aperçu ne s’affiche pas, télécharge le document.</p>`;
  } else {
    const body = resource.pages[page - 1] || '';
    const translated = resource.uploaded || ['fr','en','ar'].includes(resource.language) ? body : tr(body);
    const language=resource.language==='bi'?state.lang:resource.language;
    const lesson=resource.course?teacherLessonReferences(resource.pages.join('\n\n')):null;
    const section=lesson&&[...lesson.sections.values()].find(item=>item.index===page-1);
    const figure=section&&lessonDiagramForHeading(section.title);
    const paragraphs=translated.split(/\n\n+/).map(paragraph=>'<p>'+paragraph.split('\n').map(line=>lesson?.links.has(line)?
      '<button type="button" class="lesson-reference" data-action="library-page" data-value="'+(lesson.links.get(line)+1)+'">'+esc(line)+'</button>':
      esc(line)).join('<br>')+'</p>').join('');
    content = `<article class="library-reading-page" lang="${language}" dir="${language==='ar'?'rtl':'ltr'}" data-no-i18n="true">${paragraphs}${figure?renderLessonFigure(figure,language):''}</article>`;
  }
  const paging = mediaFile ? '' : `<div class="library-pager"><button class="btn soft" data-action="library-page" data-value="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="Page précédente">${icon('left','sm')}</button><label class="sr-only" for="libraryPage">Page de lecture</label><select id="libraryPage">${libraryOptions(Array.from({length: pages}, (_,i) => [String(i+1), libraryPageLabel(i+1,pages)]), String(page))}</select><button class="btn soft" data-action="library-page" data-value="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="Page suivante">${icon('right','sm')}</button></div>`;
  const completed = libraryReading(resource.id)?.completed;
  const size = resource.attachment?.size || resource.mediaSize;
  const description = resource.description === resource.pages?.[page - 1] ? '' : libraryTextHTML(resource,'description','p');
  const downloadControl = resource.mediaUrl ? `<a class="btn secondary" href="${resource.mediaUrl}" download>${icon('download','sm')}Télécharger le document</a>` : homeworkButton('Télécharger le document','library-download',resource.id,'secondary','download');
  root.innerHTML = localizeHTML(`<div class="library-reader-meta"><span>${resource.subject}</span><span>${libraryClassName(resource)}</span><span>${LIBRARY_LANGUAGES[resource.language]}</span>${size ? `<span data-no-i18n="true">${esc(librarySize(size))}</span>` : ''}</div>
    ${description}${paging}${content}<p class="tiny muted library-save-hint" role="status">${libraryReader.saved ? 'Position de lecture enregistrée.' : 'Impossible d’enregistrer la progression.'}</p>
    <div class="homework-actions library-reader-actions">${favoriteResourceButton(resource.id)}${downloadControl}${resource.type === 'audio' && !mediaFile ? homeworkButton('Lire à voix haute','speak',resource.id,'secondary','sound') : ''}${homeworkButton(completed ? 'Reprendre depuis le début' : 'Marquer comme terminé','library-complete',resource.id,'soft',completed ? 'play' : 'check')}</div>`);
}

function moveLibraryPage(value) {
  const resource = libraryReader && libraryResource(libraryReader.id);
  const page = Number(value);
  if (!resource || !Number.isInteger(page) || page < 1 || page > libraryPageCount(resource)) return;
  libraryReader.saved = libraryCheckpoint(resource.id, {page, completed: false}, true);
  libraryReader.page = page;
  renderLibraryReader();
  document.getElementById('libraryPage')?.focus();
}

function completeLibraryReading(id) {
  if (libraryReader?.id !== id) return;
  const completed = !libraryReading(id)?.completed;
  const changes = completed ? {completed: true, seconds: 0} : {completed: false, page: 1, seconds: 0};
  if (!libraryCheckpoint(id, changes, true)) return;
  libraryReader.page = completed ? libraryReader.page : 1;
  renderLibraryReader();
  toast(completed ? 'Lecture terminée' : 'Position de lecture enregistrée.');
}

async function downloadLibraryResource(id) {
  const resource = libraryResource(id);
  if (!resource) return;
  if (!resource.attachment) {
    const language=resource.language==='bi'?state.lang:resource.language;
    const translate=value=>language==='ar'&&resource.language==='bi'?tr(value):value;
    const title=language==='ar'?libraryText(resource,'title'):resource.title;
    const body=resource.pages.map(translate).join('\n\n');
    const lesson=resource.course&&teacherLessonReferences(body);
    const headings=lesson&&new Map([...lesson.sections].map(([number,section])=>[section.index,{number,title:section.title}]));
    const sections=lesson?lesson.parts.map((part,index)=>{
      const section=headings.get(index),lines=part.split('\n');
      if(section)return {heading:lines.shift(),text:lines.join('\n'),section:section.number,diagram:lessonDiagramForHeading(section.title)};
      const label=lines.find(line=>lesson.links.has(line));
      if(!label)return pdfTextBlocks(part)[0];
      const target=lesson.links.get(label);
      return {text:lines.filter(line=>line!==label).join('\n'),reference:{label,section:headings.get(target).number}};
    }).filter(Boolean):undefined;
    saveSchoolDocument({kind:lesson?'lesson':'resource',language,title,meta:[[language==='ar'?'المادة':'Matière',translate(resource.subject)]],
      body,sections,math:!!lesson},resource.id+'.pdf');
    return;
  }
  try {
    const blob = await homeworkFileOperation('readonly', files => files.get(resource.attachment.id));
    if (!blob) throw new Error('Missing library file');
    download(blob, resource.attachment.name, resource.attachment.mime);
  } catch { toast('Cette ressource est indisponible sur cet appareil.'); }
}

function openLibraryEditor(course = false, draft = null) {
  if (course ? state.role !== 'professeur' : !['professeur','administration'].includes(state.role)) return;
  const classes = publicationClasses(), teachingSubjects = publicationSubjects();
  const selectedClass = course && classes.find(c => c.id === (draft?.classId || state.courseClass));
  const classId = selectedClass?.id || classes[0]?.id, subjectId = teachingSubjects[0]?.id;
  if (course && (!classId || !subjectId)) { toast('Aucune classe attribuée pour publier un cours.'); return; }
  const formats = course ? COURSE_FORMATS : LIBRARY_FORMATS;
  openModal(course ? 'Ajouter un cours' : 'Ajouter une ressource', `<form id="libraryEditorForm" class="form library-editor" ${course ? 'data-course="true"' : ''}>
    <div><label for="libraryTitle">${course ? 'Titre du cours' : 'Titre de la ressource'}</label><input id="libraryTitle" name="title" maxlength="100" required dir="auto" value="${esc(draft?.title || '')}"></div>
    <div><label for="libraryDescription">Description courte</label><textarea id="libraryDescription" name="description" rows="2" maxlength="350" required dir="auto">${esc(draft?.description || '')}</textarea></div>
    <div class="form-grid"><div><label for="librarySubject">Matière</label><select id="librarySubject" name="subjectId">${libraryOptions(teachingSubjects.map(s => [s.id,s.name]),subjectId)}</select></div>
    <div><label for="libraryClass">Classe</label><select id="libraryClass" name="classId">${libraryOptions(classes.map(c => [c.id,c.name]),classId)}</select></div>
    <div><label for="libraryLanguage">Langue du contenu</label><select id="libraryLanguage" name="language">${libraryOptions(Object.entries(LIBRARY_LANGUAGES),draft?.language || 'fr')}</select></div>
    <div><label for="libraryFormat">Format du contenu</label><select id="libraryFormat" name="type">${libraryOptions(Object.entries(formats),course ? 'replay' : 'pdf')}</select></div></div>
    ${course ? courseEditorFields(draft?.chapter) : ''}
    <div id="libraryFileFields" ${course ? 'hidden' : ''}><label for="libraryFile">Fichier à partager</label><input id="libraryFile" name="file" type="file" accept=".pdf,.txt" aria-describedby="libraryFileHint" ${course ? 'disabled' : ''}><p id="libraryFileHint" class="tiny muted">PDF ou texte pour les livres et fiches, MP4 ou WebM pour la vidéo, MP3, M4A, OGG ou WAV pour l’audio. 30 Mo maximum.</p></div>
    <div id="libraryPdfFields" hidden><label for="libraryPageCount">Nombre de pages du PDF</label><input id="libraryPageCount" name="pageCount" type="number" value="1" min="1" max="300" required disabled></div>
    <div id="libraryTextFields"><label for="libraryText">${course ? 'Texte du cours' : 'Texte à lire'}</label><textarea id="libraryText" name="text" rows="4" maxlength="20000" dir="auto" ${course ? 'required' : ''}>${esc(draft?.text || '')}</textarea><p class="tiny muted">Un paragraphe par page.</p></div>
    <div><label for="libraryAssignment">Associer à un devoir</label><select id="libraryAssignment" name="assignmentId">${libraryAssignmentOptions(classId,subjectId)}</select></div>
    <p class="tiny muted">Documents et progression conservés dans ce navigateur de démonstration.</p><p id="libraryPublishStatus" class="error" role="status"></p>
    <div class="homework-actions">${homeworkButton('Annuler','close-modal','','soft')}<button class="btn primary" type="submit">${course ? 'Publier le cours' : 'Publier la ressource'}</button></div>
  </form>`, true, 'library-editor-modal');
}

function libraryAssignmentOptions(classId, subjectId) {
  const list = state.role === 'administration' ? homeworkBoard().assignments.filter(a => state.examples || !a.example) : homeworkList('professeur');
  return libraryOptions([['','Aucun devoir'],...list.filter(a => a.classId === classId && a.subject === subjectId).map(a => [a.id,homeworkText(a,'title')])],'');
}

function libraryHomeworkResourceOptions(classId, selected = '') {
  return libraryOptions([['','Aucune ressource'],...libraryResources('professeur').filter(r => r.classId === classId).map(r => [r.id,libraryText(r,'title')])],selected || '');
}

function updateLibraryEditor(input) {
  const form = input.form;
  if (form?.id !== 'libraryEditorForm') return false;
  if (['libraryClass','librarySubject'].includes(input.id)) document.getElementById('libraryAssignment').innerHTML = localizeHTML(libraryAssignmentOptions(form.elements.classId.value,form.elements.subjectId.value));
  if (!['libraryFormat','libraryFile'].includes(input.id)) return true;
  const type = form.elements.type.value;
  const fileInput = form.elements.file;
  const course = form.dataset.course === 'true';
  const written = course && type === 'replay';
  if (course && input.id === 'libraryFormat') fileInput.value = '';
  const file = fileInput.files[0];
  const isDocument = !['audio','video'].includes(type);
  const isPdf = isDocument && !!file && /\.pdf$/i.test(file.name);
  fileInput.accept = type === 'video' ? '.mp4,.webm' : type === 'audio' ? '.mp3,.m4a,.ogg,.wav' : '.pdf,.txt';
  document.getElementById('libraryPdfFields').hidden = !isPdf;
  form.elements.pageCount.disabled = !isPdf;
  const showText = course ? written : isDocument && !file;
  document.getElementById('libraryTextFields').hidden = !showText;
  form.elements.text.disabled = !showText;
  if (course) {
    form.elements.text.required = written;
    document.getElementById('libraryFileFields').hidden = written;
    fileInput.disabled = written;
    fileInput.required = !written;
    const hints = {pdf:'PDF ou TXT. 30 Mo maximum.',video:'MP4 ou WebM. 30 Mo maximum.',audio:'MP3, M4A, OGG ou WAV. 30 Mo maximum.'};
    document.getElementById('libraryFileHint').textContent = tr(hints[type] || '');
  }
  return true;
}

function libraryFileKind(file, type) {
  const extension = file.name.split('.').pop().toLowerCase();
  const allowed = type === 'video' ? ['mp4','webm'] : type === 'audio' ? ['mp3','m4a','ogg','wav'] : ['pdf','txt'];
  if (!file.size || file.size > 30 * 1024 * 1024 || !allowed.includes(extension)) return null;
  const mime = {pdf:'application/pdf',txt:'text/plain;charset=utf-8',mp4:'video/mp4',webm:'video/webm',mp3:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav'}[extension];
  return {kind: extension, mime};
}

async function storeLibraryAttachment(file, fileKind) {
  const id = homeworkId('bibliotheque-fichier');
  await homeworkFileOperation('readwrite', files => files.put(file,id));
  return {id,name:file.name.slice(0,160),size:file.size,...fileKind};
}

async function publishLibraryResource(form, values) {
  if (!['professeur','administration'].includes(state.role) || form.dataset.busy) return;
  const author = currentProfile();
  const role = state.role;
  const authorId = role === 'professeur' ? activeTeacher()?.id : '';
  const courseForm = form.dataset.course === 'true';
  const course = courseForm && courseFromForm(values,authorId);
  const formats = courseForm ? COURSE_FORMATS : LIBRARY_FORMATS;
  if (courseForm && (!authorId || !course)) { toast('Vérifiez le titre, le chapitre et l’ordre du cours.'); return; }
  const title = String(values.title || '').trim().slice(0,100);
  const description = String(values.description || '').trim().slice(0,350);
  const subject = subjects.find(s => s.id === values.subjectId);
  const classEntry = classData.find(c => c.id === values.classId);
  const text = String(values.text || '').trim().slice(0,20000);
  const file = form.querySelector('input[type="file"]').files[0];
  const pageCount = Number(values.pageCount || 1);
  if (!title || !description || !subject || !classEntry || !teacherCanPublish(subject.id,classEntry.id) || !Object.hasOwn(formats,values.type) || !Object.hasOwn(LIBRARY_LANGUAGES,values.language) || !Number.isInteger(pageCount) || pageCount < 1 || pageCount > 300) { toast('Vérifiez les informations de la ressource.'); return; }
  if (courseForm && values.type === 'pdf' && !file) { toast('Ajoutez un fichier PDF ou texte pour ce format.'); return; }
  if (courseForm && values.type === 'replay' && (!text || file)) { toast('Saisissez le texte du cours.'); return; }
  if (!file && !text) { toast('Un texte ou un fichier est nécessaire.'); return; }
  if (!file && ['audio','video'].includes(values.type)) { toast('Ajoutez un fichier pour une vidéo ou un audio.'); return; }
  const fileKind = file && libraryFileKind(file,values.type);
  if (file && !fileKind) { toast('Choisissez un fichier adapté au format, de 30 Mo maximum.'); return; }
  form.dataset.busy = 'true';
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  const status = document.getElementById('libraryPublishStatus');
  status.textContent = tr('Publication en cours…');
  let attachment;
  try {
    let pages = text.split(/\n\s*\n/).filter(Boolean);
    if (file) {
      if (fileKind.kind === 'txt') pages = (await file.text()).split(/\n\s*\n/).filter(Boolean);
      attachment = await storeLibraryAttachment(file,fileKind);
    }
    const resource = {id:homeworkId('ressource'),uploaded:true,title,description,subjectId:subject.id,subject:subject.name,classId:classEntry.id,author:role === 'administration' ? 'Administration' : author.name,language:values.language,type:values.type,kind:LIBRARY_FORMATS[values.type],icon:values.type === 'video' ? 'video' : values.type === 'audio' ? 'headset' : values.type === 'book' ? 'book' : 'file',color:'mint',pages:pages.length ? pages : [description],body:pages.join('\n\n'),pageCount,attachment,publishedAt:new Date().toISOString()};
    if (course) resource.course = course;
    const sameAuthor = state.role === role && (role === 'administration' || activeTeacher()?.id === authorId);
    const saved = form.isConnected && sameAuthor && saveHomework(board => {
      const assignment = values.assignmentId && board.assignments.find(a => a.id === values.assignmentId && (state.examples || !a.example) && a.classId === classEntry.id && a.subject === subject.id && (role === 'administration' || (a.teacherId || legacyTeacherId(a.subject)) === authorId));
      if (values.assignmentId && !assignment) { toast('Vérifiez les informations de la ressource.'); return false; }
      board.libraryResources = [resource,...(board.libraryResources || [])];
      if (assignment) assignment.resourceId = resource.id;
      return true;
    });
    if (!saved) { discardHomeworkFile(attachment?.id); return; }
    closeModal();
    if (course) {
      state.courseClass = classEntry.id;
      go('courses');
      toast('Le cours a été publié.');
      return;
    }
    resetLibraryFilters();
    go('resources');
    toast('La ressource a été publiée.');
  } catch { discardHomeworkFile(attachment?.id); toast('Impossible d’enregistrer ce fichier. Réessayez.'); }
  finally { delete form.dataset.busy; submit.disabled = false; if (status.isConnected) status.textContent = ''; }
}

function handleLibraryAction(action, data) {
  const actions = {
    'library-new': openLibraryEditor,
    'course-new': () => openLibraryEditor(true),
    'library-reset-filters': resetLibraryFilters,
    'library-page': () => moveLibraryPage(data.value),
    'library-complete': () => completeLibraryReading(data.id),
    'library-download': () => downloadLibraryResource(data.id)
  };
  if (!actions[action]) return false;
  actions[action]();
  return true;
}

document.addEventListener('loadedmetadata', event => {
  const media = event.target;
  if (media.id === 'libraryMedia' && Number.isFinite(media.duration)) media.currentTime = Math.min(Number(media.dataset.resume) || 0, Math.max(0,media.duration - .1));
}, true);
document.addEventListener('timeupdate', event => {
  const media = event.target;
  if (media.id !== 'libraryMedia' || !libraryReader) return;
  const second = Math.floor(media.currentTime);
  if (Math.abs(second - Number(media.dataset.savedSecond || 0)) < 5) return;
  media.dataset.savedSecond = String(second);
  libraryCheckpoint(libraryReader.id,{seconds:second});
}, true);
document.addEventListener('ended', event => {
  if (event.target.id !== 'libraryMedia' || !libraryReader) return;
  libraryReader.saved = libraryCheckpoint(libraryReader.id,{seconds:0,completed:true});
  if (libraryReader.saved) renderLibraryReader();
}, true);
