import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, 
  AlertCircle, Users, ChevronDown, Loader2, X 
} from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

const EQUIPMENT_TYPES = [
  { id: 'laptop', label: 'Laptop' },
  { id: 'screen', label: 'Screen' },
  { id: 'smartphone', label: 'Smartphone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'switch_router', label: 'Switch/Router' },
  { id: 'landline_phone', label: 'Landline Phone' },
]

const CONDITIONS = [
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Bon' },
  { id: 'fair', label: 'Correct' },
]

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('equipment')
  const [items, setItems] = useState([])
  const [reservations, setReservations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [itemsRes, reservationsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/marketplace?status=`),
        axios.get(`${API_URL}/api/reservations`),
        axios.get(`${API_URL}/api/marketplace/stats`)
      ])
      setItems(itemsRes.data)
      setReservations(reservationsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReservationAction = async (reservationId, action) => {
    try {
      await axios.put(
        `${API_URL}/api/reservations/${reservationId}?admin_email=${user.email}`,
        { status: action }
      )
      fetchData()
    } catch (error) {
      console.error('Error updating reservation:', error)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return
    
    try {
      await axios.delete(`${API_URL}/api/marketplace/${itemId}?admin_email=${user.email}`)
      fetchData()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const pendingCount = reservations.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-lvmh-cream">
      {/* Header */}
      <section className="bg-lvmh-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-lvmh-gold" />
            <span className="text-lvmh-gold text-sm tracking-widest uppercase">Administration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-medium">
            Dashboard IT Admin
          </h1>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <StatCard label="Total équipements" value={stats.total_items} icon={Package} />
              <StatCard label="Disponibles" value={stats.available} icon={CheckCircle} color="text-emerald-400" />
              <StatCard label="Réservés" value={stats.reserved} icon={Clock} color="text-amber-400" />
              <StatCard 
                label="Demandes en attente" 
                value={stats.pending_reservations} 
                icon={AlertCircle} 
                color="text-red-400" 
                highlight={stats.pending_reservations > 0}
              />
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-4 border-b border-lvmh-gray-200">
          <TabButton 
            active={activeTab === 'equipment'} 
            onClick={() => setActiveTab('equipment')}
            label="Équipements"
            count={items.length}
          />
          <TabButton 
            active={activeTab === 'reservations'} 
            onClick={() => setActiveTab('reservations')}
            label="Demandes"
            count={pendingCount}
            highlight={pendingCount > 0}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-lvmh-gold animate-spin" />
          </div>
        ) : activeTab === 'equipment' ? (
          <EquipmentTab 
            items={items} 
            onDelete={handleDeleteItem}
            onAdd={() => setShowAddModal(true)}
            onRefresh={fetchData}
            userEmail={user.email}
          />
        ) : (
          <ReservationsTab 
            reservations={reservations}
            items={items}
            onAction={handleReservationAction}
          />
        )}
      </div>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddEquipmentModal
            userEmail={user.email}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              fetchData()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color = 'text-white', highlight = false }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? 'bg-red-900/50' : 'bg-lvmh-charcoal'}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-lvmh-gray-400 text-xs uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-display font-semibold text-white">{value}</p>
    </div>
  )
}

function TabButton({ active, onClick, label, count, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
        active ? 'text-lvmh-black' : 'text-lvmh-gray-500 hover:text-lvmh-black'
      }`}
    >
      <span className="flex items-center space-x-2">
        <span>{label}</span>
        {count > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            highlight ? 'bg-red-500 text-white' : 'bg-lvmh-gray-200 text-lvmh-gray-600'
          }`}>
            {count}
          </span>
        )}
      </span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-lvmh-gold"
        />
      )}
    </button>
  )
}

function EquipmentTab({ items, onDelete, onAdd, onRefresh, userEmail }) {
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatusChange = async (itemId, newStatus) => {
    setUpdatingId(itemId)
    try {
      await axios.put(
        `${API_URL}/api/marketplace/${itemId}?admin_email=${userEmail}`,
        { status: newStatus }
      )
      onRefresh()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-lvmh-gray-500">{items.length} équipement(s)</p>
        <button onClick={onAdd} className="btn-gold flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Ajouter un équipement</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-luxury overflow-hidden">
        <table className="w-full">
          <thead className="bg-lvmh-gray-100">
            <tr>
              <th className="text-left text-xs font-medium text-lvmh-gray-500 uppercase tracking-wider px-6 py-4">
                Équipement
              </th>
              <th className="text-left text-xs font-medium text-lvmh-gray-500 uppercase tracking-wider px-6 py-4">
                État
              </th>
              <th className="text-left text-xs font-medium text-lvmh-gray-500 uppercase tracking-wider px-6 py-4">
                Prix
              </th>
              <th className="text-left text-xs font-medium text-lvmh-gray-500 uppercase tracking-wider px-6 py-4">
                Status
              </th>
              <th className="text-right text-xs font-medium text-lvmh-gray-500 uppercase tracking-wider px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lvmh-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-lvmh-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.photo_url} 
                      alt={item.model}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-lvmh-black">{item.brand} {item.model}</p>
                      <p className="text-xs text-lvmh-gray-500">{item.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ConditionBadge condition={item.condition} />
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-lvmh-black">
                    €{(item.price_manual || item.price_suggested).toLocaleString()}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    disabled={updatingId === item.id}
                    className="text-sm border border-lvmh-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-lvmh-gold"
                  >
                    <option value="available">Disponible</option>
                    <option value="reserved">Réservé</option>
                    <option value="sold">Vendu</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReservationsTab({ reservations, items, onAction }) {
  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const processedReservations = reservations.filter(r => r.status !== 'pending')

  const getItemDetails = (equipmentId) => {
    return items.find(i => i.id === equipmentId)
  }

  return (
    <div className="space-y-8">
      {/* Pending */}
      <div>
        <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
          En attente ({pendingReservations.length})
        </h3>
        {pendingReservations.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-lvmh-gray-500">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReservations.map((reservation) => {
              const item = getItemDetails(reservation.equipment_id)
              return (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  item={item}
                  onApprove={() => onAction(reservation.id, 'approved')}
                  onReject={() => onAction(reservation.id, 'rejected')}
                  showActions
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Processed */}
      {processedReservations.length > 0 && (
        <div>
          <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
            Historique ({processedReservations.length})
          </h3>
          <div className="space-y-4">
            {processedReservations.map((reservation) => {
              const item = getItemDetails(reservation.equipment_id)
              return (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  item={item}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ReservationCard({ reservation, item, onApprove, onReject, showActions = false }) {
  const statusStyles = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'En attente' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approuvé' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Refusé' }
  }
  const style = statusStyles[reservation.status] || statusStyles.pending

  return (
    <div className="bg-white rounded-lg shadow-luxury p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {item && (
            <img 
              src={item.photo_url} 
              alt={item.model}
              className="w-16 h-16 rounded object-cover"
            />
          )}
          <div>
            <p className="font-medium text-lvmh-black">
              {item ? `${item.brand} ${item.model}` : 'Équipement inconnu'}
            </p>
            <p className="text-sm text-lvmh-gray-500 mt-1">
              Demandé par <span className="font-medium">{reservation.user_name}</span>
              <span className="mx-1">•</span>
              {reservation.user_department}
            </p>
            <p className="text-xs text-lvmh-gray-400 mt-1">{reservation.user_email}</p>
            {reservation.message && (
              <p className="text-sm text-lvmh-gray-600 mt-3 italic">"{reservation.message}"</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs px-3 py-1 rounded-full ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          
          {showActions && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={onReject}
                className="flex items-center space-x-1 px-3 py-2 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Refuser</span>
              </button>
              <button
                onClick={onApprove}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approuver</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConditionBadge({ condition }) {
  const styles = {
    excellent: 'bg-emerald-100 text-emerald-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-amber-100 text-amber-700'
  }
  const labels = {
    excellent: 'Excellent',
    good: 'Bon',
    fair: 'Correct'
  }
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[condition] || styles.good}`}>
      {labels[condition] || condition}
    </span>
  )
}

function AddEquipmentModal({ userEmail, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    type: 'laptop',
    brand: '',
    model: '',
    condition: 'good',
    age_months: 12,
    price_manual: '',
    description: '',
    photo_url: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await axios.post(
        `${API_URL}/api/marketplace?admin_email=${userEmail}`,
        {
          ...formData,
          price_manual: formData.price_manual ? parseFloat(formData.price_manual) : null,
          photo_url: formData.photo_url || null
        }
      )
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création')
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-luxury-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-lvmh-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-display font-medium">Ajouter un équipement</h2>
          <button onClick={onClose} className="p-2 hover:bg-lvmh-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="label-luxury">Type d'équipement</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="select-luxury"
            >
              {EQUIPMENT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-luxury">Marque</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Dell, Apple..."
                required
                className="input-luxury"
              />
            </div>
            <div>
              <label className="label-luxury">Modèle</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Latitude 5540..."
                required
                className="input-luxury"
              />
            </div>
          </div>

          {/* Condition & Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-luxury">État</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="select-luxury"
              >
                {CONDITIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-luxury">Âge (mois)</label>
              <input
                type="number"
                min="0"
                value={formData.age_months}
                onChange={(e) => setFormData(prev => ({ ...prev, age_months: parseInt(e.target.value) || 0 }))}
                className="input-luxury"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="label-luxury">Prix manuel (€) - optionnel</label>
            <input
              type="number"
              value={formData.price_manual}
              onChange={(e) => setFormData(prev => ({ ...prev, price_manual: e.target.value }))}
              placeholder="Laisser vide pour prix suggéré automatique"
              className="input-luxury"
            />
            <p className="text-xs text-lvmh-gray-400 mt-1">
              Si vide, le prix sera calculé automatiquement
            </p>
          </div>

          {/* Photo URL */}
          <div>
            <label className="label-luxury">URL de la photo - optionnel</label>
            <input
              type="url"
              value={formData.photo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
              placeholder="https://..."
              className="input-luxury"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-luxury">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="État de la batterie, accessoires inclus..."
              rows={3}
              className="input-luxury resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-gold flex-1 flex items-center justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
