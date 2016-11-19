# MorpionBattle

Multiplayer custom morpion battle.

# Pré-requis

- Une base RethinkDB (dernière build) avec une base déjà crée portant le nom : morpionbattle
- Une base Redis (port par default).
- Nginx 1.8.x (configuration présente dans data/nginx.conf)

Configurer et lancer Nginx.
Lancer rethinkDB et crée la base morpionbattle à la main (panneau d'administration sur localhost:8080).
Lancer une base Redis (ne rien toucher)

# Installation

```
npm install
typings install
tsc
npm run database
npm start
```

# Roadmap V1

### 0.2.0
- [x] Inscription
- [x] Authentification flash
- [x] Connexion socket.io
- [x] Améliorer nginput (optionnal input)
- [x] Ajouter au middleware les tables directement (plus propre).
- [x] Amélioration du script database ! (Création / Suppression / Hydratation).
- [x] Mettre à jour le typage du projet.
- [x] Refonte du code des popups en front!
- [ ] Refaire l'objet serversList avec un Objet contenant les IDs.
- [ ] Développer le bouton "Join" (=> En cours)

### 0.3.0
- [ ] Mettre en place la connexion socket ingame!

... A venir.

# Contribution bienvenue (V1)

> Toute contribution doit être proposé par le biais d'une branche !

- [ ] Meilleur inscription/connexion (Faire des vérifications plus abouti, empêcher les multiples connexions).
- [ ] Inscription et connexion avec passport.js (google,facebook,twitter,steam)
- [ ] Un script pour crée un utilisateur (sympa pour les tests!).
- [ ] Création de test unitaire.

# V2

- Recoder le front-end sous RiotJS / ReactJS
- Ajouter des avatars.
- Ajouter un moteur de mode plus flexible et plus complet.
- Ajouter un système de replay.
- Ajouter un système de succès.
- Sécuriser et finaliser l'architecture back-end.

# V3
- Ajouter un système de classement par ELO et par league (pro-mod).
- Ajouter un tchat ingame.

# V4
- Ajout de feature social.
- Evolution du tchat ingame en conséquence.
