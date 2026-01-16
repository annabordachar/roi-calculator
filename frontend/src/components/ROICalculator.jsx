import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, Star, Tag, Leaf } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

export default function ROICalculator({ onResults, isLoading, setIsLoading }) {
  const [equipment, setEquipment] = useState([])
  const [dellLaptops, setDellLaptops] = useState([])
  const [catalogItems, setCatalogItems] = useState([])
  const [showDellSelector, setShowDellSelector] = useState(false)
  const [showCatalogSelector, setShowCatalogSelector] = useState(false)
  const [formData, setFormData] = useState({
    equipment_type: '',
    quantity: 1,
    duration_months: 60,
    alpha: 0.5,
    beta: 0.5,
    dell_model_id: null,
    dell_partnership: false,
    catalog_item_id: null
  })

  // Fetch equipment list on mount
  useEffect(() => {
    fetchEquipment()
    fetchDellLaptops()
  }, [])

  // Show/hide selectors based on equipment type
  useEffect(() => {
    if (formData.equipment_type === 'laptop') {
      setShowDellSelector(true)
      setShowCatalogSelector(false)
      setCatalogItems([])
      setFormData(prev => ({ ...prev, catalog_item_id: null }))
    } else if (formData.equipment_type) {
      setShowDellSelector(false)
      setShowCatalogSelector(true)
      setFormData(prev => ({ ...prev, dell_model_id: null, dell_partnership: false }))
      fetchCatalogItems(formData.equipment_type)
    } else {
      setShowDellSelector(false)
      setShowCatalogSelector(false)
    }
  }, [formData.equipment_type])

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/equipment`)
      setEquipment(response.data.equipment)
      if (response.data.equipment.length > 0) {
        setFormData(prev => ({ ...prev, equipment_type: response.data.equipment[0].id }))
      }
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const fetchDellLaptops = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dell/laptops`)
      setDellLaptops(response.data.laptops)
    } catch (error) {
      console.error('Error fetching Dell laptops:', error)
    }
  }

  const fetchCatalogItems = async (equipmentType) => {
    try {
      const response = await axios.get(`${API_URL}/api/catalog/${equipmentType}`)
      setCatalogItems(response.data.items || [])
    } catch (error) {
      console.error('Error fetching catalog:', error)
      setCatalogItems([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await axios.post(`${API_URL}/api/calculate`, formData)
      onResults(response.data)
    } catch (error) {
      console.error('Error calculating ROI:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeightChange = (value) => {
    const alpha = parseFloat(value)
    setFormData(prev => ({
      ...prev,
      alpha: alpha,
      beta: parseFloat((1 - alpha).toFixed(2))
    }))
  }

  const selectedDellLaptop = dellLaptops.find(l => l.id === formData.dell_model_id)
  const selectedCatalogItem = catalogItems.find(i => i.id === formData.catalog_item_id)

  return (
    <div className="card-luxury">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-medium text-lvmh-black mb-2">
          Investment Parameters
        </h2>
        <p className="text-sm text-lvmh-gray-500">
          Configure your analysis settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Equipment Type */}
        <div>
          <label className="label-luxury">Equipment Type</label>
          <div className="relative">
            <select
              value={formData.equipment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment_type: e.target.value }))}
              className="select-luxury pr-10"
            >
              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.has_refurb ? '(Refurbished available)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lvmh-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Dell Laptop Selector (for laptops only) */}
        {showDellSelector && dellLaptops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="label-luxury">Dell Model (optional)</label>
            <div className="relative">
              <select
                value={formData.dell_model_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  dell_model_id: e.target.value || null 
                }))}
                className="select-luxury pr-10"
              >
                <option value="">-- Use default price (€1,000) --</option>
                {dellLaptops.map((laptop) => (
                  <option key={laptop.id} value={laptop.id}>
                    {laptop.name} — €{laptop.price.toLocaleString('fr-FR')}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lvmh-gray-400 pointer-events-none" />
            </div>
            
            {/* Selected Dell Laptop Info */}
            {selectedDellLaptop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-4 bg-lvmh-gray-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-lvmh-black">{selectedDellLaptop.name}</p>
                    <p className="text-sm text-lvmh-gray-500 mt-1">
                      {selectedDellLaptop.screen_size} • {selectedDellLaptop.model}
                    </p>
                    {selectedDellLaptop.rating && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Star className="w-4 h-4 text-lvmh-gold fill-current" />
                        <span className="text-sm text-lvmh-gray-600">
                          {selectedDellLaptop.rating}/5
                          {selectedDellLaptop.reviews_count && (
                            <span className="text-lvmh-gray-400"> ({selectedDellLaptop.reviews_count} avis)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-lvmh-gold">
                    €{selectedDellLaptop.price.toLocaleString('fr-FR')}
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Dell Partnership Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 border-2 border-dashed border-lvmh-gold/50 rounded-lg bg-lvmh-gold/5"
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dell_partnership}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    dell_partnership: e.target.checked 
                  }))}
                  className="mt-1 w-5 h-5 text-lvmh-gold border-lvmh-gray-300 rounded focus:ring-lvmh-gold"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-lvmh-black">Partenariat Dell LVMH</span>
                    <span className="text-xs bg-lvmh-gold text-white px-2 py-0.5 rounded-full">1€</span>
                  </div>
                  <p className="text-xs text-lvmh-gray-500 mt-1">
                    Grâce au partenariat Dell, les laptops neufs sont disponibles à 1€ symbolique
                  </p>
                </div>
              </label>
            </motion.div>
          </motion.div>
        )}

        {/* Catalog Selector (for non-laptop equipment) */}
        {showCatalogSelector && catalogItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="label-luxury">Specific Model (optional)</label>
            <div className="relative">
              <select
                value={formData.catalog_item_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  catalog_item_id: e.target.value || null 
                }))}
                className="select-luxury pr-10"
              >
                <option value="">-- Use default values --</option>
                {catalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.brand} {item.model} — €{item.price_new.toLocaleString('fr-FR')}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lvmh-gray-400 pointer-events-none" />
            </div>
            
            {/* Selected Catalog Item Info */}
            {selectedCatalogItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-4 bg-lvmh-gray-100 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-lvmh-black">{selectedCatalogItem.name}</p>
                    <p className="text-sm text-lvmh-gray-500 mt-1">
                      {selectedCatalogItem.brand} • {selectedCatalogItem.model}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-lvmh-gray-600">
                          {selectedCatalogItem.co2_new} kg CO₂e
                        </span>
                      </div>
                      <span className="text-xs text-lvmh-gray-400">
                        Source: {selectedCatalogItem.source_co2}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-lvmh-gold">
                      €{selectedCatalogItem.price_new.toLocaleString('fr-FR')}
                    </p>
                    {selectedCatalogItem.price_refurb && (
                      <p className="text-xs text-emerald-600">
                        Refurb: €{selectedCatalogItem.price_refurb.toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Quantity & Duration */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="label-luxury">Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              className="input-luxury"
            />
          </div>
          <div>
            <label className="label-luxury">Duration (months)</label>
            <input
              type="number"
              min="12"
              max="120"
              value={formData.duration_months}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_months: parseInt(e.target.value) || 60 }))}
              className="input-luxury"
            />
          </div>
        </div>

        {/* Priority Weighting */}
        <div>
          <label className="label-luxury">Priority Weighting</label>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-lvmh-gray-600">
                <span className="font-medium text-lvmh-black">Financial</span>
                <span className="ml-2 text-lvmh-gold">{Math.round(formData.alpha * 100)}%</span>
              </span>
              <span className="text-lvmh-gray-600">
                <span className="text-lvmh-gold">{Math.round(formData.beta * 100)}%</span>
                <span className="ml-2 font-medium text-lvmh-black">Environmental</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.alpha}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-lvmh-black"></div>
                <span className="text-xs text-lvmh-gray-500">Cost Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-lvmh-gray-500">Carbon Priority</span>
                <div className="w-3 h-3 rounded-full bg-lvmh-gold"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-lvmh-gray-200"></div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.equipment_type}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Calculate ROI</span>
          )}
        </motion.button>
      </form>
    </div>
  )
}
