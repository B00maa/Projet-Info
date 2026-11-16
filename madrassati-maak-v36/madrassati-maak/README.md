# Madrassati Maâk

Madrassati Maâk est une plateforme scolaire en français et en arabe. Cette archive contient le code de la version publiée 46 ainsi que ses ressources et ses migrations SQL.

## Lancer le projet

Installez Node.js 24, puis ouvrez un terminal dans le dossier `madrassati-maak`. Le projet utilise les modules intégrés de Node.js.

```bash
npm run dev -- --host 127.0.0.1
```

Ouvrez [http://127.0.0.1:5173](http://127.0.0.1:5173). Vous pouvez explorer les quatre profils de la maquette avec des données fictives. L’espace scolaire connecté et ses coachs en ligne utilisent les services décrits plus bas.

La commande `npm run build` assemble le serveur et les ressources web dans `dist/server/index.js`.

| Dossier | Contenu |
| --- | --- |
| `web/` | Maquette, interface de l’espace scolaire, styles, illustrations et médias |
| `worker/` | API, authentification scolaire, gestion des classes, fichiers et coachs |
| `drizzle/` | Migrations SQL de la base de données |
| `scripts/` | Compilation et aperçu local |

## Espace scolaire connecté

La route `/ecole` utilise un environnement Workers avec une base Cloudflare D1 liée au nom `DB` et un espace de stockage Cloudflare R2 lié au nom `BUCKET`. Pour une nouvelle base, appliquez `0000_school.sql`, `0001_school_life.sql`, `0002_school_directory.sql`, `0003_school_workflows.sql`, `0004_teacher_course_library.sql`, `0005_school_schedule_and_revision.sql`, puis `0006_school_session_cancellation.sql` dans `drizzle/`.

Les noms des variables d’environnement sont indiqués dans `.env.example`. Configurez les valeurs dans les secrets de l’hébergeur. Sur ChatGPT Sites, elles se trouvent dans **Paramètres → Secrets**.

- `SCHOOL_SETUP_CODE` permet d’activer le premier compte administrateur. Choisissez un code aléatoire de 24 à 256 caractères. Depuis la connexion scolaire, ouvrez **Activer l’administration** et conservez les accès générés.
- `GROQ_API_KEY` active les coachs en ligne. Le coach professeur utilise GPT‑OSS 120B en priorité et le coach élève GPT‑OSS 20B. Lorsque le premier modèle atteint son quota, le coach peut essayer l’autre modèle GPT‑OSS, puis Qwen 3.8 27B. Le secret `CEREBRAS_API_KEY` permet d’ajouter le modèle `qwen-3.8-27b` de Cerebras comme secours après les modèles Groq. Après les tentatives de secours, une nouvelle tentative peut partir automatiquement si le prochain créneau annoncé est à trois secondes ou moins. Le coach affiche l’heure à partir de laquelle réessayer lorsqu’un délai est disponible. `DEEPSEEK_API_KEY` permet de configurer un fournisseur supplémentaire.

Dans **Administration → Parents → Ajouter un parent**, créez un compte et cochez les élèves à associer. Le bouton **Modifier** met à jour les associations.

Après connexion, la cloche ouvre les notifications et l’icône de sortie déconnecte le compte. Toute nouvelle connexion ouvre le tableau de bord du compte. Les élèves, les parents et les professeurs peuvent ouvrir leur avatar, puis sélectionner **Changer le mot de passe**. Ils saisissent leur code initial ou leur mot de passe actuel, puis choisissent un nouveau mot de passe.

Les professeurs peuvent générer des documents depuis une classe attribuée ou en **Préparation libre**. Le coach peut enregistrer un plan et générer ses chapitres un par un. Il reprend au chapitre suivant après une interruption.

Les nouveaux comptes choisissent leur mot de passe à la première connexion. L’administration suit cette étape et consulte les modifications dans **Historique des comptes**. Le professeur retrouve ses brouillons automatiques dans **Saisie des notes** et le parent voit ses actions en attente dans le résumé de la semaine.

Dans **Cours en préparation**, rouvrez, renommez ou dupliquez un brouillon et modifiez ou régénérez un chapitre précis. Dans **Saisie des notes**, exportez le tableau de l’évaluation, remplissez la colonne des notes et importez le fichier pour contrôler les valeurs et appliquer le tableau au brouillon.

Le **Tableau de bord** de l’élève présente les matières de sa classe, les devoirs à rendre, les prochaines séances et les séances à rattraper. Dans **Suivi de mon enfant**, le parent choisit l’élève suivi et retrouve ses devoirs, son planning, son assiduité et ses résultats. Les deux espaces reprennent le menu latéral de la maquette.

Dans **Planning des séances**, l’administration peut répéter une séance chaque semaine jusqu’à une date de fin. **Vérifier les créneaux** affiche les dates et les conflits avec la classe ou le professeur avant la publication. En modifiant une séance à venir, **Appliquer l’horaire aux séances suivantes** décale les dates et met à jour l’heure et la durée des prochaines séances de cette série.

Pour une séance à venir, l’administration peut cliquer sur **Annuler la séance** et renseigner un motif. Le créneau est libéré et les comptes concernés reçoivent une notification avec un lien vers la séance et son motif. **Rétablir la séance** vérifie la disponibilité du créneau et envoie une nouvelle notification.

Le bouton **Notifications** affiche les changements d’horaire, les devoirs corrigés et les notes publiées selon le profil. Chaque notification ouvre le détail de la séance, du devoir ou de l’évaluation. Dans **Résultats**, l’élève et le parent peuvent filtrer les notes publiées par matière et dates, ouvrir l’évaluation ou télécharger le relevé PDF.

Dans **Mes cours**, le professeur ouvre une matière et ajoute jusqu’à huit questions au quiz d’un cours. Il renseigne les choix, la bonne réponse et son explication. L’élève peut faire le quiz, consulter son corrigé après l’envoi et refaire une tentative. **Résultats du quiz** affiche, pour la version actuelle, les élèves qui ont répondu, leur dernier score et le nombre de bonnes réponses par question.

Les données du site hébergé et les valeurs de ses secrets sont absentes de l’archive. La configuration conserve les noms de liaison `DB` et `BUCKET` pour un nouveau projet.

## Partager le code sur GitHub

Créez un dépôt vide nommé `madrassati-maak` sur GitHub. Choisissez **Private** si le dépôt doit rester accessible au groupe. Le dossier fourni contient déjà son `README.md` et son `.gitignore`.

Avec Git installé, lancez ces commandes dans le dossier décompressé. Remplacez `TON-PSEUDO` par le nom du compte ou de l’organisation qui possède le dépôt.

```bash
git init -b main
git add .
git commit -m "Ajout du site Madrassati Maâk"
git remote add origin https://github.com/TON-PSEUDO/madrassati-maak.git
git push -u origin main
```

Pour inviter les membres, ouvrez **Settings → Collaborators → Add people** dans le dépôt. Le dépôt GitHub permet de collaborer sur le code. L’espace scolaire connecté s’exécute sur un hébergement Workers.

## Présentation de la maquette

## Écrans repris

Accueil public, connexion, tableau de bord élève, tableau de bord parent, tableau de bord professeur, tableau de bord administrateur, messagerie, calendrier et suivi des présences. Les rubriques complémentaires ouvrent aussi des pages utilisables : jeux éducatifs, matières, devoirs, notes, ressources, classes, élèves, comptes, certificats, statistiques, bien-être, préférences et assistance.

## Un thème commun, des menus propres à chaque profil

Le composant `renderRoleSidebar()` dans `roles.js` conserve le fond blanc, la typographie bleu marine, les icônes et l'état actif vert menthe sur toutes les pages. Les rubriques et les notifications sont propres au rôle sélectionné sur la page de connexion. Le changement libre de profil dans le menu a été supprimé.

- Élève : ses cours, son calendrier, ses devoirs, ses jeux, ses notes, ses ressources, ses messages et son bien-être.
- Parent : résultats, assiduité, devoirs et planning de son enfant ; échanges avec les enseignants, documents et accompagnement. Il consulte les travaux sans les déposer à la place de l'enfant.
- Professeur : ses classes, ses élèves, ses séances, les présences, les devoirs, les ressources et les échanges avec les parents.
- Administration : comptes, niveaux, classes, séances, statistiques, ressources et paramètres.

Les liens directs vers une rubrique d'un autre profil renvoient vers le tableau de bord du profil courant. Ces restrictions concernent l'interface de la maquette ; une application réelle doit vérifier l'identité et les permissions côté serveur.

## Jeux éducatifs

Quatre aventures jouables : Mission calcul, L'aventure des mots, Explorateur du vivant et Le mémo des nombres. Les questions proposent des explications après chaque réponse. Les jeux accordent 10 étoiles par réponse ou paire réussie et 10 étoiles pour terminer une aventure. Une même partie ne peut pas accorder sa récompense deux fois.

Deux difficultés, cinq questions par aventure, quatre ou six paires de mémoire. Le mode fatigue réduit les jeux à trois questions ou trois paires. Aucun chronomètre ni classement : l'enfant peut faire une pause. Les étoiles, meilleurs résultats et badges sont conservés dans le navigateur. Le parent dispose d'un résumé des découvertes de son enfant, sans afficher les jeux dans son menu.

## Fonctionnement de la démonstration

- Choix du profil sur la page de connexion, puis menu limité à son espace.
- Conversations distinctes par profil ; liste de parents et d'équipe pour l'enseignant.
- Brouillon de message conservé lorsque l'on joint un fichier ou change de conversation.
- Navigation par liens et historique du navigateur.
- Calendrier semaine/mois et sélection de séance.
- Messages, rappels, dépôt de devoir, comptes et validation de certificats simulés localement.
- Filtres de listes et exports CSV/PDF.
- Exercices guidés dans le coach d'études et générateur à partir d'une base de questions.
- Mode fatigue, préférences de lecture et menu mobile.
- Persistance des essais dans `localStorage` ; réinitialisation dans « Mes préférences ».

Les profils, messages, documents et résultats sont fictifs. La connexion ne réalise pas d'authentification. Les mots de passe ne sont ni stockés ni transmis. La messagerie ne contacte personne. Un dépôt de devoir conserve uniquement le nom du fichier. Les séances ouvrent un aperçu, sans visioconférence. Le coach et le générateur n'utilisent pas d'IA distante. Aucun service externe n'est nécessaire pour utiliser cette maquette.

## Corrections visuelles de la version 3

Les extraits de captures Canva ont été remplacés par `web/assets/student-learning-v3.webp` et `web/assets/family-learning-v3.webp`. Les illustrations ont été générées avec l'outil d'images intégré, à partir des maquettes comme références de style, puis exportées pour le site en conservant la transparence. Elles représentent un élève à son bureau et une maman qui accompagne son enfant. Aucun texte, logo ou morceau d'interface n'est intégré dans ces illustrations.

Briefs de création : illustration douce de livre pour enfants, palette menthe/bleu/ambre, personnage en sweat vert devant un ordinateur avec livres et plante ; deuxième scène avec une maman portant un hijab bleu. Scènes autonomes sur fond transparent, composition entière sans typographie, adaptées aux cartes du site.

Les images utilisent `object-fit: contain`, des dimensions explicites et des textes alternatifs. Elles totalisent environ 201 Ko, contre plus de 5 Mo pour les captures précédentes. Les textes secondaires sont agrandis, les contrastes renforcés, les boutons mobiles plus grands et les cartes réorganisées pour éviter le chevauchement des illustrations avec le texte. Le lien « Aller au contenu » conserve la page courante. Les durées des séances sont conservées lorsque l'on ouvre le formulaire de modification.

## Pour développer l'application finale

La maquette permet de valider les pages et les parcours utilisateur avec des données fictives. Les comptes et les permissions côté serveur relèvent de l’espace scolaire connecté.

## Français et arabe — version 4

Le bouton `العربية` en haut de page ouvre l'interface arabe. Le bouton `FR` permet de revenir au français. La langue peut aussi être choisie dans « Mes préférences » et reste mémorisée dans le navigateur. Les quatre espaces conservent leurs propres menus et permissions d'interface.

En arabe, la page utilise `lang="ar"` et `dir="rtl"` ; le menu est placé à droite. Les valeurs numériques, horaires, opérations mathématiques et graphiques gardent une direction adaptée. Les illustrations sont conservées et ne sont pas retournées.

Les menus, formulaires, notifications, messages de validation, pages, consignes et explications des jeux sont traduits. Les exemples et réponses du cours de français, ainsi que les contenus du cours d'anglais, restent dans leur langue d'apprentissage. Les messages réellement saisis restent tels qu'ils ont été écrits. Les valeurs internes des champs et les réponses des jeux ne sont pas modifiées par la traduction.

La recherche accepte les titres et noms arabes, y compris sans signes diacritiques. Le coach comprend les chiffres arabes `٠١٢٣٤٥٦٧٨٩`. Le changement de langue conserve la partie en cours et les récompenses. Les exports CSV utilisent des libellés arabes. Les PDF arabes sont composés en pages illustrées par le navigateur pour conserver la liaison des caractères, sans installer de bibliothèque ni télécharger de police ; leur texte est imprimable mais n'est pas sélectionnable.


## Améliorations de la version 5

- Un thème commun vert sauge, des menus regroupés par usage et des actions principales propres à chaque profil.
- Un tableau de bord élève réorganisé : séance, devoirs, matières, jeux et badges réellement débloqués.
- Un parcours personnel en trois étapes : mini-leçon, exercice avec explication et pause libre. Il se reprend après fermeture ou rechargement, conserve son état lors du changement de langue et démarre un nouveau parcours à la date locale du navigateur. Les réponses incorrectes ne valident pas l’exercice. Aucun point de jeu n’est accordé artificiellement.
- Le coach reste disponible dans un panneau dépliable. La recherche de ressources est accessible depuis l’en-tête sur ordinateur.
- Le menu mobile possède un bouton de fermeture, une navigation au clavier et un état ouvert annoncé aux lecteurs d’écran. Le menu fermé est masqué aux technologies d’assistance. Les animations respectent la préférence de réduction du mouvement.
- Les scènes restent entièrement visibles sur téléphone. Les nouvelles interfaces, y compris la mini-leçon, sont disponibles en français et en arabe. Les équations conservent leur lecture de gauche à droite.
- Les dates de cours sont explicitement indiquées comme une semaine exemple (mai 2025), sans faux compte à rebours.

Fichiers supplémentaires : `web/experience.css` (présentation et adaptation aux écrans) et `web/experience.js` (navigation regroupée, composants, traductions et parcours guidé).

Validation : vérifications de comportement sur les rubriques autorisées des quatre profils dans les deux langues, jeux, messages et parcours personnel ; contrôle visuel en navigateur sur ordinateur et dans des vues de 390 et 320 pixels. Les données restent celles d’une démonstration locale ; cette mise à jour n’ajoute pas de serveur d’authentification.


## Améliorations de la version 6

- Recherche rapide dans les rubriques autorisées du profil, les ressources et les activités disponibles. Le bouton de l’en-tête, Ctrl/Cmd + K et la touche / ouvrent la recherche. Entrée ouvre le premier résultat ; les mots français et arabes fonctionnent dans les deux interfaces.
- Bibliothèque avec marque-pages, filtre de favoris, recherche combinée avec les catégories et raccourcis sur le tableau de bord élève. Les favoris sont séparés par profil et conservés dans le navigateur.
- Une partie en pause par jeu : ordre des questions et des réponses conservé, questions déjà validées protégées contre un second comptage, cartes de mémoire conservées et désaccords transitoires déverrouillés au rechargement. Le score est recalculé à partir des réponses sauvegardées. Une partie terminée ne conserve pas de sauvegarde permettant de réclamer à nouveau sa récompense.
- Le bouton « Nouvelle partie » lance une nouvelle aventure avec la difficulté et le mode fatigue courants. Une reprise conserve les paramètres de la partie commencée.
- Sur téléphone, quatre accès directs au bas de l’écran, adaptés au profil. Le menu latéral complet reste disponible. Les fenêtres de recherche, les filtres et les marque-pages sont accessibles au clavier et disponibles en arabe.

Fichiers supplémentaires : `web/discover.js` et `web/discover.css`. Les rubriques et les jeux existants restent utilisables, y compris le parcours personnel de la version 5. La démonstration n’envoie pas de recherche, de message ou de fichier à un service externe.

Validation complémentaire : 1 774 vérifications de comportement au total ; contrôle en navigateur de la recherche arabe dans une interface française, des favoris, d’une reprise à la question suivante après rechargement et des vues de 390 et 320 pixels.
