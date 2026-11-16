# Madrassati Maâk

Plateforme scolaire asynchrone en français et en arabe. Le parcours réel s’ouvre à la racine du site et à `/ecole`. Les comptes sont affectés à un niveau et, selon le programme, à une filière.

- L’administration crée les niveaux, affecte les professeurs et remet les accès aux élèves et aux parents. Elle pilote les fenêtres de saisie et la publication des notes.
- Le professeur publie des chapitres avec cours, supports téléchargeables, vidéos, devoirs et quiz. Il suit la progression et traite les questions dans la messagerie.
- L’élève reprend sa dernière activité, retrouve les notions à revoir après un quiz et pose ses questions depuis un chapitre.
- Le parent consulte les chapitres terminés, les devoirs et les résultats publiés des enfants associés à son compte.

Une évaluation est publiée pour un niveau avec une période de remise et un barème sur 20. Chaque élève commence à son heure. Le site conserve son brouillon et accepte une réponse écrite ou un dépôt PDF, JPEG ou PNG. Un contrôle peut avoir un minuteur individuel. Le professeur peut prolonger le délai ou le temps de rédaction, corriger les copies et proposer une note. La période ouverte par l’administration permet ensuite de valider la saisie et de publier les résultats.

## Lancer le serveur

Utiliser Node.js 22 ou supérieur et MySQL 8.4. Créer une base vide MySQL, puis définir ces variables côté serveur.

| Variable | Usage |
|---|---|
| `MYSQL_URL` | URL `mysql://utilisateur:mot-de-passe@hote:3306/base`. Encoder les caractères réservés de l’identifiant et du mot de passe. |
| `MYSQL_CA_FILE` | Chemin vers le certificat d’autorité fourni par l’hébergeur MySQL pour les connexions TLS. |
| `SCHOOL_ORIGIN` | Adresse publique HTTPS exacte du site. En local, valeur par défaut `http://127.0.0.1:5173`. |
| `SCHOOL_SETUP_CODE` | Valeur aléatoire de 24 à 256 caractères utilisée pour activer le premier compte d’administration. |
| `HOST`, `PORT` | Interface d’écoute et port. Par défaut `127.0.0.1` et `5173`. |
| `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `DEEPSEEK_API_KEY` | Services facultatifs pour les coachs IA. |

```sh
npm ci
npm run db:init
npm run build
npm start
```

Ouvrir l’adresse du site et choisir **Activer l’administration**. Conserver les accès affichés une seule fois. Les comptes élèves, parents et professeurs choisissent leur mot de passe à la première connexion.

En production, placer le serveur derrière un frontal HTTPS. L’application utilise MySQL pour les comptes, les contenus, les réponses, les notes et les fichiers joints. Les migrations d’installation se trouvent dans `mysql/`.

La version 46 publiée sur l’hébergement Sites utilise D1. Le déploiement de cette branche exige un serveur Node.js et une base MySQL. Pour reprendre les comptes et contenus d’une installation D1, prévoir un export de la base et des fichiers ainsi qu’une correspondance entre anciennes classes et nouveaux niveaux.

## Tests

`MYSQL_TEST_URL` indique une instance MySQL 8.4 dédiée aux essais. Le compte de test doit pouvoir créer et supprimer une base temporaire. La suite crée ses propres comptes et données fictifs.

```sh
npm test
```

La suite vérifie l’activation, les quatre rôles, l’ouverture du site réel, les niveaux, les chapitres, les parcours, les quiz, les pièces jointes, les remises individuelles, le minuteur, la prolongation et la publication des notes.
