# Guide Administrateur - FishSpot

## 🎯 Système d'administration

Votre application dispose maintenant d'un système complet d'administration qui permet de gérer les spots de pêche avec des permissions avancées.

## ✅ Fonctionnalités

### Utilisateurs normaux peuvent :
- ✅ Voir tous les spots de pêche
- ✅ Créer de nouveaux spots
- ✅ Modifier leurs propres spots
- ✅ Supprimer leurs propres spots

### Administrateurs peuvent :
- ✅ Tout ce que les utilisateurs normaux peuvent faire
- ✅ **Supprimer n'importe quel spot** (y compris ceux créés par d'autres utilisateurs)
- ✅ Badge "Administrateur" visible dans le profil

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
4. Les boutons de suppression apparaîtront sur tous les spots

## 🗄️ Structure de la base de données

### Tables principales :
- **profiles** : Informations des utilisateurs
- **user_roles** : Attribution des rôles (admin/user)
- **fishing_spots** : Tous les spots de pêche

### Rôles disponibles :
- `user` : Rôle par défaut (attribué automatiquement à l'inscription)
- `admin` : Rôle avec permissions étendues

## 🔐 Sécurité

Le système utilise **Row Level Security (RLS)** de Supabase pour garantir que :
- Les utilisateurs ne peuvent modifier que leurs propres spots
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

### Voir tous les spots avec leur créateur :
```sql
SELECT 
  fs.name AS spot_name,
  fs.latitude,
  fs.longitude,
  p.email AS created_by_email,
  fs.created_at
FROM fishing_spots fs
LEFT JOIN profiles p ON fs.created_by = p.id
ORDER BY fs.created_at DESC;
```

### Retirer le rôle admin d'un utilisateur :
```sql
DELETE FROM user_roles
WHERE user_id = 'VOTRE_USER_ID' AND role = 'admin';
```

## 🎨 Interface utilisateur

Les administrateurs bénéficient de :
- Badge doré "🛡️ Administrateur" dans leur profil
- Bouton de suppression (🗑️) visible sur tous les spots
- Les utilisateurs normaux voient uniquement le bouton de suppression sur leurs propres spots

## 🚀 Prochaines étapes possibles

Vous pouvez étendre le système avec :
- Un panneau d'administration dédié
- Des statistiques sur les spots
- Modération des contenus
- Gestion des signalements
- Export de données
