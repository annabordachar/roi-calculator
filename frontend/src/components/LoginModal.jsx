import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Mail, Loader2, User, Shield } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

export default function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.toLowerCase()
      })
      onLogin(response.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (email) => {
    setEmail(email)
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: email.toLowerCase()
      })
      onLogin(response.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur de connexion')
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
        className="bg-white rounded-lg shadow-luxury-lg max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-lvmh-black text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-display font-medium">Connexion</h2>
          <p className="text-lvmh-gray-400 text-sm mt-1">
            Connectez-vous avec votre email LVMH
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="label-luxury">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lvmh-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@lvmh.com"
                  required
                  className="input-luxury pl-11"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>

          {/* Quick Login (Demo) */}
          <div className="mt-8 pt-6 border-t border-lvmh-gray-200">
            <p className="text-xs text-lvmh-gray-500 uppercase tracking-wider mb-4 text-center">
              Connexion rapide (démo)
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('admin@lvmh.com')}
                disabled={loading}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-lvmh-gray-200 hover:border-lvmh-gold hover:bg-lvmh-gold/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-lvmh-gold/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-lvmh-gold" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-lvmh-black">IT Admin</p>
                  <p className="text-xs text-lvmh-gray-500">admin@lvmh.com</p>
                </div>
              </button>

              <button
                onClick={() => quickLogin('marie.dupont@lvmh.com')}
                disabled={loading}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-lvmh-gray-200 hover:border-lvmh-gold hover:bg-lvmh-gold/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-lvmh-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-lvmh-gray-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-lvmh-black">Marie Dupont</p>
                  <p className="text-xs text-lvmh-gray-500">marie.dupont@lvmh.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
