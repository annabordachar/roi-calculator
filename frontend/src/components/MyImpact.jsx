import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Leaf, DollarSign, TrendingUp, Award, Calendar, 
  Car, TreePine, Plane, Target, Trophy, Trash2, Plus
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#b8860b', '#1a1a1a', '#059669', '#d97706']

// Get impact data from localStorage
const getImpactData = () => {
  const data = localStorage.getItem('lvmh_green_it_impact')
  if (data) {
    return JSON.parse(data)
  }
  return {
    choices: [],
    totalCO2Saved: 0,
    totalMoneySaved: 0,
    totalEquipment: 0
  }
}

// Save impact data to localStorage
const saveImpactData = (data) => {
  localStorage.setItem('lvmh_green_it_impact', JSON.stringify(data))
}

// Add a new choice to impact data
export const addImpactChoice = (choice) => {
  const data = getImpactData()
  const newChoice = {
    id: Date.now(),
    date: new Date().toISOString(),
    equipment: choice.equipment_name,
    type: choice.recommendation,
    co2Saved: choice.carbon_avoided_kg || 0,
    moneySaved: choice.tco_savings || (choice.price_new - (choice.price_refurb || choice.price_new)),
    quantity: choice.quantity || 1
  }
  
  data.choices.push(newChoice)
  data.totalCO2Saved += newChoice.co2Saved * newChoice.quantity
  data.totalMoneySaved += newChoice.moneySaved * newChoice.quantity
  data.totalEquipment += newChoice.quantity
  
  saveImpactData(data)
  return data
}

export default function MyImpact() {
  const [impactData, setImpactData] = useState(getImpactData())
  const [yearlyGoal] = useState({ co2: 500, money: 5000 }) // Yearly goals

  useEffect(() => {
    // Listen for storage changes (if user adds impact from another tab/component)
    const handleStorageChange = () => {
      setImpactData(getImpactData())
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for updates
    const interval = setInterval(() => {
      setImpactData(getImpactData())
    }, 2000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your history?')) {
      const emptyData = {
        choices: [],
        totalCO2Saved: 0,
        totalMoneySaved: 0,
        totalEquipment: 0
      }
      saveImpactData(emptyData)
      setImpactData(emptyData)
    }
  }

  // Calculate monthly data for chart
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    
    const monthlyData = months.map((month, index) => ({
      month,
      co2: 0,
      money: 0
    }))
    
    impactData.choices.forEach(choice => {
      const date = new Date(choice.date)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        monthlyData[monthIndex].co2 += choice.co2Saved * choice.quantity
        monthlyData[monthIndex].money += choice.moneySaved * choice.quantity
      }
    })
    
    return monthlyData
  }

  // Calculate equipment type distribution
  const getEquipmentDistribution = () => {
    const distribution = {}
    impactData.choices.forEach(choice => {
      const type = choice.equipment || 'Other'
      distribution[type] = (distribution[type] || 0) + choice.quantity
    })
    
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
      value
    }))
  }

  const co2Progress = Math.min((impactData.totalCO2Saved / yearlyGoal.co2) * 100, 100)
  const moneyProgress = Math.min((impactData.totalMoneySaved / yearlyGoal.money) * 100, 100)

  return (
    <div className="min-h-screen bg-[#f8f7f5] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-2">
              Personal Dashboard
            </p>
            <h1 className="text-4xl font-display font-medium text-lvmh-black">
              MY IMPACT <span className="italic">{new Date().getFullYear()}</span>
            </h1>
            <p className="text-lvmh-gray-500 mt-2">
              Your contribution to LVMH's Green IT initiative
            </p>
          </div>
          {impactData.choices.length > 0 && (
            <button
              onClick={clearAllData}
              className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear history</span>
            </button>
          )}
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            icon={Leaf}
            label="CO₂ Avoided"
            value={`${impactData.totalCO2Saved.toFixed(0)} kg`}
            progress={co2Progress}
            goal={`Goal: ${yearlyGoal.co2} kg`}
            color="emerald"
          />
          <KPICard
            icon={DollarSign}
            label="Savings"
            value={`€${impactData.totalMoneySaved.toLocaleString()}`}
            progress={moneyProgress}
            goal={`Goal: €${yearlyGoal.money.toLocaleString()}`}
            color="gold"
          />
          <KPICard
            icon={Award}
            label="Equipment"
            value={impactData.totalEquipment}
            subtitle="sustainable choices"
            color="black"
          />
          <KPICard
            icon={Trophy}
            label="Level"
            value={getLevel(impactData.totalCO2Saved)}
            subtitle={getNextLevelInfo(impactData.totalCO2Saved)}
            color="gold"
          />
        </div>

        {/* CO2 Equivalences */}
        {impactData.totalCO2Saved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
              Your Impact <span className="italic">Equals</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <EquivalenceCard
                icon={Car}
                value={Math.round(impactData.totalCO2Saved / 0.21).toLocaleString()}
                unit="km"
                label="of car travel avoided"
              />
              <EquivalenceCard
                icon={TreePine}
                value={Math.round(impactData.totalCO2Saved / 25)}
                unit="trees"
                label="planted for 1 year"
              />
              <EquivalenceCard
                icon={Plane}
                value={(impactData.totalCO2Saved / 255).toFixed(1)}
                unit="flights"
                label="Paris-NYC avoided"
              />
            </div>
          </motion.div>
        )}

        {/* Charts */}
        {impactData.choices.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Evolution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
                Monthly <span className="italic">Evolution</span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'co2' ? `${value} kg CO₂` : `€${value}`,
                      name === 'co2' ? 'CO₂ avoided' : 'Savings'
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="co2" 
                    stroke="#059669" 
                    fill="#059669" 
                    fillOpacity={0.3}
                    name="co2"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Equipment Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
                Equipment <span className="italic">Distribution</span>
              </h3>
              {getEquipmentDistribution().length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={getEquipmentDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {getEquipmentDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-lvmh-gray-400">
                  No data
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Recent Choices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
            Choice <span className="italic">History</span>
          </h3>
          
          {impactData.choices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-lvmh-gray-100 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-lvmh-gray-400" />
              </div>
              <h4 className="text-lg font-display text-lvmh-gray-500 mb-2">
                No choices recorded
              </h4>
              <p className="text-sm text-lvmh-gray-400 max-w-md mx-auto">
                Use the ROI calculator and confirm your equipment choices to see your impact here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {impactData.choices.slice().reverse().slice(0, 10).map((choice) => (
                <div 
                  key={choice.id}
                  className="flex items-center justify-between p-4 bg-lvmh-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      choice.type === 'Buy Refurbished' ? 'bg-emerald-100' :
                      choice.type === 'Lease' ? 'bg-amber-100' : 'bg-lvmh-gray-200'
                    }`}>
                      <Leaf className={`w-5 h-5 ${
                        choice.type === 'Buy Refurbished' ? 'text-emerald-600' :
                        choice.type === 'Lease' ? 'text-amber-600' : 'text-lvmh-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-lvmh-black">
                        {choice.equipment} {choice.quantity > 1 ? `×${choice.quantity}` : ''}
                      </p>
                      <p className="text-xs text-lvmh-gray-500">
                        {new Date(choice.date).toLocaleDateString('en-US')} • {choice.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-emerald-600">
                      -{choice.co2Saved * choice.quantity} kg CO₂
                    </p>
                    <p className="text-xs text-lvmh-gray-500">
                      €{(choice.moneySaved * choice.quantity).toLocaleString()} saved
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-8"
        >
          <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
            Your <span className="italic">Badges</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Badge 
              icon="🌱" 
              name="First Seed" 
              description="First sustainable choice"
              unlocked={impactData.totalEquipment >= 1}
            />
            <Badge 
              icon="🌿" 
              name="Eco Warrior" 
              description="5 sustainable equipment"
              unlocked={impactData.totalEquipment >= 5}
            />
            <Badge 
              icon="🌳" 
              name="Green Champion" 
              description="100 kg CO₂ avoided"
              unlocked={impactData.totalCO2Saved >= 100}
            />
            <Badge 
              icon="🏆" 
              name="Planet Hero" 
              description="500 kg CO₂ avoided"
              unlocked={impactData.totalCO2Saved >= 500}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, progress, goal, subtitle, color }) {
  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-50',
    gold: 'text-lvmh-gold bg-lvmh-gold/10',
    black: 'text-lvmh-black bg-lvmh-gray-100'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl p-5 shadow-luxury"
    >
      <div className="flex items-center space-x-2 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-lvmh-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-semibold text-lvmh-black mb-1">{value}</p>
      {progress !== undefined && (
        <div className="mt-2">
          <div className="h-1.5 bg-lvmh-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-lvmh-gold'}`}
            />
          </div>
          <p className="text-xs text-lvmh-gray-400 mt-1">{goal}</p>
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-lvmh-gray-400">{subtitle}</p>
      )}
    </motion.div>
  )
}

function EquivalenceCard({ icon: Icon, value, unit, label }) {
  return (
    <div className="text-center p-4 bg-emerald-50 rounded-lg">
      <Icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
      <p className="text-2xl font-display font-bold text-emerald-700">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
      <p className="text-xs text-emerald-600 mt-1">{label}</p>
    </div>
  )
}

function Badge({ icon, name, description, unlocked }) {
  return (
    <div className={`text-center p-4 rounded-lg border-2 transition-all ${
      unlocked 
        ? 'bg-lvmh-gold/10 border-lvmh-gold' 
        : 'bg-lvmh-gray-100 border-lvmh-gray-200 opacity-50'
    }`}>
      <span className="text-3xl">{icon}</span>
      <p className={`font-medium mt-2 ${unlocked ? 'text-lvmh-black' : 'text-lvmh-gray-400'}`}>
        {name}
      </p>
      <p className="text-xs text-lvmh-gray-500 mt-1">{description}</p>
      {unlocked && (
        <span className="inline-block mt-2 text-xs bg-lvmh-gold text-white px-2 py-0.5 rounded-full">
          Unlocked!
        </span>
      )}
    </div>
  )
}

function getLevel(co2Saved) {
  if (co2Saved >= 500) return '🏆 Planet Hero'
  if (co2Saved >= 200) return '🌳 Green Champion'
  if (co2Saved >= 100) return '🌿 Eco Warrior'
  if (co2Saved >= 50) return '🌱 Green Starter'
  return '🌱 Beginner'
}

function getNextLevelInfo(co2Saved) {
  if (co2Saved >= 500) return 'Maximum level reached!'
  if (co2Saved >= 200) return `${500 - co2Saved} kg to Planet Hero`
  if (co2Saved >= 100) return `${200 - co2Saved} kg to Green Champion`
  if (co2Saved >= 50) return `${100 - co2Saved} kg to Eco Warrior`
  return `${50 - co2Saved} kg to Green Starter`
}
