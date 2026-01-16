import { motion } from 'framer-motion'
import { Tag, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const CONDITION_LABELS = {
  excellent: { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700' },
  good: { label: 'Bon', color: 'bg-blue-100 text-blue-700' },
  fair: { label: 'Correct', color: 'bg-amber-100 text-amber-700' }
}

const STATUS_STYLES = {
  available: { label: 'Disponible', color: 'text-emerald-600', icon: CheckCircle },
  reserved: { label: 'Réservé', color: 'text-amber-600', icon: AlertCircle },
  sold: { label: 'Vendu', color: 'text-lvmh-gray-400', icon: CheckCircle }
}

export default function MarketplaceCard({ item, viewMode, onReserve, index }) {
  const condition = CONDITION_LABELS[item.condition] || CONDITION_LABELS.good
  const status = STATUS_STYLES[item.status] || STATUS_STYLES.available
  const StatusIcon = status.icon
  const price = item.price_manual || item.price_suggested

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="bg-white rounded-lg shadow-luxury overflow-hidden flex"
      >
        {/* Image */}
        <div className="w-48 h-36 flex-shrink-0">
          <img
            src={item.photo_url}
            alt={item.model}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-display font-medium text-lvmh-black">
                {item.brand} {item.model}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${condition.color}`}>
                {condition.label}
              </span>
            </div>
            <p className="text-sm text-lvmh-gray-500 mb-2">{item.description}</p>
            <div className="flex items-center space-x-4 text-sm text-lvmh-gray-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{item.age_months} mois</span>
              </span>
              <span className={`flex items-center space-x-1 ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span>{status.label}</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-display font-semibold text-lvmh-black mb-3">
              €{price.toLocaleString()}
            </p>
            {item.status === 'available' && (
              <button
                onClick={onReserve}
                className="btn-primary text-sm px-6 py-2"
              >
                Réserver
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-luxury overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.photo_url}
          alt={item.model}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2 py-1 rounded-full ${condition.color}`}>
            {condition.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full bg-white/90 ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{status.label}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Type Badge */}
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="w-3 h-3 text-lvmh-gold" />
          <span className="text-xs text-lvmh-gray-500 uppercase tracking-wider">
            {item.type.replace('_', '/')}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-display font-medium text-lvmh-black mb-1">
          {item.brand} {item.model}
        </h3>

        {/* Description */}
        <p className="text-sm text-lvmh-gray-500 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Age */}
        <div className="flex items-center space-x-1 text-sm text-lvmh-gray-400 mb-4">
          <Clock className="w-4 h-4" />
          <span>{item.age_months} mois d'utilisation</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-lvmh-gray-100">
          <div>
            <p className="text-xs text-lvmh-gray-400">Prix</p>
            <p className="text-xl font-display font-semibold text-lvmh-black">
              €{price.toLocaleString()}
            </p>
            {item.price_manual && item.price_manual !== item.price_suggested && (
              <p className="text-xs text-lvmh-gray-400 line-through">
                €{item.price_suggested.toLocaleString()}
              </p>
            )}
          </div>

          {item.status === 'available' ? (
            <button
              onClick={onReserve}
              className="btn-gold text-sm px-5 py-2"
            >
              Réserver
            </button>
          ) : (
            <span className={`text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
