# Configuration du système d'abonnement

Ce guide explique comment configurer les abonnements via App Store et Play Store avec RevenueCat.

## Prérequis

1. Un compte développeur Apple (pour iOS/App Store)
2. Un compte développeur Google Play (pour Android)
3. Un compte RevenueCat (gratuit pour commencer)

## Étapes de configuration

### 1. Créer un compte RevenueCat

1. Allez sur [RevenueCat](https://www.revenuecat.com/)
2. Créez un compte gratuit
3. Créez un nouveau projet pour votre application

### 2. Configurer les produits dans App Store Connect (iOS)

1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com/)
2. Sélectionnez votre application
3. Allez dans **Fonctionnalités** > **Achats intégrés**
4. Créez les produits d'abonnement :
   - **Premium** : `fishspot_premium_monthly` (4.99€/mois)
   - **Pro** : `fishspot_pro_monthly` (9.99€/mois)
5. Configurez les groupes d'abonnements
6. Notez les identifiants de produits

### 3. Configurer les produits dans Google Play Console (Android)

1. Connectez-vous à [Google Play Console](https://play.google.com/console/)
2. Sélectionnez votre application
3. Allez dans **Monétiser** > **Produits** > **Abonnements**
4. Créez les produits d'abonnement :
   - **Premium** : `fishspot_premium_monthly` (4.99€/mois)
   - **Pro** : `fishspot_pro_monthly` (9.99€/mois)
5. Notez les identifiants de produits

### 4. Lier RevenueCat avec les stores

#### App Store (iOS)
1. Dans RevenueCat, allez dans votre projet
2. Cliquez sur **App Store** dans la configuration
3. Téléchargez le fichier .p8 depuis App Store Connect
4. Configurez les identifiants de produits

#### Google Play (Android)
1. Dans RevenueCat, allez dans votre projet
2. Cliquez sur **Google Play** dans la configuration
3. Configurez l'API Google Play (créez une clé de service)
4. Configurez les identifiants de produits

### 5. Créer les Entitlements dans RevenueCat

1. Dans RevenueCat, allez dans **Entitlements**
2. Créez deux entitlements :
   - `premium` : Pour le plan Premium
   - `pro` : Pour le plan Pro
3. Liez chaque produit à son entitlement correspondant

### 6. Créer les Offerings dans RevenueCat

1. Dans RevenueCat, allez dans **Offerings**
2. Créez une offering "default" (par défaut)
3. Ajoutez les packages :
   - Package "premium" : Lié au produit premium
   - Package "pro" : Lié au produit pro

### 7. Récupérer la clé API RevenueCat

1. Dans RevenueCat, allez dans **Project Settings** > **API Keys**
2. Copiez la clé API publique pour votre plateforme (iOS ou Android)
3. Ajoutez-la dans votre fichier `.env` :

```env
VITE_REVENUECAT_API_KEY=votre_cle_api_revenuecat
```

### 8. Tester les abonnements

#### Mode Sandbox (Test)

**iOS:**
1. Créez un compte testeur dans App Store Connect (Users and Access > Sandbox Testers)
2. Sur votre appareil iOS, connectez-vous avec ce compte testeur
3. Testez les achats dans votre app

**Android:**
1. Ajoutez des testeurs dans Google Play Console (Setup > License testing)
2. Installez l'app depuis une release de test (internal/closed)
3. Testez les achats dans votre app

### 9. Déployer en production

1. Soumettez votre app à l'App Store et au Play Store
2. Assurez-vous que les produits d'abonnement sont approuvés
3. Publiez votre app avec les abonnements activés

## Structure de la base de données

La table `subscriptions` stocke les informations d'abonnement :

```sql
- user_id: ID de l'utilisateur
- status: 'active', 'expired', 'trial', 'cancelled'
- plan_type: 'free', 'premium', 'pro'
- platform: 'ios', 'android', 'web'
- subscription_id: ID de l'abonnement dans le store
- expires_at: Date d'expiration
```

## Ressources

- [Documentation RevenueCat](https://docs.revenuecat.com/)
- [Guide App Store Connect](https://developer.apple.com/app-store-connect/)
- [Guide Google Play Console](https://support.google.com/googleplay/android-developer/)
- [RevenueCat Capacitor SDK](https://docs.revenuecat.com/docs/capacitor)

## Support

Pour toute question sur la configuration, consultez :
- La documentation de RevenueCat
- Les forums de développeurs Apple et Google
- Le support de RevenueCat
