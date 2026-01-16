import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Leaf, DollarSign, Zap, Download, CheckCircle, AlertCircle, XCircle, RefreshCw, Car, TreePine, Plane, Check } from 'lucide-react'
import CO2Certificate from './CO2Certificate'
import { addImpactChoice } from './MyImpact'

export default function Results({ results }) {
  const [choiceConfirmed, setChoiceConfirmed] = useState(false)

  const handleConfirmChoice = () => {
    addImpactChoice(results)
    setChoiceConfirmed(true)
    setTimeout(() => setChoiceConfirmed(false), 3000)
  }

  const getRecommendationStyle = (recommendation) => {
    switch (recommendation) {
      case 'Buy Refurbished':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          icon: CheckCircle,
          iconColor: 'text-emerald-500'
        }
      case 'Lease':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: RefreshCw,
          iconColor: 'text-amber-500'
        }
      default:
        return {
          bg: 'bg-lvmh-gray-100',
          border: 'border-lvmh-gray-200',
          text: 'text-lvmh-gray-700',
          icon: XCircle,
          iconColor: 'text-lvmh-gray-500'
        }
    }
  }

  const generatePDFReport = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ROI Report - ${results.equipment_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; padding: 40px; background: #faf9f7; }
          
          .report { background: white; max-width: 800px; margin: 0 auto; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #b8860b; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 600; }
          .date { color: #666; font-size: 14px; }
          
          h1 { font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 10px; }
          h2 { font-family: 'Playfair Display', serif; font-size: 18px; color: #b8860b; margin: 25px 0 15px; }
          
          .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
          
          .score-box { background: linear-gradient(135deg, #f8f6f3, #f0ede8); border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
          .score { font-size: 48px; font-weight: 700; color: #1a1a1a; }
          .score-label { color: #b8860b; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
          
          .recommendation { background: ${results.recommendation === 'Buy Refurbished' ? '#ecfdf5' : results.recommendation === 'Lease' ? '#fffbeb' : '#f3f4f6'}; 
            padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .recommendation-text { font-weight: 600; font-size: 18px; color: ${results.recommendation === 'Buy Refurbished' ? '#059669' : results.recommendation === 'Lease' ? '#d97706' : '#374151'}; }
          
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .metric { background: #f8f8f8; padding: 15px; border-radius: 8px; }
          .metric-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .metric-value { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-top: 5px; }
          
          .comparison { margin: 20px 0; }
          .comparison-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .comparison-label { color: #666; }
          .comparison-value { font-weight: 600; }
          
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="header">
            <div class="logo">LVMH <span style="color: #b8860b; font-size: 14px;">GREEN IT</span></div>
            <div class="date">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          
          <h1>ROI Analysis Report</h1>
          <p class="subtitle">${results.equipment_name} × ${results.quantity} — ${results.duration_months} months</p>
          
          <div class="score-box">
            <div class="score">${results.score?.toFixed(2) || 'N/A'}</div>
            <div class="score-label">Score</div>
          </div>
          
          <div class="recommendation">
            <div class="recommendation-text">${results.recommendation}</div>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">${results.recommendation_reason}</p>
          </div>
          
          <h2>Options Comparison</h2>
          <div class="comparison">
            <div class="comparison-row">
              <span class="comparison-label">Buy New</span>
              <span class="comparison-value">€${results.price_new.toLocaleString()}</span>
            </div>
            <div class="comparison-row">
              <span class="comparison-label">Lease (${results.duration_months} months)</span>
              <span class="comparison-value">€${results.lease_total.toLocaleString()} (€${results.lease_monthly}/month)</span>
            </div>
            <div class="comparison-row">
              <span class="comparison-label">Buy Refurbished</span>
              <span class="comparison-value" style="color: #059669;">${results.price_refurb ? `€${results.price_refurb.toLocaleString()}` : 'N/A'}</span>
            </div>
          </div>
          
          <h2>Key Metrics</h2>
          <div class="grid">
            <div class="metric">
              <div class="metric-label">Financial Savings</div>
              <div class="metric-value">${results.financial_savings_percent || 0}%</div>
            </div>
            <div class="metric">
              <div class="metric-label">Carbon Avoided</div>
              <div class="metric-value">${results.carbon_avoided_kg} kg CO₂</div>
            </div>
            <div class="metric">
              <div class="metric-label">Financial ROI</div>
              <div class="metric-value">${results.financial_roi?.toFixed(2) || 'N/A'}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Carbon ROI</div>
              <div class="metric-value">${results.carbon_roi?.toFixed(2) || 'N/A'}</div>
            </div>
          </div>
          
          <h2>Total Cost of Ownership (${results.duration_months / 12} years)</h2>
          <div class="comparison">
            <div class="comparison-row">
              <span class="comparison-label">New</span>
              <span class="comparison-value">€${results.tco_new.toLocaleString()}</span>
            </div>
            <div class="comparison-row">
              <span class="comparison-label">Lease</span>
              <span class="comparison-value">€${results.lease_total.toLocaleString()}</span>
            </div>
            ${results.tco_refurb ? `
            <div class="comparison-row">
              <span class="comparison-label">Refurbished</span>
              <span class="comparison-value" style="color: #059669;">€${results.tco_refurb.toLocaleString()}</span>
            </div>
            <div class="comparison-row" style="background: #ecfdf5; margin: 10px -15px; padding: 12px 15px;">
              <span class="comparison-label" style="font-weight: 600;">Savings (vs New)</span>
              <span class="comparison-value" style="color: #059669;">€${results.tco_savings?.toLocaleString() || 0}</span>
            </div>
            ` : ''}
          </div>
          
          <h2>Environmental Impact</h2>
          <p style="color: #666; margin-bottom: 15px;">${results.carbon_avoided_kg} kg CO₂ avoided equals:</p>
          <div class="grid">
            <div class="metric">
              <div class="metric-label">🚗 Car Distance</div>
              <div class="metric-value">${Math.round(results.carbon_avoided_kg / 0.21).toLocaleString()} km</div>
            </div>
            <div class="metric">
              <div class="metric-label">🌲 Trees (1 year)</div>
              <div class="metric-value">${Math.round(results.carbon_avoided_kg / 25)} trees</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated by LVMH Green IT ROI Platform</p>
            <p style="margin-top: 5px;">© ${new Date().getFullYear()} LVMH. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 500)
  }

  const style = getRecommendationStyle(results.recommendation)
  const Icon = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="card-luxury"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-display font-medium text-lvmh-black mb-2">
          Analysis Results
        </h2>
        <p className="text-sm text-lvmh-gray-500">
          {results.equipment_name} × {results.quantity} — {results.duration_months} months
        </p>
        {results.dell_partnership && (
          <div className="mt-2 inline-flex items-center space-x-2 bg-lvmh-gold/10 text-lvmh-gold px-3 py-1 rounded-full">
            <span className="text-xs font-medium">Partenariat Dell LVMH actif</span>
            <span className="text-xs">• Prix: 1€/unité</span>
          </div>
        )}
        {results.co2_source && (
          <div className="mt-2 ml-2 inline-flex items-center space-x-1 text-xs text-lvmh-gray-400">
            <Leaf className="w-3 h-3" />
            <span>Source CO₂: {results.co2_source}</span>
          </div>
        )}
      </div>

      {/* Score Gauge */}
      <div className="flex justify-center mb-8">
        <ScoreGauge score={results.score} />
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`${style.bg} ${style.border} border rounded-lg p-6 mb-8 text-center`}
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
          <span className={`text-lg font-medium ${style.text}`}>
            {results.recommendation}
          </span>
        </div>
        <p className="text-sm text-lvmh-gray-600">
          {results.recommendation_reason}
        </p>
      </motion.div>

      {/* Options Comparison */}
      <div className="mb-8">
        <h3 className="label-luxury mb-4">Options Comparison</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Buy New */}
          <OptionCard
            title="Buy New"
            price={results.price_new}
            originalPrice={results.dell_original_price}
            isPartnership={results.dell_partnership}
            isRecommended={results.recommendation === 'Buy New'}
            color="gray"
          />
          
          {/* Lease */}
          <OptionCard
            title="Lease"
            price={results.lease_total}
            subtitle={`€${results.lease_monthly.toLocaleString()}/month`}
            isRecommended={results.recommendation === 'Lease'}
            color="amber"
          />
          
          {/* Buy Refurbished */}
          {results.price_refurb ? (
            <OptionCard
              title="Refurbished"
              price={results.price_refurb}
              savings={results.financial_savings_percent}
              isRecommended={results.recommendation === 'Buy Refurbished'}
              color="emerald"
            />
          ) : (
            <div className="p-4 rounded-lg bg-lvmh-gray-50 flex items-center justify-center">
              <p className="text-xs text-lvmh-gray-400 text-center">Not available</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Financial Savings */}
        {results.financial_savings_percent !== null && (
          <MetricCard
            icon={DollarSign}
            label="Financial Savings"
            value={`${results.financial_savings_percent}%`}
            sublabel="vs. buying new"
          />
        )}
        
        {/* Carbon Avoided */}
        <MetricCard
          icon={Leaf}
          label="Carbon Avoided"
          value={`${results.carbon_avoided_kg} kg`}
          sublabel="CO₂e"
          highlight
        />
        
        {/* Financial ROI */}
        {results.financial_roi !== null && (
          <MetricCard
            icon={TrendingUp}
            label="Financial ROI"
            value={results.financial_roi.toFixed(2)}
            sublabel="/ 1.00"
          />
        )}
        
        {/* Carbon ROI */}
        <MetricCard
          icon={Zap}
          label="Carbon ROI"
          value={results.carbon_roi.toFixed(2)}
          sublabel="/ 1.00"
        />
      </div>

      {/* TCO Comparison */}
      {results.tco_refurb && (
        <div className="mb-8">
          <h3 className="label-luxury mb-4">Total Cost of Ownership ({results.duration_months/12} years)</h3>
          <div className="space-y-3">
            <TCOBar 
              label="New" 
              value={results.tco_new} 
              max={Math.max(results.tco_new, results.lease_total)}
              color="bg-lvmh-gray-400"
            />
            <TCOBar 
              label="Lease" 
              value={results.lease_total} 
              max={Math.max(results.tco_new, results.lease_total)}
              color="bg-amber-400"
            />
            <TCOBar 
              label="Refurbished" 
              value={results.tco_refurb} 
              max={Math.max(results.tco_new, results.lease_total)}
              color="bg-emerald-500"
            />
          </div>
          {results.tco_savings && (
            <p className="text-sm text-lvmh-gray-500 mt-3">
              Savings (refurb vs new): <span className="font-medium text-emerald-600">€{results.tco_savings.toLocaleString()}</span>
            </p>
          )}
        </div>
      )}

      {/* CO2 Equivalences */}
      {results.carbon_avoided_kg > 0 && (
        <div className="mb-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h3 className="text-sm font-medium text-emerald-700 mb-3 flex items-center">
            <Leaf className="w-4 h-4 mr-2" />
            {results.carbon_avoided_kg} kg CO₂ avoided equals:
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <Car className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-semibold text-emerald-700">
                {Math.round(results.carbon_avoided_kg / 0.21).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-600">km by car</p>
            </div>
            <div className="text-center">
              <TreePine className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-semibold text-emerald-700">
                {Math.round(results.carbon_avoided_kg / 25)}
              </p>
              <p className="text-xs text-emerald-600">trees/year</p>
            </div>
            <div className="text-center">
              <Plane className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-semibold text-emerald-700">
                {(results.carbon_avoided_kg / 255).toFixed(1)}
              </p>
              <p className="text-xs text-emerald-600">Paris-NYC flights</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Choice Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleConfirmChoice}
        disabled={choiceConfirmed}
        className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all mb-3 ${
          choiceConfirmed 
            ? 'bg-emerald-500 text-white' 
            : 'bg-lvmh-gold text-white hover:bg-lvmh-goldDark'
        }`}
      >
        {choiceConfirmed ? (
          <>
            <Check className="w-5 h-5" />
            <span>Choix enregistré !</span>
          </>
        ) : (
          <>
            <Leaf className="w-5 h-5" />
            <span>Confirmer mon choix</span>
          </>
        )}
      </motion.button>

      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={generatePDFReport}
        className="btn-outline w-full flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>Export PDF Report</span>
      </motion.button>

      {/* CO2 Certificate */}
      <CO2Certificate results={results} />
    </motion.div>
  )
}

function ScoreGauge({ score }) {
  const normalizedScore = score !== null ? score : 0
  const percentage = normalizedScore * 100
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getScoreColor = (score) => {
    if (score >= 0.7) return '#10b981' // emerald-500
    if (score >= 0.4) return '#f59e0b' // amber-500
    return '#6b7280' // gray-500
  }

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r="45"
          stroke="#e5e5e5"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx="80"
          cy="80"
          r="45"
          stroke={getScoreColor(normalizedScore)}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-display font-semibold text-lvmh-black">
          {score !== null ? score.toFixed(2) : 'N/A'}
        </span>
        <span className="text-xs text-lvmh-gray-500 uppercase tracking-wider">Score</span>
      </div>
    </div>
  )
}

function OptionCard({ title, price, originalPrice, subtitle, savings, isRecommended, isPartnership, color }) {
  const colorStyles = {
    gray: 'border-lvmh-gray-200',
    amber: 'border-amber-300 bg-amber-50/50',
    emerald: 'border-emerald-300 bg-emerald-50/50'
  }
  
  return (
    <div className={`p-4 rounded-lg border-2 ${isRecommended ? colorStyles[color] : 'border-lvmh-gray-100'} ${isRecommended ? 'ring-2 ring-offset-2 ring-lvmh-gold' : ''}`}>
      <p className="text-xs text-lvmh-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <p className="text-lg font-display font-semibold text-lvmh-black">
        €{price.toLocaleString()}
      </p>
      {originalPrice && isPartnership && (
        <p className="text-xs text-lvmh-gray-400 line-through">
          €{originalPrice.toLocaleString()}
        </p>
      )}
      {isPartnership && (
        <span className="inline-block mt-1 text-xs bg-lvmh-gold/20 text-lvmh-gold px-2 py-0.5 rounded">
          Partenariat Dell
        </span>
      )}
      {subtitle && (
        <p className="text-xs text-lvmh-gray-400 mt-1">{subtitle}</p>
      )}
      {savings && (
        <p className="text-xs text-emerald-600 font-medium mt-1">-{savings}%</p>
      )}
      {isRecommended && (
        <span className="inline-block mt-2 text-xs bg-lvmh-gold text-white px-2 py-0.5 rounded">
          Recommended
        </span>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sublabel, highlight }) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-lvmh-gold/10' : 'bg-lvmh-gray-100'}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-4 h-4 ${highlight ? 'text-lvmh-gold' : 'text-lvmh-gray-500'}`} />
        <span className="text-xs text-lvmh-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-display font-semibold text-lvmh-black">{value}</span>
        <span className="text-sm text-lvmh-gray-400">{sublabel}</span>
      </div>
    </div>
  )
}

function TCOBar({ label, value, max, color }) {
  const percentage = (value / max) * 100

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-lvmh-gray-600">{label}</span>
        <span className="font-medium text-lvmh-black">€{value.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-lvmh-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
