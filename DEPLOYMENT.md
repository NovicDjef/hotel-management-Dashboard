# Guide de Déploiement - Hotel Admin Dashboard

Ce document explique comment déployer l'application Hotel Admin Dashboard en utilisant différentes méthodes.

## Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration](#configuration)
3. [CI/CD avec GitHub Actions](#cicd-avec-github-actions)
4. [Déploiement avec Docker](#déploiement-avec-docker)
5. [Déploiement sur Vercel](#déploiement-sur-vercel)
6. [Déploiement sur un serveur VPS](#déploiement-sur-un-serveur-vps)
7. [Déploiement sur AWS](#déploiement-sur-aws)

---

## Prérequis

- Node.js 20+
- npm ou yarn
- Git
- Docker (optionnel)
- Compte GitHub (pour CI/CD)

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.example .env.local
```

Modifiez les valeurs selon votre environnement :

```env
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

### 2. Configuration Next.js

Le fichier `next.config.ts` doit contenir la configuration pour la génération statique :

```typescript
export default {
  output: 'standalone', // Pour Docker
  // ... autres configurations
}
```

---

## CI/CD avec GitHub Actions

Le workflow GitHub Actions est configuré dans `.github/workflows/ci-cd.yml`.

### Étapes du workflow

1. **Lint** : Vérification du code avec ESLint
2. **Build** : Compilation de l'application
3. **Test** : Exécution des tests (optionnel)
4. **Deploy** : Déploiement (optionnel)

### Configuration des secrets GitHub

Allez dans **Settings > Secrets and variables > Actions** de votre repository et ajoutez :

```
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

### Activation du workflow

Le workflow s'exécute automatiquement lors :
- D'un push sur les branches `main` ou `develop`
- D'une pull request vers `main` ou `develop`

---

## Déploiement avec Docker

### Build et démarrage avec Docker Compose

```bash
# Build de l'image
docker-compose build

# Démarrage des conteneurs
docker-compose up -d

# Vérifier les logs
docker-compose logs -f app

# Arrêter les conteneurs
docker-compose down
```

### Build et run manuel

```bash
# Build de l'image
docker build -t hotel-admin-dashboard:latest \
  --build-arg NEXT_PUBLIC_API_URL=https://api.votre-domaine.com .

# Démarrage du conteneur
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.votre-domaine.com \
  --name hotel-admin \
  hotel-admin-dashboard:latest

# Vérifier les logs
docker logs -f hotel-admin
```

### Configuration Nginx (optionnel)

Si vous utilisez Nginx comme reverse proxy, le fichier `nginx.conf` est déjà configuré.

Pour activer SSL, décommentez les sections HTTPS et ajoutez vos certificats dans le dossier `ssl/`.

---

## Déploiement sur Vercel

### Méthode 1 : Via l'interface Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "Import Project"
3. Sélectionnez votre repository GitHub
4. Configurez les variables d'environnement
5. Cliquez sur "Deploy"

### Méthode 2 : Via CLI

```bash
# Installation de Vercel CLI
npm i -g vercel

# Login
vercel login

# Déploiement
vercel

# Déploiement en production
vercel --prod
```

### Configuration des variables d'environnement

Dans les paramètres du projet Vercel, ajoutez :

```
NEXT_PUBLIC_API_URL=https://api.votre-domaine.com
```

---

## Déploiement sur un serveur VPS

### Prérequis

- Serveur Ubuntu/Debian
- Node.js 20+ installé
- Nginx installé
- PM2 installé globalement

### Installation

```bash
# Connexion SSH
ssh user@your-server-ip

# Installation de Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de PM2
sudo npm install -g pm2

# Installation de Nginx
sudo apt install nginx
```

### Déploiement

```bash
# Cloner le repository
cd /var/www
sudo git clone https://github.com/your-username/hotel-admin-dashboard.git
cd hotel-admin-dashboard

# Installation des dépendances
sudo npm ci

# Build de l'application
sudo npm run build

# Démarrage avec PM2
sudo pm2 start npm --name "hotel-admin-dashboard" -- start
sudo pm2 save
sudo pm2 startup
```

### Configuration Nginx

Créez un fichier `/etc/nginx/sites-available/hotel-admin` :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez la configuration :

```bash
sudo ln -s /etc/nginx/sites-available/hotel-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Configuration SSL avec Let's Encrypt

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d votre-domaine.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

### Mise à jour du déploiement

Créez un script `deploy.sh` :

```bash
#!/bin/bash
cd /var/www/hotel-admin-dashboard
git pull origin main
npm ci
npm run build
pm2 restart hotel-admin-dashboard
```

Rendez-le exécutable :

```bash
chmod +x deploy.sh
```

---

## Déploiement sur AWS

### Option 1 : AWS Amplify

1. Connectez-vous à [AWS Amplify](https://aws.amazon.com/amplify/)
2. Cliquez sur "New app" > "Host web app"
3. Connectez votre repository GitHub
4. Configurez les variables d'environnement
5. Déployez

### Option 2 : AWS S3 + CloudFront (Export statique)

```bash
# Modifier next.config.ts pour l'export statique
output: 'export'

# Build de l'application
npm run build

# Upload vers S3
aws s3 sync out/ s3://your-bucket-name --delete

# Invalider le cache CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Option 3 : AWS ECS avec Docker

1. Créez un repository ECR
2. Build et push de l'image :

```bash
# Login à ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ECR_URL

# Build et tag
docker build -t hotel-admin-dashboard .
docker tag hotel-admin-dashboard:latest YOUR_ECR_URL/hotel-admin-dashboard:latest

# Push
docker push YOUR_ECR_URL/hotel-admin-dashboard:latest
```

3. Créez un service ECS avec la tâche pointant vers votre image ECR

---

## Monitoring et Logs

### PM2 Logs (VPS)

```bash
# Voir les logs
pm2 logs hotel-admin-dashboard

# Monitoring
pm2 monit
```

### Docker Logs

```bash
# Logs en temps réel
docker-compose logs -f app

# Dernières 100 lignes
docker-compose logs --tail=100 app
```

### Health Check

L'application expose un endpoint de health check :

```bash
curl http://localhost:3000/api/health
```

---

## Troubleshooting

### Problème : Build échoue

- Vérifiez que Node.js 20+ est installé
- Vérifiez les variables d'environnement
- Lancez `npm ci` pour réinstaller les dépendances

### Problème : Application ne démarre pas

- Vérifiez les logs avec `pm2 logs` ou `docker logs`
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Vérifiez la configuration des variables d'environnement

### Problème : Erreur 502 Bad Gateway

- Vérifiez que l'application est bien démarrée
- Vérifiez la configuration Nginx
- Vérifiez les logs Nginx : `sudo tail -f /var/log/nginx/error.log`

---

## Sécurité

- Toujours utiliser HTTPS en production
- Ne jamais committer les fichiers `.env`
- Utiliser des secrets pour les informations sensibles
- Mettre à jour régulièrement les dépendances
- Configurer un firewall (UFW sur Ubuntu)
- Limiter l'accès SSH avec des clés

---

## Support

Pour toute question, consultez la documentation officielle :
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [Vercel Documentation](https://vercel.com/docs)
