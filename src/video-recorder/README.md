# Video Recorder plugin pour Bubble

## Developpement

### Prerequis
- Node.js 22
- yarn (via corepack `corepack enable`)


### Installation
```bash
yarn install
```

### Lancer le projet

Dans un terminal, lancez la commande suivante pour démarrer la compilation en mode développement :
```bash
yarn build --watch
```

Dans un autre terminal, lancez la commande suivante pour démarrer le serveur de développement :
```bash
yarn serve
```

Dans Bubble, aller sur le plugin "360SkillVue" dans la partie "Shared" et dans la parte "HTML Header" remplacer les lignes "meta-q.cdn.bubble.io" par les suivantes :
```html
<script type="module" src="//localhost:3000/video-recorder.js"></script>
<link rel="stylesheet" href="//localhost:3000/video-recorder.css">
```
Cela permet de charger le plugin depuis le serveur de développement en local pour les tests.

### Build pour la production

Pour créer une version de production du plugin, exécutez la commande suivante :
```bash
yarn build
```

Puis transférez les fichiers générés dans le dossier `dist` dans le plugin Bubble, dans la partie "Shared" > "Shared assets and resources".

Enfin, copier les liens générés pour les deux fichiers `video-recorder.js` et `video-recorder.css` dans la partie "HTML Header" du plugin Bubble.
```html
<script type="module" src="//meta-q.cdn.bubble.io/*ID Bubble*/video-recorder.js"></script>
<link rel="stylesheet" href="//meta-q.cdn.bubble.io/*ID Bubble*/video-recorder.css">
```