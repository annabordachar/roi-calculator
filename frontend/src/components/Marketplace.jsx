import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List, Package, Tag, Clock, ChevronDown } from 'lucide-react'
import axios from 'axios'
import MarketplaceCard from './MarketplaceCard'
import ReservationModal from './ReservationModal'

const API_URL = 'http://localhost:8000'

const EQUIPMENT_TYPES = [
  { id: '', label: 'Tous les types' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'screen', label: 'Screen' },
  { id: 'smartphone', label: 'Smartphone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'switch_router', label: 'Switch/Router' },
]

const CONDITIONS = [
  { id: '', label: 'Tous états' },
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Bon' },
  { id: 'fair', label: 'Correct' },
]

export default function Marketplace({ user, onLoginRequired }) {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showReservationModal, setShowReservationModal] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    type: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchItems()
    fetchStats()
  }, [filters])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.condition) params.append('condition', filters.condition)
      if (filters.minPrice) params.append('min_price', filters.minPrice)
      if (filters.maxPrice) params.append('max_price', filters.maxPrice)
      
      const response = await axios.get(`${API_URL}/api/marketplace?${params}`)
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/marketplace/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleReserve = (item) => {
    if (!user) {
      onLoginRequired()
      return
    }
    setSelectedItem(item)
    setShowReservationModal(true)
  }

  const handleReservationSuccess = () => {
    setShowReservationModal(false)
    setSelectedItem(null)
    fetchItems()
    fetchStats()
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      condition: '',
      minPrice: '',
      maxPrice: ''
    })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="min-h-screen bg-lvmh-cream">
      {/* Hero Section */}
      <section className="bg-lvmh-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-lvmh-gold" />
              <span className="text-lvmh-gold text-sm tracking-widest uppercase">Internal Marketplace</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-medium mb-4">
              Equipment
              <span className="text-lvmh-gold ml-3">Marketplace</span>
            </h1>
            <p className="text-lg text-lvmh-gray-300 max-w-xl">
              Browse and request available IT equipment from our internal inventory.
              Give technology a second life.
            </p>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
            >
              <StatCard label="Available" value={stats.available} />
              <StatCard label="Reserved" value={stats.reserved} />
              <StatCard label="Total Value" value={`€${stats.total_available_value.toLocaleString()}`} />
              <StatCard label="Pending Requests" value={stats.pending_reservations} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Filters & Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-lvmh-gray-600 hover:text-lvmh-black transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm font-medium">Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="bg-lvmh-gold text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-lvmh-black text-white' : 'text-lvmh-gray-400 hover:text-lvmh-black'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-lvmh-black text-white' : 'text-lvmh-gray-400 hover:text-lvmh-black'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-luxury p-6 mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Type */}
                <div>
                  <label className="label-luxury">Type d'équipement</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="select-luxury"
                  >
                    {EQUIPMENT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div>
                  <label className="label-luxury">État</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                    className="select-luxury"
                  >
                    {CONDITIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="label-luxury">Prix min (€)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="0"
                    className="input-luxury"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="label-luxury">Prix max (€)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="5000"
                    className="input-luxury"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-lvmh-gold hover:text-lvmh-goldDark transition-colors"
                >
                  Effacer les filtres
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-lvmh-gold border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-lvmh-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-display text-lvmh-gray-500 mb-2">Aucun équipement trouvé</h3>
            <p className="text-sm text-lvmh-gray-400">Modifiez vos filtres ou revenez plus tard</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            {items.map((item, index) => (
              <MarketplaceCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onReserve={() => handleReserve(item)}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showReservationModal && selectedItem && (
          <ReservationModal
            item={selectedItem}
            user={user}
            onClose={() => {
              setShowReservationModal(false)
              setSelectedItem(null)
            }}
            onSuccess={handleReservationSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-lvmh-charcoal rounded-lg p-4">
      <p className="text-lvmh-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-display font-semibold text-white">{value}</p>
    </div>
  )
}
