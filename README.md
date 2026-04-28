# 🎓 Système Intelligent d'Aide à l'Orientation Académique

> Mémoire de fin d'études — Master en Ingénierie Logicielle 2024-2025

## 📋 Description

Plateforme web intelligente d'aide à l'orientation académique des lycéens 
sénégalais.
Le système combine l'analyse des performances scolaires et des profils 
psychométriques
RIASEC via des modèles de Machine Learning, avec validation humaine par un 
conseiller
d'orientation (principe Human-in-the-Loop).

---

## 🚀 Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14 |
| Backend | Spring Boot 3.x / Java 17 |
| ML Service | FastAPI / Python 3.11 |
| Base de données | MySQL 8.0 |
| Cache | Redis 7.x |
| Message Broker | Apache Kafka |
| Découverte services | Spring Cloud Eureka |
| API Gateway | Spring Cloud Gateway |
| Conteneurisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---
   
## 🏗️ Architecture

 ![alt text](https://file%2B.vscode-resource.vscode-cdn.net/Users/macbook/Documents/architecture_microservices_orientation.svg?version%3D1777339439298)Microservices


---

## 📁 Structure du projet
systeme-orientation-academique/
├── services/
│   ├── auth-service/
│   ├── student-service/
│   ├── orientation-service/
│   ├── ml-service/
│   ├── notification-service/
│   ├── api-gateway/
│   ├── eureka-server/
│   └── config-server/
├── frontend/
├── ml-models/
├── docs/
├── docker-compose.yml
└── README.md

---

## ⚙️ Installation et lancement

### Prérequis
- Java 17+
- Python 3.11+
- Node.js 18+
- Docker + Docker Compose
- MySQL 8.0

### Lancer avec Docker

```bash
# Cloner le repo
git clone https://github.com/Julo-19/systeme-orientation-academique.git
cd systeme-orientation-academique

# Lancer tous les services
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps
```

### Accès aux services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

## 👥 Équipe

### Souleymane Keita BARRO
- Maquettes Figma
- MCD — Modèle Conceptuel de Données
- MLD — Modèle Logique de Données
- Diagramme de classes
- Module XAI
- Auth Service
- Orientation Service
- Tests unitaires JUnit
- Tests E2E Playwright
- SonarQube
- CI/CD GitHub Actions


### Sokhna Ramatoulaye SADIO
- CDC
- Diagrammes UML (use-case)
- Dataset synthétique
- 4 modèles Machine Learning
- Student Service
- ML Service FastAPI
- Interface lycéen Next.js
- Kafka + Notification Service
- Interface conseiller Next.js
- Rédaction mémoire

---

## 📊 Fonctionnalités principales

- ✅ Authentification JWT (lycéen, conseiller, admin)
- ✅ Formulaire multi-étapes (notes + test RIASEC 34 questions)
- ✅ Module contexte personnel lycéen
- ✅ Moteur ML (4 modèles comparés : LR, RF, XGBoost, KNN)
- ✅ Module XAI (explicabilité des recommandations)
- ✅ Validation Human-in-the-Loop par conseiller
- ✅ Machine à états (EN_ATTENTE → VALIDÉE/AJUSTÉE/REJETÉE)
- ✅ Notifications temps réel (Kafka + SSE)
- ✅ Export PDF des recommandations

---

## 📄 Licence

Memoire  — Master Ingénierie Logicielle UN-CHK  2024-2025

