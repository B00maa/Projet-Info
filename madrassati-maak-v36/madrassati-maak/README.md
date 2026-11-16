# Madrassati Maâk

Madrassati Maâk est une plateforme scolaire en français et en arabe. L’adresse principale ouvre l’espace scolaire à `/ecole`. L’élève, le parent, le professeur et l’administration s’y connectent avec leur compte scolaire.

## Développer le site

La version 47 publiée utilise Cloudflare D1 pour les données scolaires et R2 pour les fichiers. Le manifeste `.openai/hosting.json` déclare les liaisons `DB` et `BUCKET`. Les migrations SQL sont dans `drizzle/`.

Utiliser `npm run build` pour construire le Worker dans `dist/server/index.js`. `npm run dev` ouvre l’aperçu de l’interface. Les tests de connexion nécessitent un environnement Worker avec ses liaisons de données.

La branche `parcours-asynchrones-mysql` contient le développement du serveur Node.js et des parcours asynchrones sur MySQL.

## Utiliser l’espace scolaire

### Coach IA sur le site publié

Dans **Paramètres → Secrets** du site, configurer `GROQ_API_KEY` pour les deux coachs de l’espace scolaire. Le coach professeur utilise `openai/gpt-oss-120b` en priorité, et le coach élève `openai/gpt-oss-20b`. En cas de quota, le site essaie l’autre modèle, puis `qwen/qwen3.8-27b`.

Pour ajouter le secours Cerebras aux deux coachs, renseigner `CEREBRAS_API_KEY`. Le site essaie `qwen-3.8-27b` chez Cerebras après les tentatives Groq. `DEEPSEEK_API_KEY` active un secours supplémentaire. Chacun de ces fournisseurs peut aussi être utilisé seul dans l’espace scolaire. Republier après une modification des secrets. Lorsqu’un fournisseur indique un délai de réessai, le coach affiche l’heure correspondante sur l’appareil.

Pour l’élève, le serveur envoie la question, les derniers messages du coach IA et la langue d’interface au fournisseur configuré. Pour le professeur, il envoie le sujet, les consignes, la matière, le niveau et la langue du document. Le professeur peut transférer la version élève dans les formulaires de cours ou de devoir et télécharger le corrigé séparément. En cas de quota ou d’indisponibilité, les sujets locaux et les modèles à compléter restent accessibles.

L’espace connecté se trouve à `/ecole`. Pour créer le premier compte d’administration, ajouter le secret `SCHOOL_SETUP_CODE` avec une valeur aléatoire de 24 à 256 caractères et republier. Dans **Activer l’administration**, saisir ce code puis conserver l’identifiant et le code personnel affichés une seule fois. Utiliser ces accès pour se connecter.

Dans l’espace administration, créer les classes, les élèves et les professeurs depuis les rubriques correspondantes. Dans **Parents → Ajouter un parent**, créer un compte et choisir les élèves à lui associer. L’identifiant et le code personnel sont affichés à la création du compte. Le bouton **Modifier** permet de mettre à jour les associations. Les comptes élèves et professeurs peuvent être réaffectés, archivés et restaurés. Les comptes archivés conservent leur historique. Dans **Absences et justificatifs**, l’administration enregistre la réception du document papier.

Après connexion, la cloche ouvre les notifications et l’icône de sortie déconnecte le compte. Toute nouvelle connexion ouvre le tableau de bord du compte. Les élèves, les parents et les professeurs peuvent ouvrir leur avatar, puis sélectionner **Changer le mot de passe**. Ils saisissent leur code initial ou leur mot de passe actuel, puis choisissent un nouveau mot de passe.

Les nouveaux comptes scolaires choisissent leur mot de passe à la première connexion. L’administration suit cette étape dans **Gestion des comptes** et consulte **Historique des comptes** pour les changements de classe, les associations parent–élève et les réinitialisations d’accès.

Dans **Saisie des notes**, le professeur retrouve son brouillon automatique et le nombre de notes manquantes pendant la période ouverte par l’administration. Il sélectionne **Enregistrer les notes** pour valider la saisie. Le résumé de la semaine du parent rassemble les absences à justifier, le mode fatigue en attente et les messages non lus.

Le professeur peut exporter le tableau Excel d’une évaluation, remplir la colonne **Note / 20**, puis le réimporter dans la même évaluation. L’aperçu affiche les scores, les lignes à vérifier et les notes manquantes. **Appliquer au brouillon** reprend le tableau avant la validation des notes.

Le **Tableau de bord** de l’élève présente les matières de sa classe, les devoirs à rendre, les prochaines séances et les séances à rattraper. Dans **Suivi de mon enfant**, le parent choisit l’élève suivi et retrouve ses devoirs, son planning, son assiduité et ses résultats.

Dans **Planning des séances**, l’administration peut répéter une séance chaque semaine jusqu’à une date de fin. **Vérifier les créneaux** affiche les dates et les conflits avec la classe ou le professeur avant la publication. En modifiant une séance à venir, **Appliquer l’horaire aux séances suivantes** décale les dates et met à jour l’heure et la durée des prochaines séances de cette série.

Pour une séance à venir, l’administration peut cliquer sur **Annuler la séance** et renseigner un motif. Le créneau est libéré et les comptes concernés reçoivent une notification avec un lien vers la séance et son motif. **Rétablir la séance** vérifie la disponibilité du créneau et envoie une nouvelle notification.

Le bouton **Notifications** affiche les changements d’horaire, les devoirs corrigés et les notes publiées selon le profil. Chaque notification ouvre le détail de la séance, du devoir ou de l’évaluation. Dans **Résultats**, l’élève et le parent peuvent filtrer les notes publiées par matière et dates, ouvrir l’évaluation ou télécharger le relevé PDF.

Dans **Mes cours**, le professeur ouvre une matière et ajoute jusqu’à huit questions au quiz d’un cours. Il renseigne les choix, la bonne réponse et son explication. L’élève peut faire le quiz, consulter son corrigé après l’envoi et refaire une tentative. **Résultats du quiz** affiche, pour la version actuelle, les élèves qui ont répondu, leur dernier score et le nombre de bonnes réponses par question.

Le coach professeur peut reprendre la matière et le niveau d’une classe attribuée. Le mode **Préparation libre** permet de saisir la matière et le niveau et de télécharger le document. L’élève retrouve son coach dans **Coach d’études** et envoie sa question avec Entrée.

Pour rédiger un cours par étapes, sélectionner **Proposer un plan** ou écrire les intitulés, puis **Valider le plan**. **Générer le chapitre suivant** ajoute une partie et ses exercices au brouillon du professeur. Les chapitres terminés sont sauvegardés dans son compte et restent disponibles après le délai de réessai du coach.

Dans **Cours en préparation**, le professeur peut rouvrir, renommer ou dupliquer chaque brouillon. Les actions **Modifier le chapitre** et **Régénérer le chapitre** ciblent le chapitre sélectionné.

Construire le Worker avec `npm run build`. Le fichier de déploiement `dist/server/index.js` est généré à partir de `worker/index.js` et des fichiers de `web/`.
