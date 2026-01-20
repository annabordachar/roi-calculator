# Système de Scraping Automatique

Ce système permet de récupérer automatiquement les produits disponibles depuis les sites des vendeurs (Dell, HP, etc.).

## Installation

Les dépendances nécessaires sont déjà dans `requirements.txt`. Installez-les avec :

```bash
pip install -r requirements.txt
```

## Architecture

### Structure des modules

- `scrapers/base_scraper.py` : Classe de base pour tous les scrapers
- `scrapers/dell_scraper.py` : Scraper spécifique pour Dell
- `scrapers/hp_scraper.py` : Scraper spécifique pour HP
- `scraper_service.py` : Service de gestion du scraping et du scheduler

### Fonctionnalités

1. **Scraping manuel** : Déclencher le scraping via l'API
2. **Scraping automatique** : Scheduler qui exécute le scraping à intervalles réguliers
3. **Sauvegarde CSV** : Les produits scrapés sont sauvegardés dans des fichiers CSV
4. **Intégration** : Le catalogue Dell est automatiquement rechargé après le scraping

## Utilisation

### Via l'API REST

#### 1. Scraper un vendeur spécifique

```bash
POST /api/scraper/scrape/{vendor}?product_type=laptop
```

Exemple :
```bash
curl -X POST "http://localhost:8000/api/scraper/scrape/dell?product_type=laptop"
```

#### 2. Scraper tous les vendeurs

```bash
POST /api/scraper/scrape-all?product_type=laptop
```

#### 3. Démarrer le scheduler automatique

```bash
POST /api/scraper/scheduler/start?hours=24
```

Le scheduler exécutera le scraping toutes les 24 heures (par défaut).

#### 4. Arrêter le scheduler

```bash
POST /api/scraper/scheduler/stop
```

#### 5. Vérifier le statut du scheduler

```bash
GET /api/scraper/scheduler/status
```

#### 6. Recharger le catalogue manuellement

```bash
POST /api/scraper/reload-catalog
```

#### 7. Liste des vendeurs supportés

```bash
GET /api/scraper/vendors
```

### Fichiers générés

Les produits scrapés sont sauvegardés dans le dossier `backend/data/` :

- `dell_catalog.csv` : Catalogue principal Dell (mis à jour à chaque scraping)
- `hp_catalog.csv` : Catalogue principal HP (mis à jour à chaque scraping)
- `dell_laptop_YYYYMMDD_HHMMSS.csv` : Copies horodatées des scrapings

## Ajouter un nouveau vendeur

Pour ajouter un nouveau vendeur :

1. Créer un nouveau fichier dans `scrapers/` (ex: `lenovo_scraper.py`)
2. Hériter de `BaseScraper`
3. Implémenter les méthodes `scrape_products()` et `get_product_details()`
4. Ajouter le scraper dans `scraper_service.py` :

```python
from scrapers import LenovoScraper

self.scrapers = {
    "dell": DellScraper(),
    "hp": HPScraper(),
    "lenovo": LenovoScraper()  # Nouveau
}
```

## Notes importantes

- **Respect des sites web** : Le scraper inclut des délais entre les requêtes pour éviter de surcharger les serveurs
- **User-Agent** : Un User-Agent de navigateur est utilisé pour éviter les blocages
- **Gestion d'erreurs** : Les erreurs sont loggées et n'interrompent pas le processus
- **Déduplication** : Les produits en double sont automatiquement supprimés lors du chargement

## Limitations actuelles

- Les scrapers utilisent BeautifulSoup et peuvent nécessiter des ajustements si les sites changent leur structure HTML
- Pour les sites avec beaucoup de JavaScript, Selenium peut être nécessaire (déjà inclus dans les dépendances)
- Le scraping est limité à 50 produits par exécution pour éviter les timeouts

## Dépannage

Si le scraping ne fonctionne pas :

1. Vérifiez les logs du serveur
2. Testez manuellement avec `curl` ou Postman
3. Vérifiez que les sites web sont accessibles
4. Les sélecteurs CSS peuvent nécessiter des mises à jour si les sites changent
