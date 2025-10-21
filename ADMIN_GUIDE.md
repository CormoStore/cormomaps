# Guide Administrateur - FishSpot

## 🎯 Système d'administration

Votre application dispose maintenant d'un système complet d'administration qui permet de gérer les spots de pêche avec des permissions avancées.

## ✅ Fonctionnalités

### Utilisateurs normaux peuvent :
- ✅ Voir tous les spots de pêche approuvés
- ✅ Créer de nouveaux spots (en attente de validation)
- ✅ Voir leurs propres spots en attente
- ✅ Modifier leurs propres spots en attente
- ✅ Supprimer leurs propres spots

### Administrateurs peuvent :
- ✅ Tout ce que les utilisateurs normaux peuvent faire
- ✅ **Voir tous les spots** (en attente, approuvés, rejetés)
- ✅ **Approuver ou rejeter les nouveaux spots**
- ✅ **Supprimer n'importe quel spot**
- ✅ Badge "🛡️ Administrateur" visible dans le profil
- ✅ Accès à l'onglet "Admin" pour la modération

## 🔑 Comment créer un compte administrateur

### Étape 1 : Créer un compte utilisateur
1. Ouvrez l'application
2. Cliquez sur "S'inscrire"
3. Créez votre compte avec email et mot de passe

### Étape 2 : Promouvoir l'utilisateur en admin
1. Ouvrez votre backend Lovable Cloud
2. Allez dans l'onglet "SQL Editor" ou "Tables"
3. Récupérez l'ID de l'utilisateur depuis la table `profiles` (copiez le UUID)
4. Exécutez cette requête SQL :

```sql
-- Remplacez 'VOTRE_USER_ID' par l'UUID de l'utilisateur
INSERT INTO user_roles (user_id, role)
VALUES ('VOTRE_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

**Exemple concret :**
```sql
-- Si votre user_id est: a1b2c3d4-e5f6-7890-abcd-ef1234567890
INSERT INTO user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Étape 3 : Vérifier
1. Rafraîchissez l'application
2. Allez dans l'onglet "Profil"
3. Vous devriez voir un badge "🛡️ Administrateur"
4. Un nouvel onglet "Admin" apparaîtra dans la barre de navigation
5. Vous pourrez approuver/rejeter les spots en attente

## 🎯 Système de modération

### Flux de validation des spots :
1. **Création** : Un utilisateur crée un spot → Statut "En attente"
2. **Modération** : Un admin voit le spot dans l'onglet "Admin"
3. **Validation** : L'admin approuve ou rejette le spot
4. **Publication** : Si approuvé, le spot devient visible sur la carte pour tous

### Statuts des spots :
- **🟡 pending** (En attente) : Nouveau spot non encore modéré
- **🟢 approved** (Approuvé) : Spot validé et visible sur la carte
- **🔴 rejected** (Rejeté) : Spot refusé par un administrateur

### Interface de modération :
L'onglet "Admin" contient 3 sous-onglets :
- **En attente** : Liste des spots à modérer (avec compteur de notifications)
- **Approuvés** : Historique des spots validés
- **Rejetés** : Historique des spots refusés

Pour chaque spot en attente, l'admin peut :
- ✅ **Approuver** : Rend le spot visible sur la carte
- ❌ **Rejeter** : Marque le spot comme refusé
- 🗑️ **Supprimer** : Supprime définitivement le spot

## 🗄️ Structure de la base de données

### Tables principales :
- **profiles** : Informations des utilisateurs
- **user_roles** : Attribution des rôles (admin/user)
- **fishing_spots** : Tous les spots de pêche (avec statut de modération)

### Rôles disponibles :
- `user` : Rôle par défaut (attribué automatiquement à l'inscription)
- `admin` : Rôle avec permissions étendues

## 🔐 Sécurité

Le système utilise **Row Level Security (RLS)** de Supabase pour garantir que :
- Les utilisateurs voient uniquement les spots approuvés (sauf leurs propres spots)
- Les utilisateurs ne peuvent modifier que leurs propres spots en attente
- Seuls les admins peuvent approuver/rejeter des spots
- Seuls les admins peuvent supprimer n'importe quel spot
- Toutes les vérifications sont faites côté serveur (impossible de contourner)

## 📊 Requêtes utiles

### Voir tous les administrateurs :
```sql
SELECT p.email, ur.role, ur.created_at
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin';
```

### Voir tous les spots avec leur créateur et statut :
```sql
SELECT 
  fs.name AS spot_name,
  fs.status,
  fs.latitude,
  fs.longitude,
  p.email AS created_by_email,
  fs.created_at
FROM fishing_spots fs
LEFT JOIN profiles p ON fs.created_by = p.id
ORDER BY fs.created_at DESC;
```

### Voir les spots en attente de modération :
```sql
SELECT 
  fs.name,
  p.email AS created_by,
  fs.created_at
FROM fishing_spots fs
LEFT JOIN profiles p ON fs.created_by = p.id
WHERE fs.status = 'pending'
ORDER BY fs.created_at ASC;
```

### Approuver manuellement un spot :
```sql
UPDATE fishing_spots
SET status = 'approved'
WHERE id = 'SPOT_ID';
```

### Retirer le rôle admin d'un utilisateur :
```sql
DELETE FROM user_roles
WHERE user_id = 'VOTRE_USER_ID' AND role = 'admin';
```

## 🎨 Interface utilisateur

Les administrateurs bénéficient de :
- Badge doré "🛡️ Administrateur" dans leur profil
- Onglet "Admin" dans la barre de navigation (icône bouclier)
- Panneau de modération avec 3 onglets (En attente / Approuvés / Rejetés)
- Badge de notification sur l'onglet "En attente" indiquant le nombre de spots à modérer
- Boutons d'action sur chaque spot (Approuver / Rejeter / Supprimer)

Les utilisateurs normaux :
- Voient uniquement les spots approuvés sur la carte
- Reçoivent une notification quand ils créent un spot : "Votre spot est en attente de validation"
- Peuvent voir leurs propres spots en attente dans la liste
- N'ont pas accès à l'onglet "Admin"

## 🚀 Prochaines étapes possibles

Vous pouvez étendre le système avec :
- Notifications par email aux utilisateurs quand leur spot est approuvé/rejeté
- Commentaires de modération (raison du rejet)
- Statistiques de modération (nombre de spots approuvés/rejetés)
- Historique des actions de modération
- Export de données des spots
- Système de signalement par les utilisateurs
