# Jeu de Clic Rapide - Symfony Docker

Un jeu de clic rapide développé avec Symfony 8, où les joueurs doivent cliquer le plus rapidement possible en 10 secondes. Le projet inclut un système de leaderboard en temps réel et une architecture moderne basée sur Docker.

![CI](https://github.com/dunglas/symfony-docker/workflows/CI/badge.svg)

## 🎮 À propos du projet

Ce projet est un jeu web interactif où les joueurs tentent d'obtenir le meilleur score en cliquant le plus rapidement possible dans un délai de 10 secondes. Les scores sont sauvegardés et un leaderboard affiche les meilleurs joueurs en temps réel.

### Fonctionnalités principales

- ⚡ Jeu de clic rapide avec timer de 10 secondes
- 🏆 Système de leaderboard en temps réel
- 💾 Sauvegarde des scores en base de données PostgreSQL
- 🚀 Leaderboard haute performance avec Redis
- 🎨 Interface utilisateur moderne et réactive
- 📊 Historique complet des scores

## 🛠️ Technologies utilisées

### Backend

- **[Symfony 8.0](https://symfony.com/)** - Framework PHP moderne et performant
  - Symfony Framework Bundle pour la structure de l'application
  - Symfony Routing pour les routes
  - Symfony Validator pour la validation des données
  - Symfony HTTP Foundation pour la gestion des requêtes/réponses
- **[PHP 8.4+](https://www.php.net/)** - Langage de programmation backend
- **[Doctrine ORM 3.6](https://www.doctrine-project.org/)** - ORM pour la gestion de la base de données
  - Entités Doctrine (Score)
  - Repositories pour l'accès aux données
  - Doctrine Migrations pour les migrations de schéma
- **[PostgreSQL 16](https://www.postgresql.org/)** - Base de données relationnelle pour le stockage persistant des scores
- **[Redis 7](https://redis.io/)** - Base de données en mémoire pour le leaderboard haute performance (Sorted Sets)

### Frontend

- **[Stimulus 3.2](https://stimulus.hotwired.dev/)** - Framework JavaScript modeste pour les contrôleurs
  - Contrôleur `click-game` pour la logique interactive du jeu
  - Contrôleur `csrf-protection` pour la protection CSRF
- **[Turbo 7.3](https://turbo.hotwired.dev/)** - Framework pour les applications web rapides (utilisé pour la protection CSRF)
- **[Twig 3.x](https://twig.symfony.com/)** - Moteur de template pour PHP
- **[Asset Mapper](https://symfony.com/doc/current/frontend/asset_mapper.html)** - Gestionnaire d'assets moderne de Symfony (sans Webpack/Vite)

### Infrastructure & DevOps

- **[Docker](https://www.docker.com/)** - Conteneurisation de l'application
- **[Docker Compose](https://docs.docker.com/compose/)** - Orchestration des services (PHP, PostgreSQL, Redis)
- **[FrankenPHP](https://frankenphp.dev/)** - Serveur PHP moderne avec worker mode pour des performances optimales
- **[Caddy](https://caddyserver.com/)** - Serveur web moderne avec HTTPS automatique
  - Support HTTP/3 et Early Hints
  - Certificats TLS automatiques

## 🚀 Démarrage rapide

### Prérequis

- [Docker Compose](https://docs.docker.com/compose/install/) (v2.10+)

### Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/dpeix/clicker_symfony.git
```

2. Construisez les images Docker :
```bash
docker compose build --pull --no-cache
```

3. Démarrez les services :
```bash
docker compose up --wait
```

4. Ouvrez votre navigateur à `https://localhost` et acceptez le certificat TLS auto-généré

5. Pour arrêter les services :
```bash
docker compose down --remove-orphans
```

## 📋 Architecture du projet

```
symfony-docker/
├── assets/              # Assets frontend (JavaScript, CSS)
│   ├── controllers/     # Contrôleurs Stimulus
│   ├── services/        # Services JavaScript
│   └── strategies/      # Stratégies de comptage
├── config/              # Configuration Symfony
├── migrations/          # Migrations Doctrine
├── public/              # Point d'entrée public
├── src/
│   ├── Controller/      # Contrôleurs Symfony
│   ├── Entity/          # Entités Doctrine (Score)
│   ├── Repository/      # Repositories Doctrine
│   └── Service/         # Services métier (LeaderboardService)
└── templates/           # Templates Twig
```

## 🎯 Fonctionnalités techniques

### Système de leaderboard hybride

Le projet utilise une approche hybride pour le leaderboard :
- **PostgreSQL** : Stockage persistant de tous les scores pour l'historique
- **Redis** : Sorted Sets pour un leaderboard haute performance en temps réel

## 📚 Documentation

1. [Options disponibles](docs/options.md)
2. [Utilisation avec un projet existant](docs/existing-project.md)
3. [Services supplémentaires](docs/extra-services.md)
4. [Déploiement en production](docs/production.md)
5. [Débogage avec Xdebug](docs/xdebug.md)
6. [Certificats TLS](docs/tls.md)
7. [Utilisation de MySQL au lieu de PostgreSQL](docs/mysql.md)
8. [Utilisation d'Alpine Linux au lieu de Debian](docs/alpine.md)
9. [Utilisation d'un Makefile](docs/makefile.md)
10. [Mise à jour du template](docs/updating.md)
11. [Dépannage](docs/troubleshooting.md)


## 📝 Licence

Ce projet est disponible sous la licence MIT.

## 🙏 Crédits

Basé sur [Symfony Docker](https://github.com/dunglas/symfony-docker) créé par [Kévin Dunglas](https://dunglas.dev), co-maintenu par [Maxime Helias](https://twitter.com/maxhelias) et sponsorisé par [Les-Tilleuls.coop](https://les-tilleuls.coop).

---

**Profitez du jeu !** 🎮
