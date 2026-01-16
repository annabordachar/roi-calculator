import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  Play, 
  Square, 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  Loader,
  Download,
  Server,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:8000'

export default function ScraperDashboard() {
  const [vendors, setVendors] = useState([])
  const [schedulerStatus, setSchedulerStatus] = useState(null)
  const [scrapingResults, setScrapingResults] = useState({})
  const [isScraping, setIsScraping] = useState(false)
  const [scrapedProducts, setScrapedProducts] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('dell')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadVendors()
    loadSchedulerStatus()
    loadScrapedProducts()
  }, [])

  const loadVendors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/scraper/vendors`)
      setVendors(response.data.vendors || [])
    } catch (error) {
      console.error('Error loading vendors:', error)
    }
  }

  const loadSchedulerStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/scraper/scheduler/status`)
      setSchedulerStatus(response.data)
    } catch (error) {
      console.error('Error loading scheduler status:', error)
    }
  }

  const loadScrapedProducts = async () => {
    try {
      // Load Dell products from the catalog
      const response = await axios.get(`${API_BASE}/api/dell/laptops`)
      if (response.data.laptops) {
        setScrapedProducts(response.data.laptops)
      }
    } catch (error) {
      console.error('Error loading scraped products:', error)
    }
  }

  const handleScrape = async (vendor) => {
    setIsScraping(true)
    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE}/api/scraper/scrape/${vendor}?product_type=laptop`
      )
      setScrapingResults(prev => ({
        ...prev,
        [vendor]: response.data
      }))
      
      // Reload products after scraping
      if (vendor === 'dell') {
        setTimeout(() => {
          loadScrapedProducts()
        }, 1000)
      }
    } catch (error) {
      console.error('Error scraping:', error)
      setScrapingResults(prev => ({
        ...prev,
        [vendor]: {
          success: false,
          error: error.response?.data?.detail || error.message
        }
      }))
    } finally {
      setIsScraping(false)
      setLoading(false)
    }
  }

  const handleScrapeAll = async () => {
    setIsScraping(true)
    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE}/api/scraper/scrape-all?product_type=laptop`
      )
      setScrapingResults(prev => ({
        ...prev,
        all: response.data
      }))
      
      // Reload products after scraping
      setTimeout(() => {
        loadScrapedProducts()
      }, 2000)
    } catch (error) {
      console.error('Error scraping all:', error)
      setScrapingResults(prev => ({
        ...prev,
        all: {
          success: false,
          error: error.response?.data?.detail || error.message
        }
      }))
    } finally {
      setIsScraping(false)
      setLoading(false)
    }
  }

  const handleStartScheduler = async (hours = 24) => {
    try {
      await axios.post(`${API_BASE}/api/scraper/scheduler/start?hours=${hours}`)
      loadSchedulerStatus()
    } catch (error) {
      console.error('Error starting scheduler:', error)
      alert('Erreur lors du démarrage du scheduler: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleStopScheduler = async () => {
    try {
      await axios.post(`${API_BASE}/api/scraper/scheduler/stop`)
      loadSchedulerStatus()
    } catch (error) {
      console.error('Error stopping scheduler:', error)
      alert('Erreur lors de l\'arrêt du scheduler: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleReloadCatalog = async () => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/api/scraper/reload-catalog`)
      loadScrapedProducts()
      alert('Catalogue rechargé avec succès!')
    } catch (error) {
      console.error('Error reloading catalog:', error)
      alert('Erreur lors du rechargement: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Server className="w-8 h-8 text-lvmh-gold" />
            <h1 className="text-4xl font-display text-lvmh-black">
              Scraper Dashboard
            </h1>
          </div>
          <p className="text-lvmh-gray-600">
            Gérez le scraping automatique des produits depuis les sites des vendeurs
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Scheduler Status Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-lvmh-black">Scheduler</h3>
              {schedulerStatus?.running ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Actif</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Inactif</span>
                </div>
              )}
            </div>
            
            {schedulerStatus?.running && schedulerStatus.jobs?.[0]?.next_run && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-lvmh-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Prochaine exécution:</span>
                </div>
                <p className="text-sm font-medium">
                  {new Date(schedulerStatus.jobs[0].next_run).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              {schedulerStatus?.running ? (
                <button
                  onClick={handleStopScheduler}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <Square className="w-4 h-4" />
                  <span>Arrêter</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStartScheduler(24)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-lvmh-gold text-white rounded hover:bg-lvmh-goldDark transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Démarrer (24h)</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Manual Scrape Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-lvmh-black mb-4">Scraping Manuel</h3>
            
            <div className="space-y-3">
              {vendors.map(vendor => (
                <button
                  key={vendor}
                  onClick={() => handleScrape(vendor)}
                  disabled={isScraping}
                  className="w-full flex items-center justify-between px-4 py-2 bg-lvmh-black text-white rounded hover:bg-lvmh-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="capitalize">{vendor}</span>
                  {isScraping && scrapingResults[vendor]?.success === undefined ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : scrapingResults[vendor]?.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : scrapingResults[vendor]?.success === false ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              ))}
              
              <button
                onClick={handleScrapeAll}
                disabled={isScraping}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-lvmh-gold text-white rounded hover:bg-lvmh-goldDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Scraper Tous</span>
              </button>
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-lvmh-black mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleReloadCatalog}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Recharger Catalogue</span>
              </button>
              
              <button
                onClick={loadScrapedProducts}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser Produits</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scraping Results */}
        {Object.keys(scrapingResults).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-lvmh-black mb-4">Résultats du Scraping</h3>
            <div className="space-y-4">
              {Object.entries(scrapingResults).map(([vendor, result]) => (
                <div
                  key={vendor}
                  className={`p-4 rounded border-l-4 ${
                    result.success
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold capitalize">{vendor}</span>
                    </div>
                    {result.success && (
                      <span className="text-sm text-gray-600">
                        {result.products_count} produits
                      </span>
                    )}
                  </div>
                  {result.success ? (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Durée: {result.duration_seconds?.toFixed(2)}s</p>
                      <p>Fichier: {result.csv_path}</p>
                      {result.catalog_reloaded && (
                        <p className="text-green-600 font-medium">
                          Catalogue rechargé ({result.catalog_count} produits)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-red-600">{result.error}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scraped Products Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display text-lvmh-black mb-2">
                Produits Scrapés
              </h3>
              <p className="text-lvmh-gray-600">
                {scrapedProducts.length} produits disponibles
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-lvmh-gold" />
            </div>
          </div>

          {scrapedProducts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun produit scrapé pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">
                Lancez un scraping pour commencer
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-lvmh-black text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Modèle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Écran</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Prix</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Note</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scrapedProducts.slice(0, 50).map((product, index) => (
                    <tr key={product.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.model || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.screen_size || '-'}</td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {product.price ? `${product.price.toFixed(2)} €` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.rating ? (
                          <div className="flex items-center space-x-1">
                            <span>{product.rating}</span>
                            {product.reviews_count && (
                              <span className="text-gray-500">
                                ({product.reviews_count} avis)
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {product.link && (
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lvmh-gold hover:underline"
                          >
                            Voir
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {scrapedProducts.length > 50 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Affichage de 50 produits sur {scrapedProducts.length}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
