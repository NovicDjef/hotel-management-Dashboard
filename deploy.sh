#!/bin/bash

# Script de déploiement rapide pour Hotel Admin Dashboard
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, production

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Déploiement de Hotel Admin Dashboard en mode: $ENVIRONMENT"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
log_info "Branche actuelle: $CURRENT_BRANCH"

if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    log_error "Vous devez être sur la branche 'main' pour déployer en production"
    exit 1
fi

# Vérifier les changements non commités
if [ -n "$(git status --porcelain)" ]; then
    log_warning "Vous avez des changements non commités"
    read -p "Voulez-vous continuer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull des dernières modifications
log_info "Récupération des dernières modifications..."
git pull origin $CURRENT_BRANCH

# Installation des dépendances
log_info "Installation des dépendances..."
npm ci

# Lint du code
log_info "Vérification du code avec ESLint..."
npm run lint || log_warning "ESLint a trouvé des problèmes"

# Build de l'application
log_info "Build de l'application..."
npm run build

# Vérifier si PM2 est installé
if command -v pm2 &> /dev/null; then
    log_info "Redémarrage de l'application avec PM2..."
    pm2 restart hotel-admin-dashboard || pm2 start npm --name "hotel-admin-dashboard" -- start
    pm2 save
    log_info "Application redémarrée avec succès!"
else
    log_warning "PM2 n'est pas installé. Démarrage manuel requis."
    log_info "Pour installer PM2: npm install -g pm2"
fi

# Afficher le statut
if command -v pm2 &> /dev/null; then
    pm2 status hotel-admin-dashboard
fi

echo ""
log_info "✅ Déploiement terminé avec succès!"
log_info "📊 Vérifiez l'application sur: http://localhost:3000"
echo ""

# Optional: Notification Slack/Discord
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Hotel Admin Dashboard deployed successfully!"}' \
#   YOUR_WEBHOOK_URL
