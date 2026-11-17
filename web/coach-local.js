'use strict';

const COACH_LOCAL_TOPICS = [
  {
    match:/fraction|denominateur|numerateur|كسور|كسر|مقام|بسط/i,
    prompt:['Comment additionner deux fractions ?','كيف أجمع كسرين؟'],
    answer:[
      'Pour additionner des fractions, mets-les au même dénominateur, puis additionne les numérateurs. Garde le dénominateur commun.\n\nExemple : 1/2 + 1/4 = 2/4 + 1/4 = 3/4. À toi : essaie 1/3 + 1/6.',
      'لجمع كسرين، وحّد المقامين، ثم اجمع البسطين واحتفظ بالمقام المشترك.\n\nمثال: 1/2 + 1/4 = 2/4 + 1/4 = 3/4. جرّب الآن 1/3 + 1/6.'
    ]
  },
  {
    match:/equation|isoler x|premier degre|معادل|مجهول/i,
    prompt:['Comment résoudre une équation ?','كيف أحل معادلة؟'],
    answer:[
      'Isole x en effectuant la même opération des deux côtés du signe égal.\n\nPour 3x + 5 = 20, soustrais 5 : 3x = 15. Divise ensuite par 3 : x = 5. Vérifie avec 3 × 5 + 5 = 20.',
      'اعزل المجهول بإجراء العملية نفسها على طرفي المعادلة.\n\nفي 3x + 5 = 20، اطرح 5 من الطرفين لتحصل على 3x = 15. ثم اقسم على 3 لتحصل على x = 5. تحقّق بالتعويض.'
    ]
  },
  {
    match:/cellul|membrane plasm|organite|خلي[هة]|خلايا|الغشاء الخلوي/i,
    prompt:['Qu’est-ce qu’une cellule ?','ما الخلية؟'],
    answer:[
      'La cellule est l’unité de base du vivant. Sa membrane délimite la cellule et contrôle ses échanges avec le milieu. Dans une cellule animale ou végétale typique, le noyau contient l’essentiel de l’ADN.\n\nPour retenir l’idée, dessine une cellule et indique la membrane, le cytoplasme et le noyau.',
      'الخلية هي الوحدة الأساسية للكائنات الحية. يحيط الغشاء بها وينظّم تبادل المواد مع الوسط. في خلية حيوانية أو نباتية نموذجية، تحتوي النواة على معظم الحمض النووي.\n\nارسم خلية وحدّد الغشاء والسيتوبلازم والنواة.'
    ]
  },
  {
    match:/pourcent|proportion|regle de trois|taux|نسب[هة]|تناسب|المئوي/i,
    answer:[
      'Un pourcentage représente une part sur 100. Pour calculer 20 % de 150, multiplie 150 par 20/100 : tu obtiens 30.\n\nPour trouver le pourcentage d’une part, divise la part par le total puis multiplie par 100.',
      'النسبة المئوية تمثّل جزءًا من مئة. لحساب 20% من 150، اضرب 150 في 20/100 لتحصل على 30.\n\nلإيجاد نسبة جزء من مجموع، اقسم الجزء على المجموع ثم اضرب في 100.'
    ]
  },
  {
    match:/pythagore|hypotenuse|triangle rectangle|فيثاغورس|الوتر|مثلث قائم/i,
    answer:[
      'Dans un triangle rectangle, le carré de l’hypoténuse est la somme des carrés des deux autres côtés. L’hypoténuse est le côté opposé à l’angle droit.\n\nSi les deux petits côtés mesurent 3 et 4 cm, le carré de l’hypoténuse vaut 9 + 16 = 25. Elle mesure donc 5 cm.',
      'في المثلث القائم، مربع الوتر يساوي مجموع مربعي الضلعين الآخرين. الوتر هو الضلع المقابل للزاوية القائمة.\n\nإذا كان الضلعان 3 سم و4 سم، فإن مربع الوتر يساوي 9 + 16 = 25، وطوله 5 سم.'
    ]
  },
  {
    match:/photosynth|chlorophyl|البناء الضوئي|التركيب الضوئي|اليخضور/i,
    answer:[
      'La photosynthèse permet aux végétaux chlorophylliens de fabriquer des sucres à partir d’eau et de dioxyde de carbone grâce à l’énergie de la lumière. Du dioxygène est libéré.\n\nSur un schéma de feuille, indique ce qui entre (eau, CO₂, lumière) et ce qui est produit (sucres et O₂).',
      'يسمح التركيب الضوئي للنباتات الخضراء بتكوين السكريات من الماء وثاني أكسيد الكربون بفضل طاقة الضوء، وينطلق الأكسجين.\n\nعلى رسم ورقة، بيّن ما يدخل وما ينتج.'
    ]
  },
  {
    match:/respiration|poumons|alveole|تنفس|الرئ[هة]|الرئتين/i,
    answer:[
      'Quand tu inspires, l’air passe par les voies respiratoires jusqu’aux alvéoles pulmonaires. Le dioxygène passe de l’air vers le sang. Le dioxyde de carbone suit le trajet inverse, puis est expiré.',
      'عند الشهيق، يصل الهواء إلى الحويصلات الرئوية. ينتقل الأكسجين من الهواء إلى الدم، بينما ينتقل ثاني أكسيد الكربون في الاتجاه المعاكس ويخرج أثناء الزفير.'
    ]
  },
  {
    match:/groupe nominal|adjectif|determinant|nom commun|مجموع[هة] اسم|الصف[هة]/i,
    answer:[
      'Dans « le petit chat », le nom « chat » est le noyau du groupe nominal. « Le » est le déterminant et « petit » donne une précision sur le nom.\n\nDans « les grandes maisons », trouve d’abord le nom principal, puis repère les mots qui l’accompagnent.',
      'في المجموعة الفرنسية « le petit chat »، الاسم « chat » هو العنصر الرئيسي، و« le » أداة تعريف، و« petit » صفة.\n\nجرّب تحديد الاسم والصفة في « les grandes maisons ».'
    ]
  },
  {
    match:/present simple|simple present|routine|المضارع البسيط/i,
    answer:[
      'En anglais, le présent simple sert notamment à parler d’habitudes. On utilise la base verbale, avec généralement -s à la troisième personne du singulier.\n\nExemple : « I play every day », mais « She plays every day ». Pour une question : « Does she play? ».',
      'يُستعمل المضارع البسيط في الإنجليزية للتعبير عن العادات. نستخدم أصل الفعل، ونضيف غالبًا s مع المفرد الغائب.\n\nمثال: « I play every day » و« She plays every day ». وفي السؤال: « Does she play? ».'
    ]
  }
];

function coachLocalGcd(a,b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a,b] = [b,a % b];
  return a || 1;
}

function coachLocalFraction(n,d) {
  const sign = d < 0 ? -1 : 1;
  const divisor = coachLocalGcd(n,d);
  const top = n * sign / divisor;
  const bottom = Math.abs(d) / divisor;
  return bottom === 1 ? String(top) : top + '/' + bottom;
}

function coachLocalMath(question,ar) {
  const expression = arabicNumbersToLatin(question).toLowerCase().trim().replace(/[−–]/g,'-').replace(/[،٫,]/g,'.')
    .replace(/^(?:(?:calcule(?:r)?|combien fait|resous|resoudre|solution de|احسب|حل)\s*:?\s*)/,'')
    .replace(/[?؟!]+$/,'').trim().replace(/=\s*$/,'').replace(/\s+/g,'');
  const invalid = ar ? 'لا يمكن القسمة على صفر.' : 'On ne peut pas diviser par zéro.';
  const fractions = /^(-?\d{1,5})\/(-?\d{1,5})([+\-×*÷])(-?\d{1,5})\/(-?\d{1,5})$/.exec(expression);
  if (fractions) {
    const [,left,den,operator,right,div] = fractions;
    const a = Number(left), b = Number(den), c = Number(right), d = Number(div);
    if (!b || !d || operator === '÷' && !c) return invalid;
    let result;
    if (operator === '+' || operator === '-') result = coachLocalFraction(a * d + (operator === '+' ? c : -c) * b,b * d);
    else if (operator === '÷') result = coachLocalFraction(a * d,b * c);
    else result = coachLocalFraction(a * c,b * d);
    return (ar ? 'النتيجة: ' : 'Résultat : ') + result + '\n\n' +
      (operator === '+' || operator === '-' ? (ar ? 'وحّد المقامين أولًا ثم اجمع البسطين أو اطرحهما حسب العملية.' :
        'Mets d’abord les fractions au même dénominateur, puis additionne ou soustrais les numérateurs.') :
        ar ? 'في الضرب نضرب البسطين والمقامين. في القسمة نضرب الكسر الأول في مقلوب الثاني.' :
          'Pour multiplier, multiplie les numérateurs entre eux et les dénominateurs entre eux. Pour diviser, multiplie par l’inverse du second.');
  }
  const equation = /^([+-]?\d{0,5})x([+-]\d{1,6})?=([+-]?\d{1,6})$/.exec(expression);
  if (equation) {
    const [,coefficient,constant,answer] = equation;
    const a = coefficient === '-' ? -1 : coefficient === '+' || !coefficient ? 1 : Number(coefficient);
    const b = Number(constant || 0), c = Number(answer);
    if (!a) return b === c ? (ar ? 'تتحقّق المساواة لكل قيمة للمجهول.' : 'L’égalité est vraie pour toute valeur de x.') :
      (ar ? 'هذه المعادلة ليس لها حل.' : 'Cette équation n’a pas de solution.');
    const shift = ar ? (b < 0 ? 'أضف ' + Math.abs(b) + ' إلى الطرفين' : 'اطرح ' + b + ' من الطرفين') :
      (b < 0 ? 'Ajoute ' + Math.abs(b) : 'Soustrais ' + b) + ' des deux côtés';
    const first = b ? shift + (ar ? ' لتحصل على ' : ' pour obtenir ') + a + 'x = ' + (c-b) + '.\n\n' : '';
    const second = (ar ? 'اقسم الطرفين على ' : 'Divise les deux côtés par ') + a + (ar ? ' لتحصل على x = ' : ' pour trouver x = ') +
      coachLocalFraction(c-b,a) + '.';
    return first + second;
  }
  const numbers = /^(-?\d{1,7}(?:\.\d{1,5})?)([+\-×*÷/])(-?\d{1,7}(?:\.\d{1,5})?)$/.exec(expression);
  if (!numbers) return '';
  const a = Number(numbers[1]), b = Number(numbers[3]), op = numbers[2];
  if (['÷','/'].includes(op) && !b) return invalid;
  const result = op === '+' ? a + b : op === '-' ? a - b : ['×','*'].includes(op) ? a * b : a / b;
  const rounded = Number(result.toFixed(8));
  const formatted = new Intl.NumberFormat(ar ? 'ar-MA-u-nu-latn' : 'fr-FR',{maximumFractionDigits:8}).format(rounded);
  return expression + (Math.abs(result - rounded) > 1e-12 ? ' ≈ ' : ' = ') + formatted;
}

function coachLocalAnswer(question) {
  const ar = /[\u0600-\u06ff]/.test(question) || !/[a-zà-ÿ]/i.test(question) && state.lang === 'ar';
  const normalized = searchKey(question).trim();
  const math = coachLocalMath(normalized,ar);
  if (math) return math;
  const topic = COACH_LOCAL_TOPICS.find(item => item.match.test(normalized));
  if (topic) return topic.answer[Number(ar)];
  if (/^(?:salut|bonjour|bonsoir|coucou|hello|مرحبا|اهلا|السلام عليكم)[\s!.]*$/.test(normalized)) {
    return ar ? 'مرحبًا! جرّب أن تسألني كيف تجمع كسرين أو كيف تحلّ معادلة.' :
      'Bonjour ! Essaie de me demander comment additionner des fractions ou comment résoudre une équation.';
  }
  return ar ? 'لا توجد لديّ بطاقة محلية عن هذا الموضوع. جرّب سؤالًا عن الكسور أو المعادلات أو الخلية، أو استخدم المساعد عبر الإنترنت لسؤال آخر.' :
    'Je n’ai pas de fiche locale sur ce sujet. Essaie une question sur les fractions, les équations ou la cellule. Pour une autre question, utilise le coach en ligne lorsqu’il est disponible.';
}
