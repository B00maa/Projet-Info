'use strict';

const VECTOR_SECTION_KEYS=['definition','subspace','span','independence','basis','rank','sum'];
const VECTOR_EXERCISE_KEYS=[['subspace','span'],['rank','basis','independence'],['sum','inclusion','union']];
const VECTOR_EXERCISE_CALCULATIONS=[
  [{type:'spanDimension',matrix:[[2,-1],[1,0],[0,1]],answer:[2]}],
  [{type:'rank',matrix:[[1,0,1],[1,1,2],[0,1,1]],answer:[2]},
    {type:'coordinates',matrix:[[1,0],[1,1],[0,1]],vector:[2,3,1],answer:[2,1]}],
  [{type:'intersectionDimension',matrix:[[1,0],[0,1],[0,0]],otherMatrix:[[0,0],[1,0],[0,1]],answer:[1]},
    {type:'sumDimension',matrix:[[1,0],[0,1],[0,0]],otherMatrix:[[0,0],[1,0],[0,1]],answer:[3]}]
];

const VECTOR_EXTRA_SECTIONS={
  theorems:{
    fr:['Base extraite et base incomplète','Dans un espace de dimension finie, une famille génératrice finie contient une base. On garde des vecteurs les uns après les autres, chaque fois qu’ils ajoutent une direction. Après le dernier vecteur, la famille gardée est libre et engendre le même espace. Inversement, pour compléter une famille libre en une base, on ajoute des vecteurs extérieurs à son espace engendré. Le nombre de vecteurs croît jusqu’à la dimension de l’espace.',
      'Dans ℝ³, la famille (e₁, e₂, e₁ + e₂, e₃) engendre ℝ³. En retirant e₁ + e₂, on extrait la base canonique. En partant de (e₁ + e₂, e₃), on complète cette famille libre avec e₁.'],
    en:['Extracting and extending bases','In finite dimension, a finite spanning family contains a basis. Scan its vectors and retain a vector exactly when it adds a new direction. The retained family is independent and spans the same space. Conversely, starting with an independent family, add vectors outside its span until its size reaches the dimension of the space.',
      'In ℝ³, remove e₁ + e₂ from (e₁, e₂, e₁ + e₂, e₃) to extract the standard basis. Extend (e₁ + e₂, e₃) by adding e₁.'],
    ar:['استخراج أساس وإكمال عائلة حرة','في فضاء ذي بعد منتهٍ يمكن استخراج أساس من كل عائلة مولّدة منتهية. نحتفظ بالمتجه كلما أضاف اتجاهًا جديدًا، فتبقى العائلة حرة وتولّد الفضاء نفسه. ولإكمال عائلة حرة نضيف متجهًا خارج الفضاء الذي تولّده، ونكرر العملية حتى يبلغ العدد بعد الفضاء.',
      'في ℝ³ نحذف e₁ + e₂ من (e₁, e₂, e₁ + e₂, e₃) للحصول على الأساس المعتاد. ونكمل العائلة (e₁ + e₂, e₃) بإضافة e₁.']
  },
  inclusion:{
    fr:['Inclusion et dimension','Si F et G sont des sous-espaces avec F ⊆ G et G de dimension finie, toute base de F est libre dans G. Elle comporte donc au plus dim G vecteurs. Si les dimensions sont égales, cette base de F est également une base de G, donc F = G. Cette propriété sert à transformer une inclusion déjà établie en égalité.',
      'Dans ℝ³, le plan F = Vect((1, 0, 0), (0, 1, 0)) est inclus dans le plan G d’équation z = 0. Chacun a la dimension 2, donc F = G.'],
    en:['Inclusion and dimension','For F ⊆ G with G finite-dimensional, a basis of F is independent in G, so dim F ≤ dim G. If equality holds, the basis of F also forms a basis of G and the spaces coincide.',
      'The span of (1, 0, 0) and (0, 1, 0) is contained in the plane z = 0. Both have dimension two, so they are equal.'],
    ar:['الاحتواء والبعد','إذا كان F ⊆ G وكان بعد G منتهيًا، فأساس F عائلة حرة في G، لذلك dim F ≤ dim G. عند تساوي البعدين يكون أساس F أساسًا أيضًا للفضاء G، ومنه F = G.',
      'الفضاء المولّد بالمتجهين (1, 0, 0) و(0, 1, 0) محتوى في المستوى z = 0. بعدهما اثنان، ولذلك هما متساويان.']
  },
  union:{
    fr:['Union de deux sous-espaces','Si l’un des sous-espaces est inclus dans l’autre, leur union est le plus grand des deux. Sinon, prends u ∈ F hors de G et v ∈ G hors de F. Alors u + v ne peut appartenir à F, car en retranchant u on obtiendrait v ∈ F. Le même argument exclut G. L’union échoue donc au test de stabilité.',
      'Les deux axes de ℝ² contiennent respectivement (1, 0) et (0, 1), alors que leur réunion ne contient pas (1, 1).'],
    en:['Union of two subspaces','The union of two subspaces is a subspace exactly when one contains the other. Otherwise take u in F but outside G and v in G but outside F. Their sum belongs to neither, because subtracting the appropriate summand would contradict the choice of u or v.',
      'The two coordinate axes in ℝ² contain (1, 0) and (0, 1), but their union excludes the sum (1, 1).'],
    ar:['اتحاد فضاءين جزئيين','يكون اتحاد فضاءين جزئيين فضاءً جزئيًا إذا احتوى أحدهما الآخر. إذا تعذّر الاحتواء نختار u من F وخارج G ونختار v من G وخارج F. لو كان مجموعهما في F لكان v في F بالطرح. وكذلك نستبعد وجود المجموع في G.',
      'محورا ℝ² يحتويان (1, 0) و(0, 1) على الترتيب، لكن اتحادهما لا يحتوي على (1, 1).']
  },
  degree:{
    fr:['Polynômes de degrés distincts','Une famille finie de polynômes non nuls dont les degrés sont deux à deux distincts est libre. Dans une relation non triviale, choisis le polynôme de plus haut degré parmi ceux dont le coefficient est non nul. Aucun autre terme ne peut annuler son terme dominant. La somme ne peut donc être le polynôme nul.',
      'Les polynômes 1, X + 2 et X² − X sont libres. Dans a + b(X + 2) + c(X² − X) = 0, on lit d’abord c = 0, puis b = 0, enfin a = 0.'],
    en:['Polynomials of distinct degrees','Nonzero polynomials with pairwise distinct degrees are independent. In a nontrivial relation, choose the polynomial of highest degree with a nonzero multiplier. No other term can cancel its leading term, contradicting the zero polynomial.',
      'For 1, X + 2 and X² − X, inspect coefficients in descending degree. The coefficients of X², X and 1 force c = 0, b = 0 and a = 0.'],
    ar:['كثيرات الحدود ذات الدرجات المختلفة','كل عائلة من كثيرات حدود غير صفرية ذات درجات مختلفة مثنى مثنى حرة. في علاقة غير تافهة نختار كثيرة الحدود ذات الدرجة القصوى بين المعاملات غير الصفرية. لا يمكن إلغاء حدها الرئيسي ببقية الحدود، وهذا يناقض انعدام المجموع.',
      'كثيرات الحدود 1 وX + 2 وX² − X حرة. نقرأ معاملات X² ثم X ثم 1 فنحصل على c = 0 ثم b = 0 ثم a = 0.']
  },
  addedRank:{
    fr:['Effet d’un vecteur sur le rang','Ajoute v à une famille qui engendre F. Si v ∈ F, les combinaisons possibles engendrent toujours F. Si v ∉ F, une base de F suivie de v forme une famille libre et génératrice de F + Vect(v). Le rang vaut donc soit le rang initial, soit ce rang augmenté de 1.',
      'Dans ℝ³, (1, 0, 0) et (0, 1, 0) sont de rang 2. Ajouter (2, 2, 0) conserve le rang, alors qu’ajouter (0, 0, 1) donne le rang 3.'],
    en:['Effect of adding a vector on rank','Let F be the span of a family. Adding v in F leaves the span unchanged. If v is outside F, a basis of F followed by v is independent and spans the enlarged space, so the rank increases by one.',
      'Adding (2, 2, 0) to the first two standard vectors does not change rank. Adding (0, 0, 1) instead raises the rank from two to three.'],
    ar:['أثر إضافة متجه في الرتبة','ليكن F الفضاء المولّد. إذا أضفنا متجهًا من F بقي الفضاء نفسه. وإذا كان المتجه خارج F فإن ضمه إلى أساس F يعطي أساسًا للفضاء الجديد، فترتفع الرتبة بمقدار واحد.',
      'إضافة (2, 2, 0) إلى أول متجهين من الأساس المعتاد تبقي الرتبة اثنين. أما إضافة (0, 0, 1) بدلًا منه فتعطي الرتبة ثلاثة.']
  }
};

function vectorLessonSection(heading) {
  const value=teacherLessonKey(heading);
  const hit=Object.entries(TEACHER_VECTOR_LESSON).flatMap(([,lesson])=>
    lesson.sections.map((part,index)=>[teacherLessonKey(part.heading),VECTOR_SECTION_KEYS[index]]));
  for(const [id,texts] of Object.entries(VECTOR_EXTRA_SECTIONS))for(const [title] of Object.values(texts))hit.push([teacherLessonKey(title),id]);
  const exact=hit.find(([title])=>title===value);
  if(exact)return exact[1];
  if(/grassmann|sommes? direct|supplementaire|direct sum|complement|المجموع المباشر|متتامن/u.test(value))return 'sum';
  if(/base extraite|base incomplete|completer une base|extend.*bas|extract.*bas|استخراج اساس|اكمال عايله/u.test(value))return 'theorems';
  if(/union|اتحاد/u.test(value))return 'union';
  if(/degre.*distinct|distinct degree|الدرجات المختلفه/u.test(value))return 'degree';
  if(/inclusion|احتواء/u.test(value))return 'inclusion';
  if(/effet.*rang|ajout.*rang|effect.*rank|اثر اضافه/u.test(value))return 'addedRank';
  if(/dimension|rang|rank|pivot.*gauss|البعد|الرتبه/u.test(value))return 'rank';
  if(/famill.*libre|independan|dependent|liees?|الحرت|الحرة|المرتبط/u.test(value))return 'independence';
  if(/bases?|coordonnees|basis|coordinate|الاساس|الاحداثيات/u.test(value))return 'basis';
  if(/combinaisons? lineaire|espace engendre|generatric|linear combination|span|التركيبات|المولد/u.test(value))return 'span';
  if(/sous espaces?|subspaces?|الفضاءات المتجهية الجزئية/u.test(value))return 'subspace';
  if(/definition|premiers exemples|تعريف/u.test(value))return 'definition';
  return null;
}

function vectorLessonParts(language) {
  const base=TEACHER_VECTOR_LESSON[language];
  const parts=base.sections.map((section,index)=>({...section,key:VECTOR_SECTION_KEYS[index]}));
  for(const [key,texts] of Object.entries(VECTOR_EXTRA_SECTIONS)){
    const [heading,explanation,example]=texts[language];
    parts.push({key,heading,explanation,example});
  }
  return new Map(parts.map(part=>[part.key,part]));
}

function vectorLessonPlan(context) {
  const parts=vectorLessonParts(context.language);
  const keys=context.lessonMode==='session'?['subspace','span']:
    ['definition','subspace','span','independence','basis','theorems','rank','sum'];
  return keys.map(key=>parts.get(key).heading);
}

function buildVectorLesson(context) {
  const base=TEACHER_VECTOR_LESSON[context.language],parts=vectorLessonParts(context.language);
  const plan=context.lessonPlan||vectorLessonPlan(context);
  const keys=plan.map(vectorLessonSection);
  if(keys.some(key=>!key))return null;
  const sections=keys.map((key,index)=>{
    const part=parts.get(key);
    return {...part,heading:plan[index],diagram:key==='sum'?'vector-complement':key==='basis'?'vector-coordinates':undefined};
  });
  const exercises=base.exercises.map((exercise,index)=>{
    const target=VECTOR_EXERCISE_KEYS[index].map(key=>keys.indexOf(key)).find(index=>index>=0);
    const section=target===undefined?0:target+1;
    return {...exercise,section,checks:VECTOR_EXERCISE_CALCULATIONS[index].map(checkLessonCalculation)};
  });
  const related=exercises.filter(exercise=>exercise.section);
  const lesson={...base,sections,exercises:related.length?related:exercises};
  if(context.lessonLevel&&context.lessonLevel!=='class')lesson.level=TEACHER_LESSON_LEVELS[context.lessonLevel][context.language];
  const levelNote=VECTOR_LEVEL_METHODS[context.language][context.lessonLevel];
  if(levelNote){
    const index=Math.max(0,keys.indexOf('basis'));
    sections[index].explanation+='\n\n'+levelNote;
  }
  return lesson;
}

const VECTOR_LEVEL_METHODS={
  fr:{cpge:'Méthode CPGE. Distingue les hypothèses du résultat. Pour une affirmation de base, prouve séparément l’existence et l’unicité de la décomposition. Lorsque tu utilises un résultat de dimension, indique que l’espace est de dimension finie.',
    l1:'Méthode L1. Commence par écrire les vecteurs en colonnes. Traduis la question en un système linéaire, effectue les opérations de Gauss, puis relis ce que chaque pivot dit sur la famille ou sur le système.'},
  en:{cpge:'Proof method. State which assumptions are used. Prove existence and uniqueness separately when asserting a basis expansion. Check finite dimension before applying a dimension theorem.',
    l1:'Calculation method. Put the vectors in columns, form the linear system and perform elimination. Interpret each pivot in terms of the original question.'},
  ar:{cpge:'طريقة البرهان. حدّد الفرضيات أولًا. افصل بين إثبات وجود الكتابة وإثبات وحدانيتها. تحقّق من انتهاء البعد قبل استعمال خصائص الأبعاد.',
    l1:'طريقة الحساب. ضع المتجهات في أعمدة ثم اكتب النظام الخطي وطبّق الحذف بطريقة غاوس. فسّر المحاور بالنسبة إلى السؤال الأصلي.'}
};

const VECTOR_ADDITIONS={
  fr:{
    definition:[
      'On déduit 0u = 0 des axiomes. Par distributivité, (0 + 0)u = 0u + 0u. Comme 0 + 0 = 0, on soustrait 0u aux deux membres et on obtient le vecteur nul.',
      'Sur les polynômes réels, prends P = X² + 1 et Q = X − 1. Alors 2P = 2X² + 2 et 3Q = 3X − 3. En soustrayant on trouve 2P − 3Q = 2X² − 3X + 5.',
      'L’ensemble des couples de réels à coordonnées positives ou nulles contient (1, 0), mais il exclut (−1, 0). Il ne peut donc pas être un espace vectoriel pour les opérations usuelles.'
    ],
    subspace:[
      'L’intersection F ∩ G de deux sous-espaces contient 0. Si u et v sont dans F ∩ G, toute combinaison λu + μv appartient à F par stabilité de F et à G par stabilité de G. Elle appartient donc à F ∩ G, qui est bien un sous-espace.',
      'Étudie la droite D = {(t, 2t) : t ∈ ℝ}. Elle contient 0. Une combinaison de (t, 2t) et (s, 2s) s’écrit (r, 2r) avec r = λt + μs. Elle reste dans D.',
      'La droite d’équation y = x + 1 est affine. Elle ne contient pas (0, 0). Par exemple, (0, 1) appartient à la droite mais son double (0, 2) n’y appartient pas.'
    ],
    span:[
      'La somme de deux combinaisons des mêmes vecteurs est une combinaison de ces vecteurs, et leur produit par un scalaire aussi. Leur ensemble contient 0 et chacun des vecteurs de départ. Tout sous-espace qui contient ces vecteurs contient nécessairement toutes leurs combinaisons.',
      'Pour écrire (5, 1) sous la forme a(1, 1) + b(1, −1), résous a + b = 5 et a − b = 1. En additionnant, 2a = 6, donc a = 3 et b = 2. Cela prouve l’appartenance à l’espace engendré.',
      'Les vecteurs (1, 2) et (2, 4) forment deux vecteurs de ℝ² mais n’engendrent qu’une droite. Leurs combinaisons sont (a + 2b, 2(a + 2b)). Le vecteur (0, 1) n’a pas cette forme.'
    ],
    independence:[
      'Une famille libre reste libre lorsque l’on en retire des vecteurs. Une relation nulle sur la sous-famille s’étend à la famille complète en donnant le coefficient 0 à chaque vecteur retiré. La liberté de la famille complète force donc tous les autres coefficients à être nuls.',
      'Les vecteurs (1, 0, 1) et (0, 1, 1) sont libres. Si a(1, 0, 1) + b(0, 1, 1) = (0, 0, 0), les deux premières coordonnées donnent immédiatement a = b = 0.',
      'Trois vecteurs peuvent être deux à deux indépendants sans que la famille entière soit libre. Dans ℝ², e₁, e₂ et e₁ + e₂ vérifient la relation e₁ + e₂ − (e₁ + e₂) = 0. Aucun des trois n’est proportionnel à un autre.'
    ],
    basis:[
      'Soit B une base et v un vecteur. B est génératrice, donc v est combinaison de B. Si deux listes de coefficients donnent v, soustraire les deux combinaisons donne 0. La liberté de B impose alors que chaque différence de coefficients soit nulle.',
      'Dans la base ((1, 0), (1, 2)), cherche les coordonnées de (4, 6). La deuxième composante impose 2b = 6, donc b = 3. La première impose a + b = 4, donc a = 1. On vérifie (1, 0) + 3(1, 2) = (4, 6).',
      'La famille ((1, 0), (2, 0)) comporte deux vecteurs dans ℝ². La relation 2(1, 0) − (2, 0) = 0 montre qu’elle est liée. Avoir autant de vecteurs que la dimension ne suffit pas pour constituer une base.'
    ],
    theorems:[
      'Pour extraire une base, parcours une famille génératrice finie et garde un vecteur chaque fois qu’il est extérieur à l’espace déjà engendré. Les vecteurs écartés sont des combinaisons des vecteurs gardés, qui restent libres. Pour compléter une famille libre de k vecteurs dans un espace de dimension n, son espace engendré a la dimension k. Tant que k < n, choisis un vecteur hors de cet espace. L’ajout préserve la liberté. À n vecteurs, la famille libre est une base.',
      'Dans ℝ³, complète u = (1, 1, 0) par v = (0, 0, 1), puis par w = (0, 1, 0). Dans une relation au + bv + cw = 0, les première et troisième coordonnées donnent a = b = 0. La deuxième donne alors c = 0. La famille libre compte trois vecteurs : c’est une base.',
      'Dans ℝ³, les vecteurs (1, 0, 0) et (0, 1, 0) sont libres. Leur ajouter (2, 1, 0) ne complète pas la base. Le troisième est déjà dans le plan engendré et la famille obtenue est liée.'
    ],
    rank:[
      'En ajoutant v à une famille dont l’espace engendré est F, le nouvel espace est F + Vect(v). Si v est déjà dans F, cet espace est F. Sinon, une base de F augmentée de v est libre et engendre ce nouvel espace. La dimension augmente exactement de 1.',
      'Place en colonnes (1, 2, 0), (2, 4, 0) et (0, 1, 1). La deuxième colonne vaut deux fois la première. Les première et troisième colonnes sont indépendantes, car la troisième coordonnée impose le coefficient de la troisième colonne nul dans une relation. Le rang vaut 2.',
      'La matrice de colonnes (1, 2) et (2, 4) n’a aucune colonne nulle, mais son rang vaut 1 car la seconde colonne est le double de la première. Compter les colonnes non nulles ne donne pas le rang.'
    ],
    sum:[
      'Suppose F ∩ G = {0}. Si f + g = f′ + g′, alors f − f′ = g′ − g appartient à l’intersection. Cette différence est donc nulle, d’où l’unicité. Réciproquement, si v appartient à l’intersection, les écritures 0 = 0 + 0 et 0 = v + (−v) montrent que l’unicité impose v = 0.',
      'Dans ℝ³, pose F = {z = 0} et G = Vect((1, 0, 1)). Un élément de G est (t, 0, t), donc appartient à F seulement si t = 0. Pour tout (x, y, z), écris (x − z, y, 0) + (z, 0, z). Ainsi F et G sont supplémentaires.',
      'Dans ℝ³, les plans x = 0 et z = 0 ont pour somme ℝ³, mais ils se coupent selon l’axe des y. Ainsi (0, 1, 0) possède les décompositions (0, 1, 0) + 0 et 0 + (0, 1, 0). La somme ne peut être directe.'
    ],
    inclusion:[
      'Toute base de F forme une famille libre dans G. Dès qu’elle comporte dim G vecteurs, elle vérifie le critère de base en dimension finie et engendre G. Or elle engendre F par définition, ce qui donne l’égalité.',
      'Soit F l’espace engendré par (1, 1, 0) et (1, −1, 0). Ces deux vecteurs sont indépendants. F est inclus dans le plan z = 0 qui a dimension 2, donc F coïncide avec ce plan.',
      'Deux sous-espaces de même dimension peuvent être distincts quand on n’a pas d’inclusion. Les deux axes de ℝ² ont chacun pour dimension 1 et aucun ne contient l’autre.'
    ],
    union:[
      'Si ni F ni G ne contient l’autre, choisis f dans F hors de G et g dans G hors de F. Supposer f + g dans F donne g ∈ F après soustraction, une contradiction. Supposer f + g dans G donne f ∈ G. Leur union contient f et g mais pas leur somme.',
      'Prends F = Vect((1, 0, 0)) et G = {(x, y, 0)} dans ℝ³. Comme tout élément de F a z = 0, F est inclus dans G. Leur union est donc G, un sous-espace.',
      'Dans ℝ³, le plan x = 0 contient (0, 0, 1) et le plan z = 0 contient (1, 0, 0). Leur union ne contient pas (1, 0, 1), leur somme.'
    ],
    degree:[
      'Ordonne les polynômes selon leurs degrés. Dans une relation nulle, regarde le coefficient de la puissance maximale de X. Comme un seul des polynômes atteint ce degré, son coefficient dans la relation est nul. Recommence avec les polynômes de degré inférieur.',
      'Les polynômes X + 1 et X³ − 2 ont des degrés distincts. Dans a(X + 1) + b(X³ − 2) = 0, le coefficient de X³ donne b = 0 puis celui de X donne a = 0.',
      'Avoir le même degré n’implique pas la dépendance. Si a(X + 1) + b(X − 1) = 0, alors a + b = 0 et a − b = 0. Sur ℝ, cela force a = b = 0.'
    ]
  },
  en:{
    rank:['Adding a vector changes the span from F to F + span(v). If v is already in F the span stays the same. Otherwise a basis of F followed by v is independent and spans the larger space, so its dimension increases by one.',
      'For columns (1, 2, 0), (2, 4, 0), (0, 1, 1), the second is twice the first. The first and third are independent because of the last coordinate. Therefore the rank is two.',
      'The two columns (1, 2) and (2, 4) are both nonzero, but the second is twice the first. The rank is one, showing that counting nonzero columns does not compute rank.'],
    sum:['If f + g = f′ + g′, then f − f′ = g′ − g belongs to F ∩ G. A zero intersection therefore gives uniqueness. Conversely any nonzero v in the intersection gives two decompositions of zero, namely 0 + 0 and v + (−v).',
      'Let F be the plane z = 0 and G = span((1, 0, 1)). They intersect only at zero. Any (x, y, z) is (x − z, y, 0) + (z, 0, z), proving that F and G are complementary.',
      'The planes x = 0 and z = 0 sum to ℝ³ but both contain (0, 1, 0). This vector can be placed in either summand, giving two decompositions. Their sum is not direct.']
  },
  ar:{
    rank:['عند إضافة v يصبح الفضاء المولّد F + Vect(v). إذا كان v داخل F يبقى الفضاء كما هو. أما إذا كان خارجه فإن إضافة v إلى أساس F تعطي عائلة حرة تولّد الفضاء الجديد، لذلك يرتفع البعد بمقدار واحد.',
      'نضع المتجهات (1, 2, 0) و(2, 4, 0) و(0, 1, 1) في أعمدة. العمود الثاني ضعف الأول. العمودان الأول والثالث مستقلان لأن الإحداثية الأخيرة تحسم معامل الثالث. إذن الرتبة اثنان.',
      'العمودان (1, 2) و(2, 4) غير صفريين، لكن الثاني ضعف الأول. الرتبة تساوي واحدًا، لذلك لا يصح عدّ الأعمدة غير الصفرية لحساب الرتبة.'],
    sum:['إذا تساوت كتابتان f + g وf′ + g′ فإن f − f′ = g′ − g ينتمي إلى F ∩ G. انعدام التقاطع يضمن الوحدانية. وإلا فمتجه غير صفري v من التقاطع يعطي كتابتين للصفر هما 0 + 0 وv + (−v).',
      'ليكن F المستوى z = 0 وG المستقيم المولّد بـ(1, 0, 1). التقاطع صفري. نكتب (x, y, z) = (x − z, y, 0) + (z, 0, z)، فيكون الفضاءان متتامين.',
      'المستويان x = 0 وz = 0 مجموعهما ℝ³، ومع ذلك يشتركان في (0, 1, 0). يمكن وضع هذا المتجه في أي من الجزأين، فتوجد كتابتان ولا يكون المجموع مباشرًا.']
  }
};

function vectorLessonAddition(language,section,kind) {
  const index=['proof','example','counterexample'].indexOf(kind);
  return VECTOR_ADDITIONS[language]?.[section==='addedRank'?'rank':section]?.[index];
}
