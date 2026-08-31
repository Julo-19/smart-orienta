# La version de Python doit correspondre à celle qui a produit les modèles :
# joblib sérialise des objets Python, dont le format dépend de l'interpréteur
# et des versions de bibliothèques utilisées à l'entraînement.
FROM python:3.8-slim

WORKDIR /app

# Dépendances système nécessaires à scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY artefacts/ ./artefacts/

EXPOSE 8084

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8084"]