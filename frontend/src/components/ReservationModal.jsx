import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Send, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

export default function ReservationModal({ item, user, onClose, onSuccess }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const price = item.price_manual || item.price_suggested

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(`${API_URL}/api/reservations`, {
        equipment_id: item.id,
        user_email: user.email,
        message: message || null
      })
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-lg shadow-luxury-lg max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          // Success State
          <div className="p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h3 className="text-2xl font-display font-medium text-lvmh-black mb-2">
              Demande envoyée !
            </h3>
            <p className="text-lvmh-gray-500">
              L'équipe IT va traiter votre demande. Vous serez notifié de la décision.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="relative">
              <img
                src={item.photo_url}
                alt={item.model}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-lvmh-black" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-display font-medium text-lvmh-black mb-1">
                {item.brand} {item.model}
              </h3>
              <p className="text-lvmh-gold font-semibold text-lg mb-4">
                €{price.toLocaleString()}
              </p>

              {/* User Info */}
              <div className="bg-lvmh-gray-100 rounded-lg p-4 mb-6">
                <p className="text-xs text-lvmh-gray-500 uppercase tracking-wider mb-2">
                  Demandeur
                </p>
                <p className="font-medium text-lvmh-black">{user.name}</p>
                <p className="text-sm text-lvmh-gray-500">{user.email}</p>
                <p className="text-sm text-lvmh-gray-500">{user.department}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="label-luxury">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Expliquez pourquoi vous avez besoin de cet équipement..."
                    rows={3}
                    className="input-luxury resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-outline flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Envoyer la demande</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
