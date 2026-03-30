#!/bin/bash

# 🧪 Script de Test - Gestion des Clés API
# Ce script contient des exemples cURL prêts à utiliser pour tester le système de clés API

# ⚙️ Configuration
API_URL="http://localhost:5000"
JWT_TOKEN="votre_jwt_token_ici"  # ← À remplacer par votre JWT authentifié
API_KEY="sk_xxxxx"  # ← À remplacer par la clé API créée

echo "🔑 ========================================="
echo "   Guide de Test des Clés API"
echo "=========================================="

# ============================================
# 1️⃣ CRÉER UNE CLÉ API
# ============================================
echo -e "\n\n📝 1. CRÉER UNE CLÉ API"
echo "────────────────────────────"

echo -e "\n Exécutez cette commande pour créer une clé API:"
cat <<'EOF'

curl -X POST http://localhost:5000/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend App",
    "serviceName": "frontend",
    "scopes": ["read:posts", "write:posts"],
    "rateLimit": 5000,
    "expiresAt": "2025-12-31T23:59:59Z"
  }'

EOF

# ============================================
# 2️⃣ LISTER LES CLÉS API
# ============================================
echo -e "\n\n📋 2. LISTER VOS CLÉS API"
echo "────────────────────────────"

echo -e "\n Exécutez cette commande pour lister vos clés:"
cat <<'EOF'

curl -X GET http://localhost:5000/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

EOF

# ============================================
# 3️⃣ OBTENIR LES DÉTAILS D'UNE CLÉ
# ============================================
echo -e "\n\n🔍 3. OBTENIR LES DÉTAILS D'UNE CLÉ"
echo "────────────────────────────────────"

echo -e "\n Exécutez cette commande pour voir les détails:"
cat <<'EOF'

curl -X GET http://localhost:5000/api/api-keys/API_KEY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

EOF

# ============================================
# 4️⃣ METTRE À JOUR UNE CLÉ
# ============================================
echo -e "\n\n✏️ 4. METTRE À JOUR UNE CLÉ"
echo "────────────────────────────"

echo -e "\n Exécutez cette commande pour mettre à jour:"
cat <<'EOF'

curl -X PUT http://localhost:5000/api/api-keys/API_KEY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend App v2",
    "scopes": ["read:posts", "write:posts", "read:profiles"],
    "rateLimit": 10000
  }'

EOF

# ============================================
# 5️⃣ DÉSACTIVER/RÉACTIVER UNE CLÉ
# ============================================
echo -e "\n\n⏸️ 5. DÉSACTIVER/RÉACTIVER UNE CLÉ"
echo "──────────────────────────────────"

echo -e "\n Exécutez cette commande pour basculer le statut:"
cat <<'EOF'

curl -X PATCH http://localhost:5000/api/api-keys/API_KEY_ID/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

EOF

# ============================================
# 6️⃣ RÉGÉNÉRER UNE CLÉ
# ============================================
echo -e "\n\n🔄 6. RÉGÉNÉRER UNE CLÉ"
echo "─────────────────────────"

echo -e "\n Exécutez cette commande pour créer une nouvelle clé:"
cat <<'EOF'

curl -X POST http://localhost:5000/api/api-keys/API_KEY_ID/regenerate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

EOF

# ============================================
# 7️⃣ SUPPRIMER UNE CLÉ
# ============================================
echo -e "\n\n🗑️ 7. SUPPRIMER UNE CLÉ"
echo "──────────────────────────"

echo -e "\n Exécutez cette commande pour supprimer:"
cat <<'EOF'

curl -X DELETE http://localhost:5000/api/api-keys/API_KEY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

EOF

# ============================================
# 8️⃣ UTILISER LA CLÉ API -> ENDPOINT PUBLIC
# ============================================
echo -e "\n\n🔓 8. UTILISER LA CLÉ API - ENDPOINT PUBLIC"
echo "────────────────────────────────────────────"

echo -e "\n Exécutez cette commande pour accéder à un endpoint avec votre clé:"
cat <<'EOF'

curl -X GET "http://localhost:5000/post/search?query=javascript" \
  -H "Authorization: Bearer sk_votre_clé_ici"

EOF

# ============================================
# 9️⃣ UTILISER LA CLÉ API -> ENDPOINT SÉCURISÉ
# ============================================
echo -e "\n\n🔒 9. UTILISER LA CLÉ API - ENDPOINT SÉCURISÉ"
echo "──────────────────────────────────────────────"

echo -e "\n Exécutez cette commande pour accéder à un endpoint protégé:"
cat <<'EOF'

curl -X GET "http://localhost:5000/post/get-all-posts" \
  -H "Authorization: Bearer sk_votre_clé_ici"

EOF

# ============================================
# 🔟 CRÉER UN POST AVEC LA CLÉ API
# ============================================
echo -e "\n\n📝 10. CRÉER UN POST AVEC LA CLÉ API"
echo "──────────────────────────────────────"

echo -e "\n Exécutez cette commande pour créer un post:"
cat <<'EOF'

curl -X POST "http://localhost:5000/post/save-post" \
  -H "Authorization: Bearer sk_votre_clé_ici" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "Nous cherchons un développeur senior",
    "salary": 50000,
    "location": "Paris",
    "jobType": "CDI"
  }'

EOF

# ============================================
# VARIANTES D'AUTHENTIFICATION
# ============================================
echo -e "\n\n🔐 VARIANTES D'AUTHENTIFICATION"
echo "═════════════════════════════════"

echo -e "\n\n Option A: Authorization Header (⭐ Recommandé)"
cat <<'EOF'

curl -X GET "http://localhost:5000/post/search" \
  -H "Authorization: Bearer sk_xxx"

EOF

echo -e "\n\n Option B: Header Personnalisé X-API-Key"
cat <<'EOF'

curl -X GET "http://localhost:5000/post/search" \
  -H "X-API-Key: sk_xxx"

EOF

echo -e "\n\n Option C: Query Parameter"
cat <<'EOF'

curl -X GET "http://localhost:5000/post/search?apiKey=sk_xxx"

EOF

# ============================================
# GESTION DES ERREURS
# ============================================
echo -e "\n\n❌ GESTION DES ERREURS"
echo "═════════════════════════"

echo -e "\n\n 1. API key manquante (401):"
echo "    → Vérifiez le header Authorization ou X-API-Key"

echo -e "\n 2. Clé API invalide (401):"
echo "    → Vérifiez que vous utilisez la bonne clé"

echo -e "\n 3. Clé API désactivée (401):"
echo "    → Réactivez la clé avec l'endpoint /toggle"

echo -e "\n 4. IP non autorisée (403):"
echo "    → Mettez à jour la whitelist IP"

echo -e "\n 5. Permissions insuffisantes (403):"
echo "    → Vérifiez les scopes assignés à la clé"

# ============================================
# SCRIPT PowerShell ÉQUIVALENT
# ============================================
echo -e "\n\n💻 POUR POWERSHELL (Windows)"
echo "═════════════════════════════════"
cat <<'EOF'

# Créer une clé (PowerShell)
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Frontend App"
    serviceName = "frontend"
    scopes = @("read:posts", "write:posts")
    rateLimit = 5000
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/api-keys" `
    -Method POST `
    -Headers $headers `
    -Body $body

# Lister les clés (PowerShell)
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/api-keys" `
    -Method GET `
    -Headers $headers

# Utiliser une clé API (PowerShell)
$headers = @{
    "Authorization" = "Bearer sk_xxx"
}

Invoke-RestMethod -Uri "http://localhost:5000/post/search" `
    -Method GET `
    -Headers $headers

EOF

echo -e "\n\n✅ Fin du guide de test"
echo "═════════════════════════════════"
