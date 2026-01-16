import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Leaf, DollarSign, Zap, Award } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

// Equipment types that work with the calculator
const COMPARE_EQUIPMENT = [
  { id: 'laptop', name: 'Laptop', hasRefurb: true },
  { id: 'smartphone', name: 'Smartphone', hasRefurb: true },
  { id: 'screen', name: 'Screen', hasRefurb: true },
  { id: 'tablet', name: 'Tablet', hasRefurb: true },
  { id: 'switch_router', name: 'Switch/Router', hasRefurb: true },
  { id: 'landline_phone', name: 'Landline Phone', hasRefurb: true },
  { id: 'meeting_room_screen', name: 'Meeting Room Screen', hasRefurb: true },
  { id: 'refurbished_smartphone', name: 'Refurbished Smartphone', hasRefurb: false },
  { id: 'refurbished_screen', name: 'Refurbished Screen', hasRefurb: false },
  { id: 'refurbished_switch_router', name: 'Refurbished Switch/Router', hasRefurb: false },
]

export default function CompareMode() {
  const [slots, setSlots] = useState([null, null, null])
  const [results, setResults] = useState([null, null, null])
  const [isLoading, setIsLoading] = useState([false, false, false])

  const handleSelectEquipment = async (slotIndex, equipmentType) => {
    // Update slot
    const newSlots = [...slots]
    newSlots[slotIndex] = equipmentType
    setSlots(newSlots)

    if (!equipmentType) {
      const newResults = [...results]
      newResults[slotIndex] = null
      setResults(newResults)
      return
    }

    // Set loading for this slot
    const newLoading = [...isLoading]
    newLoading[slotIndex] = true
    setIsLoading(newLoading)

    try {
      const response = await axios.post(`${API_URL}/api/calculate`, {
        equipment_type: equipmentType,
        quantity: 1,
        duration_months: 60,
        alpha: 0.5,
        beta: 0.5
      })
      
      const newResults = [...results]
      newResults[slotIndex] = response.data
      setResults(newResults)
    } catch (error) {
      console.error('Error calculating:', error)
      // Create a fallback result for equipment that fails
      const equipItem = COMPARE_EQUIPMENT.find(e => e.id === equipmentType)
      const newResults = [...results]
      newResults[slotIndex] = {
        equipment_name: equipItem?.name || equipmentType,
        price_new: 0,
        price_refurb: null,
        tco_new: 0,
        tco_refurb: null,
        lease_total: 0,
        carbon_avoided_kg: 0,
        financial_savings_percent: null,
        score: null,
        recommendation: 'N/A',
        recommendation_reason: 'Calculation unavailable'
      }
      setResults(newResults)
    } finally {
      const newLoading = [...isLoading]
      newLoading[slotIndex] = false
      setIsLoading(newLoading)
    }
  }

  const clearSlot = (index) => {
    const newSlots = [...slots]
    const newResults = [...results]
    newSlots[index] = null
    newResults[index] = null
    setSlots(newSlots)
    setResults(newResults)
  }

  // Calculate best options
  const filledResults = results.filter(r => r !== null && (r.tco_new > 0 || r.tco_refurb > 0))
  
  const getBestFinancial = () => {
    if (filledResults.length < 2) return -1
    let bestIdx = -1
    let bestTCO = Infinity
    results.forEach((r, i) => {
      if (r) {
        // For refurbished equipment, use tco_new (which is actually the refurbished TCO)
        // For regular equipment, prefer refurbished if available, otherwise new
        const tco = r.tco_refurb || r.tco_new
        if (tco && tco > 0 && tco < bestTCO) {
          bestTCO = tco
          bestIdx = i
        }
      }
    })
    return bestIdx
  }

  const getBestCarbon = () => {
    if (filledResults.length < 2) return -1
    let bestIdx = -1
    let bestCarbon = -1
    results.forEach((r, i) => {
      if (r && (r.carbon_avoided_kg || 0) > bestCarbon) {
        bestCarbon = r.carbon_avoided_kg || 0
        bestIdx = i
      }
    })
    return bestIdx
  }

  const bestFinancial = getBestFinancial()
  const bestCarbon = getBestCarbon()

  return (
    <div className="min-h-screen bg-[#f8f7f5] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
            Decision Support Tool
          </p>
          <h1 className="text-4xl font-display font-medium text-lvmh-black mb-2">
            COMPARE <span className="italic">EQUIPMENT</span>
          </h1>
          <p className="text-lvmh-gray-500">
            Compare up to 3 equipment options side by side
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[0, 1, 2].map((index) => (
            <CompareSlot
              key={index}
              index={index}
              equipment={COMPARE_EQUIPMENT}
              selected={slots[index]}
              result={results[index]}
              onSelect={(type) => handleSelectEquipment(index, type)}
              onClear={() => clearSlot(index)}
              isBestFinancial={bestFinancial === index}
              isBestCarbon={bestCarbon === index}
              isLoading={isLoading[index]}
            />
          ))}
        </div>

        {/* Comparison Summary */}
        {filledResults.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h3 className="text-xl font-display font-medium text-lvmh-black mb-6">
              Comparison <span className="italic">Summary</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-lvmh-gold/30">
                    <th className="text-left py-4 px-4 text-sm text-lvmh-gray-500 font-normal uppercase tracking-wider">Metric</th>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <th key={i} className="text-center py-4 px-4 text-sm font-medium text-lvmh-black">
                        {r.equipment_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-lvmh-gray-100">
                    <td className="py-4 px-4 text-sm text-lvmh-gray-600">Price (New)</td>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <td key={i} className="text-center py-4 px-4 text-sm font-medium">
                        {r.price_new ? `€${r.price_new.toLocaleString()}` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-lvmh-gray-100">
                    <td className="py-4 px-4 text-sm text-lvmh-gray-600">Price (Refurbished)</td>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <td key={i} className="text-center py-4 px-4 text-sm font-medium text-emerald-600">
                        {r.price_refurb ? `€${r.price_refurb.toLocaleString()}` : r.recommendation === 'Buy Refurbished' ? `€${r.price_new?.toLocaleString() || 'N/A'} (Refurb)` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-lvmh-gray-100">
                    <td className="py-4 px-4 text-sm text-lvmh-gray-600">TCO (5 years)</td>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <td key={i} className={`text-center py-4 px-4 text-sm font-medium ${bestFinancial === i ? 'text-lvmh-gold' : ''}`}>
                        €{(r.tco_refurb || r.tco_new)?.toLocaleString() || 'N/A'}
                        {bestFinancial === i && <Award className="w-4 h-4 inline ml-1 text-lvmh-gold" />}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-lvmh-gray-100">
                    <td className="py-4 px-4 text-sm text-lvmh-gray-600">CO₂ Avoided</td>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <td key={i} className={`text-center py-4 px-4 text-sm font-medium ${bestCarbon === i ? 'text-emerald-600' : ''}`}>
                        {r.carbon_avoided_kg || 0} kg
                        {bestCarbon === i && <Leaf className="w-4 h-4 inline ml-1 text-emerald-600" />}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-lvmh-gray-100">
                    <td className="py-4 px-4 text-sm text-lvmh-gray-600">Financial Savings</td>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <td key={i} className="text-center py-4 px-4 text-sm font-medium">
                        {r.financial_savings_percent ? `${r.financial_savings_percent}%` : r.recommendation === 'Buy Refurbished' ? '~50%' : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-sm text-lvmh-gray-600">Recommendation</td>
                    {results.map((r, i) => r && (r.tco_new > 0 || r.tco_refurb > 0) && (
                      <td key={i} className="text-center py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          r.recommendation === 'Buy Refurbished' ? 'bg-emerald-100 text-emerald-700' :
                          r.recommendation === 'Lease' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {r.recommendation}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation Box */}
            <div className="mt-8 p-6 bg-lvmh-gold/10 rounded-lg border border-lvmh-gold/30">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-5 h-5 text-lvmh-gold" />
                <span className="font-medium text-lvmh-black">Our Recommendation</span>
              </div>
              <p className="text-sm text-lvmh-gray-600">
                Based on your comparison, <span className="font-medium text-lvmh-black">
                  {results[bestCarbon]?.equipment_name}
                </span> offers the best environmental impact with {results[bestCarbon]?.carbon_avoided_kg || 0} kg CO₂ avoided.
                {bestFinancial !== bestCarbon && bestFinancial >= 0 && (
                  <> For best financial value, consider <span className="font-medium text-lvmh-black">
                    {results[bestFinancial]?.equipment_name}
                  </span>.</>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function CompareSlot({ index, equipment, selected, result, onSelect, onClear, isBestFinancial, isBestCarbon, isLoading }) {
  if (!selected) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white border-2 border-dashed border-lvmh-gray-300 rounded-xl p-6 min-h-[400px] flex flex-col items-center justify-center"
      >
        <div className="w-16 h-16 rounded-full bg-lvmh-gray-100 flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-lvmh-gray-400" />
        </div>
        <p className="text-sm text-lvmh-gray-500 mb-4">Add equipment to compare</p>
        <select
          onChange={(e) => onSelect(e.target.value)}
          className="px-4 py-2 border border-lvmh-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lvmh-gold"
          defaultValue=""
        >
          <option value="" disabled>Select equipment</option>
          {equipment.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${
        (isBestFinancial || isBestCarbon) ? 'ring-2 ring-lvmh-gold' : ''
      }`}
    >
      {/* Header */}
      <div className="bg-lvmh-black text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium">{result?.equipment_name || 'Loading...'}</h3>
          {(isBestFinancial || isBestCarbon) && (
            <div className="flex items-center space-x-2 mt-1">
              {isBestFinancial && (
                <span className="text-xs bg-lvmh-gold/20 text-lvmh-gold px-2 py-0.5 rounded">
                  Best Value
                </span>
              )}
              {isBestCarbon && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                  Most Eco
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-8 flex items-center justify-center min-h-[350px]">
          <div className="animate-spin w-8 h-8 border-2 border-lvmh-gold border-t-transparent rounded-full"></div>
        </div>
      ) : result ? (
        <div className="p-4 space-y-4">
          {/* Score */}
          <div className="text-center py-4">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              (result.score || 0) >= 0.7 ? 'bg-emerald-100' :
              (result.score || 0) >= 0.4 ? 'bg-amber-100' :
              'bg-gray-100'
            }`}>
              <span className={`text-2xl font-display font-bold ${
                (result.score || 0) >= 0.7 ? 'text-emerald-600' :
                (result.score || 0) >= 0.4 ? 'text-amber-600' :
                'text-gray-600'
              }`}>
                {result.score?.toFixed(2) || 'N/A'}
              </span>
            </div>
            <p className="text-xs text-lvmh-gray-500 mt-2">{result.recommendation}</p>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <MetricRow 
              icon={DollarSign} 
              label="Price (New)" 
              value={result.price_new ? `€${result.price_new.toLocaleString()}` : 'N/A'} 
            />
            <MetricRow 
              icon={DollarSign} 
              label={result.recommendation === 'Buy Refurbished' ? "Price (Refurb)" : "Price (Refurb)"}
              value={
                result.price_refurb 
                  ? `€${result.price_refurb.toLocaleString()}` 
                  : result.recommendation === 'Buy Refurbished' 
                    ? `€${result.price_new?.toLocaleString() || 'N/A'} (Refurb)`
                    : 'N/A'
              } 
              highlight={!!result.price_refurb || result.recommendation === 'Buy Refurbished'}
            />
            <MetricRow icon={Leaf} label="CO₂ Avoided" value={`${result.carbon_avoided_kg || 0} kg`} />
            <MetricRow icon={Zap} label="Savings" value={result.financial_savings_percent ? `${result.financial_savings_percent}%` : 'N/A'} />
          </div>

          {/* TCO */}
          <div className="pt-4 border-t border-lvmh-gray-200">
            <p className="text-xs text-lvmh-gray-500 mb-2 uppercase tracking-wider">TCO (5 years)</p>
            {result.recommendation === 'Buy Refurbished' ? (
              <div className="flex justify-between items-center">
                <span className="text-sm text-lvmh-gray-600">Refurbished</span>
                <span className="font-medium text-emerald-600">€{result.tco_new?.toLocaleString() || 'N/A'}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-lvmh-gray-600">New</span>
                  <span className="font-medium">€{result.tco_new?.toLocaleString() || 'N/A'}</span>
                </div>
                {result.tco_refurb && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-lvmh-gray-600">Refurbished</span>
                    <span className="font-medium text-emerald-600">€{result.tco_refurb.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
            {result.lease_total > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-lvmh-gray-600">Lease</span>
                <span className="font-medium text-amber-600">€{result.lease_total?.toLocaleString() || 'N/A'}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 flex items-center justify-center min-h-[350px] text-lvmh-gray-400">
          No data available
        </div>
      )}
    </motion.div>
  )
}

function MetricRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-500' : 'text-lvmh-gray-400'}`} />
        <span className="text-sm text-lvmh-gray-600">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? 'text-emerald-600' : 'text-lvmh-black'}`}>
        {value}
      </span>
    </div>
  )
}
