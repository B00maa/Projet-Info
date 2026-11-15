'use strict';

const TEACHER_VECTOR_LESSON = {
  fr:{
    title:'Espaces vectoriels',
    summary:'Chapitre d’introduction de niveau CPGE ou première année du supérieur.',
    level:'CPGE / L1',
    objectives:[
      'Reconnaître un espace vectoriel et vérifier qu’une partie est un sous-espace.',
      'Déterminer les combinaisons linéaires, l’espace engendré et la liberté d’une famille.',
      'Construire une base, calculer des coordonnées, une dimension et un rang.',
      'Étudier l’intersection, la somme et la somme directe de sous-espaces.'
    ],
    sections:[
      {heading:'Définition et premiers exemples',explanation:`On fixe un corps de scalaires K, par exemple ℝ ou ℂ. Dans un espace vectoriel E sur K, on peut additionner deux vecteurs et multiplier un vecteur par un scalaire. L’addition est associative et commutative. Elle possède un élément neutre 0 et tout vecteur u possède un opposé −u. Pour λ, μ dans K et u, v dans E, on a λ(u + v) = λu + λv, (λ + μ)u = λu + μu, λ(μu) = (λμ)u et 1u = u.

Dans ℝⁿ, les opérations se font coordonnée par coordonnée. Les polynômes fournissent un autre exemple : additionner deux polynômes ou multiplier l’un d’eux par un réel donne encore un polynôme. Le vecteur nul est alors le polynôme nul. Les scalaires viennent du corps K, les vecteurs appartiennent à E.`,
        example:'Dans ℝ², pose u = (1, 2) et v = (3, −1). On obtient 2u = (2, 4) et −v = (−3, 1). En additionnant ces résultats, 2u − v = (−1, 5).'},
      {heading:'Sous-espaces vectoriels',explanation:`Une partie F d’un espace vectoriel E est un sous-espace si elle contient 0 et si λu + μv appartient à F quels que soient u, v dans F et λ, μ dans K. Ces deux vérifications suffisent : F hérite des propriétés des opérations de E. L’intersection de deux sous-espaces est un sous-espace, car les deux conditions restent vraies dans chacun d’eux.

Une droite ou un plan qui passe par l’origine fournit un exemple dans ℝ³. Les solutions d’un système linéaire homogène forment aussi un sous-espace. Une équation de même type avec un second membre non nul exclut le vecteur nul et ne décrit donc pas un sous-espace.`,
        example:'Soit F = {(x, y, z) ∈ ℝ³ : x + y + z = 0}. Le vecteur nul vérifie l’équation. Si u et v la vérifient, la somme des coordonnées de λu + μv vaut λ × 0 + μ × 0 = 0. Donc F est un sous-espace.'},
      {heading:'Combinaisons linéaires et espace engendré',explanation:`Une combinaison linéaire de v₁, …, vₚ est un vecteur de la forme λ₁v₁ + … + λₚvₚ. L’ensemble de ces combinaisons est noté Vect(v₁, …, vₚ). Il contient la famille et c’est le plus petit sous-espace qui la contient. La famille est génératrice de E si tout vecteur de E se décompose sous cette forme.

En pratique, on teste l’appartenance à un espace engendré en égalant les coordonnées et en résolvant un système pour les coefficients. Une solution suffit pour l’appartenance. Il peut y avoir plusieurs solutions lorsque la famille contient des vecteurs redondants.`,
        example:'Dans ℝ³, Vect((1, 0, 1), (0, 1, 1)) est l’ensemble des vecteurs (a, b, a + b). Le vecteur (2, 3, 5) en fait partie avec a = 2 et b = 3. Pour (2, 3, 6), les deux premières coordonnées imposent les mêmes coefficients mais la troisième vaut alors 5.'},
      {heading:'Familles libres et liées',explanation:`Une famille (v₁, …, vₚ) est libre si l’équation λ₁v₁ + … + λₚvₚ = 0 impose λ₁ = … = λₚ = 0. Elle est liée si cette équation admet une solution avec au moins un coefficient non nul. Un vecteur peut alors s’exprimer comme combinaison des autres. Une famille contenant 0 est toujours liée.

Pour tester la liberté, on résout le système homogène obtenu en plaçant les vecteurs en colonnes. Si le pivot de Gauss laisse un coefficient libre, on peut choisir une valeur non nulle et construire une relation de dépendance.`,
        example:'Dans ℝ², u = (1, 2) et v = (3, 6) vérifient 3u − v = 0. Les coefficients 3 et −1 ne sont pas tous nuls : (u, v) est liée. Les vecteurs (1, 0) et (0, 1) sont libres, puisque α(1, 0) + β(0, 1) = (α, β).'},
      {heading:'Bases et coordonnées',explanation:`Une base est une famille libre et génératrice. Le fait qu’elle soit génératrice garantit l’existence d’une décomposition pour tout vecteur. Si deux décompositions donnaient le même vecteur, leur différence serait une combinaison nulle. La liberté impose alors que leurs coefficients coïncident. Ces coefficients uniques, pris dans l’ordre de la base, sont les coordonnées du vecteur dans cette base.

Les axes donnent la base canonique de ℝ². L’espace des polynômes de degré au plus 2 admet la base (1, X, X²), car tout polynôme de cet espace s’écrit de façon unique a + bX + cX².`,
        example:'Dans la base ((1, 1), (1, −1)), les coordonnées de (4, 2) vérifient a + b = 4 et a − b = 2. En additionnant, 2a = 6, donc a = 3 puis b = 1. Ses coordonnées sont (3, 1).'},
      {heading:'Dimension et rang',explanation:`En dimension finie, toutes les bases d’un même espace ont le même nombre de vecteurs. Ce nombre est la dimension. Dans un espace de dimension n, une famille libre de n vecteurs est une base. Il en va de même pour une famille génératrice de n vecteurs. Une famille de plus de n vecteurs est liée.

Le rang d’une famille est la dimension de son espace engendré. Pour le calculer, on place les vecteurs en colonnes dans une base et on réduit la matrice par le pivot de Gauss. Le nombre de pivots donne le rang. Les colonnes de la matrice initiale correspondant aux pivots forment une base de l’espace engendré.`,
        example:'Considère u = (1, 0, 1), v = (0, 1, 1) et w = (1, 1, 2). Comme w = u + v, l’espace engendré est Vect(u, v). Les deux premières coordonnées montrent que u et v sont libres. La famille (u, v, w) est donc de rang 2.'},
      {heading:'Intersection, somme et supplémentaires',explanation:`La somme F + G contient les vecteurs f + g avec f ∈ F et g ∈ G. Elle est directe, et se note F ⊕ G, lorsque F ∩ G = {0}. En effet, si f + g = f′ + g′, alors f − f′ = g′ − g appartient à l’intersection. Une intersection réduite à 0 impose donc l’unicité de la décomposition. Il faut en plus vérifier que F + G = E pour conclure que F et G sont supplémentaires dans E.

En dimension finie, la formule de Grassmann donne dim(F + G) = dim F + dim G − dim(F ∩ G). On soustrait la dimension de l’intersection car ses directions sont comptées dans les deux sous-espaces. Pour le voir, on complète une base de F ∩ G en une base de F et en une base de G. En réunissant les deux listes sans répéter les vecteurs de l’intersection, on obtient une base de F + G.`,
        example:'Dans ℝ³, le plan z = 0 et l’axe des z sont supplémentaires. Tout (x, y, z) s’écrit (x, y, 0) + (0, 0, z), et un vecteur appartenant au plan et à l’axe a ses trois coordonnées nulles.'}
    ],
    recap:'Pour reconnaître un sous-espace, vérifie le zéro et la stabilité par combinaison linéaire. Pour trouver une base, vérifie à la fois la liberté et le fait d’engendrer. Le rang compte les directions indépendantes réellement engendrées. Pour conclure à une décomposition en supplémentaires, vérifie à la fois l’intersection et la somme.',
    exercises:[
      {prompt:'Dans ℝ³, justifie que F = {(x, y, z) : x − 2y + z = 0} est un sous-espace. Donne une base et sa dimension.',solution:'L’équation est linéaire et homogène : le zéro la vérifie et toute combinaison de deux solutions la vérifie. On isole x = 2y − z. Ainsi (x, y, z) = y(2, 1, 0) + z(−1, 0, 1). Les deuxième et troisième coordonnées imposent y = z = 0 pour que cette combinaison soit nulle. Les deux vecteurs forment une base et dim F = 2.'},
      {prompt:'Détermine le rang de u = (1, 1, 0), v = (0, 1, 1), w = (1, 2, 1). Donne les coordonnées de (2, 3, 1) dans une base de l’espace engendré.',solution:'On a w = u + v. Une combinaison au + bv donne (a, a + b, b). Si elle est nulle, les première et troisième coordonnées donnent a = b = 0. La famille (u, v) est une base et le rang vaut 2. Pour (2, 3, 1), prends a = 2 et b = 1. La deuxième coordonnée vaut bien 3.'},
      {prompt:'Dans ℝ³, considère F = {(x, y, 0)} et G = {(0, y, z)}. Calcule leur intersection et la dimension de leur somme. La somme est-elle directe ?',solution:'Un vecteur de F ∩ G a x = z = 0. L’intersection est Vect((0, 1, 0)), de dimension 1. Les deux plans sont de dimension 2. La formule de Grassmann donne dim(F + G) = 2 + 2 − 1 = 3, donc F + G = ℝ³. La somme n’est pas directe car l’intersection contient une droite.'}
    ]
  },
  en:{
    title:'Vector spaces',
    summary:'An introductory chapter for preparatory classes or first-year university.',
    level:'Preparatory classes / first year',
    objectives:['Recognise a vector space and test whether a subset is a subspace.',
      'Use linear combinations, spans and tests for independence.',
      'Find bases and coordinates, and compute dimensions and ranks.',
      'Study intersections, sums and direct sums of subspaces.'],
    sections:[
      {heading:'Definitions and examples',explanation:`Fix a field K of scalars, such as ℝ or ℂ. A vector space E over K supports addition of vectors and multiplication of vectors by scalars. Addition is associative and commutative, has a zero vector, and gives every vector u an additive inverse −u. For all scalars λ, μ and vectors u, v we have λ(u + v) = λu + λv, (λ + μ)u = λu + μu, λ(μu) = (λμ)u and 1u = u.

The operations on ℝⁿ are performed coordinate by coordinate. Polynomials also form a vector space: adding two polynomials or multiplying one by a real number produces another polynomial. Here the zero vector is the zero polynomial.`,
        example:'In ℝ² let u = (1, 2) and v = (3, −1). We have 2u = (2, 4) and −v = (−3, 1). Adding these gives 2u − v = (−1, 5).'},
      {heading:'Subspaces',explanation:`A subset F of E is a subspace if it contains 0 and is closed under λu + μv for all u, v in F and all scalars λ, μ. These two checks suffice because F inherits the vector space operations from E. Intersecting subspaces preserves these properties, so the intersection is also a subspace.

A line or plane through the origin is a subspace of ℝ³. The solution set of a homogeneous linear system is another example. A linear equation with a nonzero right-hand side excludes the zero vector and therefore cannot describe a subspace.`,
        example:'Let F = {(x, y, z) ∈ ℝ³ : x + y + z = 0}. The zero vector satisfies the equation. If u and v satisfy it, the sum of the coordinates of λu + μv is λ × 0 + μ × 0 = 0. Thus F is a subspace.'},
      {heading:'Linear combinations and span',explanation:`A linear combination of v₁, …, vₚ has the form λ₁v₁ + … + λₚvₚ. The set of all these combinations is the span of the family. It is the smallest subspace that contains the vectors. The family spans E when every vector of E can be written as such a combination.

To test whether a vector belongs to the span, equate its coordinates with those of a general combination and solve for the coefficients. One solution proves membership. Several solutions may exist when some of the vectors in the family are redundant.`,
        example:'The span of (1, 0, 1) and (0, 1, 1) consists of (a, b, a + b). It contains (2, 3, 5) by taking a = 2 and b = 3. The same first two coordinates force these coefficients for (2, 3, 6), but the third coordinate would be 5.'},
      {heading:'Linearly independent and dependent families',explanation:`Vectors are linearly independent if λ₁v₁ + … + λₚvₚ = 0 forces every coefficient λᵢ to be zero. They are dependent if a relation exists with at least one nonzero coefficient. Solving this relation for one vector shows that it is a combination of the others. A family containing the zero vector is always dependent.

In practice, place the vectors as columns and solve the homogeneous system. If elimination leaves a free variable, choosing a nonzero value for it gives a dependence relation.`,
        example:'In ℝ², u = (1, 2) and v = (3, 6) satisfy 3u − v = 0, so they are dependent. The vectors (1, 0) and (0, 1) are independent because α(1, 0) + β(0, 1) equals (α, β).'},
      {heading:'Bases and coordinates',explanation:`A basis is a linearly independent family that spans the space. Spanning guarantees a representation for each vector. If two representations produced the same vector, subtracting them would give a zero linear combination. Independence forces all the differences between coefficients to vanish. The unique coefficients, listed in basis order, are the coordinates of the vector.

The usual axes give the standard basis of ℝ². Polynomials of degree at most two have a basis (1, X, X²): each such polynomial has one expression of the form a + bX + cX².`,
        example:'In the basis ((1, 1), (1, −1)), the coordinates of (4, 2) solve a + b = 4 and a − b = 2. Adding yields 2a = 6, so a = 3 and b = 1.'},
      {heading:'Dimension and rank',explanation:`All bases of a finite-dimensional space have the same number of vectors, its dimension. In dimension n, n independent vectors form a basis, and n spanning vectors also form a basis. A family with more than n vectors is dependent.

The rank of a family is the dimension of its span. Put the vectors as columns of a matrix and apply Gaussian elimination. The number of pivots is the rank. The corresponding columns of the original matrix give a basis of the span.`,
        example:'Let u = (1, 0, 1), v = (0, 1, 1) and w = (1, 1, 2). Since w = u + v, the span is generated by u and v. Their first two coordinates prove independence, so the rank is 2.'},
      {heading:'Intersections, sums and complements',explanation:`The sum F + G consists of vectors f + g, with f in F and g in G. It is a direct sum, written F ⊕ G, exactly when F ∩ G = {0}. If f + g = f′ + g′, then f − f′ = g′ − g lies in the intersection. A zero intersection guarantees a unique decomposition. For F and G to be complementary in E, their sum must also equal E.

In finite dimension, dim(F + G) = dim F + dim G − dim(F ∩ G). The intersection is subtracted because its directions are counted in both subspaces.`,
        example:'In ℝ³ the plane z = 0 and the z-axis are complementary. Each (x, y, z) is (x, y, 0) + (0, 0, z), and belonging to both subspaces forces all three coordinates to be zero.'}
    ],
    recap:'For a subspace, check the zero vector and closure under linear combinations. For a basis, check both independence and spanning. Rank counts independent directions in the span. To prove that subspaces complement each other, check both their intersection and their sum.',
    exercises:[
      {prompt:'In ℝ³, prove that F = {(x, y, z) : x − 2y + z = 0} is a subspace. Find a basis and its dimension.',solution:'The equation is homogeneous and linear, so its solution set is a subspace. Isolate x = 2y − z to write (x, y, z) = y(2, 1, 0) + z(−1, 0, 1). The second and third coordinates show the two displayed vectors are independent. They form a basis and dim F = 2.'},
      {prompt:'Find the rank of u = (1, 1, 0), v = (0, 1, 1) and w = (1, 2, 1). Give the coordinates of (2, 3, 1) in a basis of their span.',solution:'Since w = u + v, the span is generated by u and v. The first and third coordinates of au + bv are a and b, so the pair is independent and the rank is 2. For (2, 3, 1), take a = 2 and b = 1. The middle coordinate is a + b = 3.'},
      {prompt:'In ℝ³ let F = {(x, y, 0)} and G = {(0, y, z)}. Find their intersection and the dimension of their sum. Is the sum direct?',solution:'Their intersection consists of (0, y, 0), a one-dimensional line. Each plane has dimension 2. The dimension formula gives 2 + 2 − 1 = 3 for their sum, so the sum is ℝ³. It is not direct because the intersection contains nonzero vectors.'}
    ]
  },
  ar:{
    title:'الفضاءات المتجهية',
    summary:'فصل تمهيدي للأقسام التحضيرية أو للسنة الأولى من التعليم العالي.',
    level:'الأقسام التحضيرية / السنة الأولى',
    objectives:['التعرّف على الفضاء المتجهي والتحقق من أن مجموعة جزئية فضاء متجهي جزئي.',
      'استعمال التركيبات الخطية والفضاء المولّد واختبار الاستقلال الخطي.',
      'إيجاد أساس وإحداثيات وحساب البعد والرتبة.',
      'دراسة تقاطع الفضاءات الجزئية ومجموعها والمجموع المباشر.'],
    sections:[
      {heading:'التعريف وأمثلة أولية',explanation:`نختار حقلًا للمعاملات مثل ℝ أو ℂ ونرمز إليه بالرمز K. في الفضاء المتجهي E يمكن جمع متجهين وضرب متجه في معامل. جمع المتجهات تجميعي وتبادلي، وله عنصر محايد هو المتجه الصفري. ولكل متجه u نظير جمعي هو −u. ويتحقق التوزيع بالنسبة إلى جمع المتجهات وجمع المعاملات، ويوافق تعاقب الضرب ضرب المعاملات، كما أن 1u = u.

في ℝⁿ نجري العمليات إحداثية بإحداثية. كثيرات الحدود مثال آخر، لأن جمع كثيرتي حدود أو ضرب إحداهما في عدد حقيقي يعطي كثيرة حدود. كثيرة الحدود الصفرية هي المتجه الصفري في هذا المثال.`,
        example:'في ℝ² نأخذ u = (1, 2) وv = (3, −1). نحصل على 2u = (2, 4) وعلى −v = (−3, 1). بجمع النتيجتين نجد 2u − v = (−1, 5).'},
      {heading:'الفضاءات المتجهية الجزئية',explanation:`تكون المجموعة F فضاءً جزئيًا من E إذا احتوت على المتجه الصفري وكانت مستقرة عند أخذ λu + μv لأي متجهين من F وأي معاملين من K. يكفي هذا الشرط لأن العمليات في F هي العمليات الموروثة من E. كما أن تقاطع فضاءين جزئيين فضاء جزئي، لأن الشرطين يتحققان في كل منهما.

المستقيم أو المستوى المار من مبدأ الإحداثيات يعطي مثالًا في ℝ³. وحلول نظام خطي متجانس تشكّل فضاءً جزئيًا أيضًا. أما إذا كان الطرف الأيمن غير صفري فإن المتجه الصفري لا يحقق المعادلة.`,
        example:'لتكن F مجموعة حلول x + y + z = 0 في ℝ³. المتجه الصفري يحقق المعادلة. وإذا حققها u وv فإن مجموع إحداثيات λu + μv يساوي λ × 0 + μ × 0 = 0. إذن F فضاء جزئي.'},
      {heading:'التركيبات الخطية والفضاء المولّد',explanation:`التركيب الخطي للمتجهات v₁, …, vₚ هو متجه من الشكل λ₁v₁ + … + λₚvₚ. مجموعة هذه التركيبات هي الفضاء المولّد. وهو أصغر فضاء جزئي يحتوي على المتجهات المعطاة. وتولّد العائلة الفضاء E إذا أمكن التعبير عن كل متجه من E بتركيب خطي منها.

للتحقق من انتماء متجه إلى الفضاء المولّد نساوي الإحداثيات ونحل النظام بالنسبة إلى المعاملات. وجود حل يكفي لإثبات الانتماء. وقد توجد عدة حلول عندما تحتوي العائلة على متجهات زائدة.`,
        example:'يولّد (1, 0, 1) و(0, 1, 1) المتجهات (a, b, a + b). ينتمي (2, 3, 5) باختيار a = 2 وb = 3. وتفرض أول إحداثيتين القيم نفسها للمتجه (2, 3, 6)، لكن الإحداثية الثالثة الناتجة تساوي 5.'},
      {heading:'العائلات الحرة والمرتبطة',explanation:`تكون العائلة حرة إذا فرضت العلاقة λ₁v₁ + … + λₚvₚ = 0 انعدام كل المعاملات. وتكون مرتبطة إذا وُجدت علاقة من هذا الشكل فيها معامل واحد على الأقل غير صفري. يمكن عندئذ التعبير عن أحد المتجهات بتركيب خطي من البقية. وكل عائلة تحتوي على المتجه الصفري مرتبطة.

في الحساب نضع المتجهات أعمدة ونحل النظام المتجانس بطريقة غاوس. وجود مجهول حر يسمح باختيار قيمة غير صفرية وبناء علاقة ارتباط بين المتجهات.`,
        example:'إذا كان u = (1, 2) وv = (3, 6)، فإن 3u − v = 0، لذا فالعائلة مرتبطة. أما (1, 0) و(0, 1) فهما مستقلان خطيًا لأن α(1, 0) + β(0, 1) = (α, β).'},
      {heading:'الأساس والإحداثيات',explanation:`الأساس عائلة حرة ومولّدة في الوقت نفسه. خاصية التوليد تضمن وجود كتابة لكل متجه. إذا أعطت كتابتان المتجه نفسه، فطرحهما يعطي تركيبًا خطيًا يساوي الصفر. وبفضل الاستقلال الخطي تتطابق المعاملات. نسمي هذه المعاملات الوحيدة، وفق ترتيب الأساس، إحداثيات المتجه.

محورا الإحداثيات يعطيان الأساس المعتاد في ℝ². وللفضاء المكوّن من كثيرات الحدود من الدرجة الثانية على الأكثر أساس هو (1, X, X²)، لأن كل كثيرة حدود فيه تُكتب بشكل وحيد على صورة a + bX + cX².`,
        example:'نبحث عن إحداثيات (4, 2) في الأساس ((1, 1), (1, −1)). يعطينا تساوي الإحداثيات a + b = 4 وa − b = 2. بالجمع نحصل على 2a = 6، ومنه a = 3 وb = 1.'},
      {heading:'البعد والرتبة',explanation:`لجميع أسس الفضاء ذي البعد المنتهي العدد نفسه من المتجهات، وهو بُعد الفضاء. إذا كان البعد n، فإن عائلة حرة تتألف من n متجهات هي أساس، وعائلة مولّدة من n متجهات هي أساس أيضًا. وكل عائلة فيها أكثر من n متجهات مرتبطة.

الرتبة هي بُعد الفضاء المولّد. نحسبها بوضع إحداثيات المتجهات في أعمدة مصفوفة ثم إجراء الحذف بطريقة غاوس. عدد المحاور الناتجة يساوي الرتبة، والأعمدة المقابلة لها من المصفوفة الأصلية تشكّل أساسًا للفضاء المولّد.`,
        example:'لِتكن u = (1, 0, 1) وv = (0, 1, 1) وw = (1, 1, 2). بما أن w = u + v يَكفي المتجهان u وv للتوليد. أول إحداثيتين تثبتان استقلالهما، فتكون الرتبة 2.'},
      {heading:'التقاطع والمجموع والفضاءات المتتامة',explanation:`يتكوّن F + G من متجهات تكتب على شكل f + g بحيث ينتمي f إلى F وg إلى G. يكون المجموع مباشرًا، ونكتب F ⊕ G، إذا كان F ∩ G = {0}. فإذا تساوت كتابتان، فإن فرق جزأيهما ينتمي إلى التقاطع؛ وعند انعدامه تكون الكتابة وحيدة. ولكي يكون الفضاءان متتامين في E يجب أيضًا أن يكون F + G = E.

في الأبعاد المنتهية نحصل على dim(F + G) = dim F + dim G − dim(F ∩ G). نطرح بُعد التقاطع لأن اتجاهاته تُحسب في كلا الفضائين.`,
        example:'في ℝ³ المستوى z = 0 ومحور z متتامان. يُكتب أي متجه (x, y, z) على شكل (x, y, 0) + (0, 0, z)، ولا يمكن لمتجه ينتمي إلى المستوى والمحور معًا أن يكون غير صفري.'}
    ],
    recap:'للتحقق من فضاء جزئي نختبر وجود المتجه الصفري والاستقرار بالتركيب الخطي. لإثبات أن عائلة أساس نتحقق من الاستقلال والتوليد. الرتبة هي بُعد الفضاء المولّد، والمجموع المباشر يتطلب أن يكون التقاطع مختزلًا في المتجه الصفري.',
    exercises:[
      {prompt:'أثبت أن مجموعة حلول x − 2y + z = 0 في ℝ³ فضاء جزئي. أوجد أساسًا له وبُعده.',solution:'المعادلة خطية متجانسة، لذا فمجموعة الحلول فضاء جزئي. من x = 2y − z نجد (x, y, z) = y(2, 1, 0) + z(−1, 0, 1). الإحداثيتان الثانية والثالثة تثبتان استقلال المتجهين، إذ تفرضان انعدام المعاملين إذا انعدم المجموع. إذن المتجهان أساس والبُعد 2.'},
      {prompt:'احسب رتبة العائلة u = (1, 1, 0) وv = (0, 1, 1) وw = (1, 2, 1). أوجد إحداثيات (2, 3, 1) في أساس للفضاء المولّد.',solution:'لدينا w = u + v، فيولّد u وv الفضاء. الإحداثيتان الأولى والثالثة للمتجه au + bv هما a وb، مما يثبت الاستقلال ويعطي رتبة تساوي 2. نحصل على المتجه المعطى باختيار a = 2 وb = 1، وتساوي الإحداثية الثانية 3.'},
      {prompt:'في ℝ³، لتكن F = {(x, y, 0)} وG = {(0, y, z)}. احسب التقاطع وبُعد المجموع، وهل هو مباشر؟',solution:'في التقاطع نجد x = z = 0، فهو مستقيم بُعده 1. بُعد كل من المستويين 2. بصيغة الأبعاد يكون بُعد المجموع 2 + 2 − 1 = 3، فيساوي المجموع ℝ³. المجموع غير مباشر لأن التقاطع يحتوي على متجهات غير صفرية.'}
    ]
  }
};
