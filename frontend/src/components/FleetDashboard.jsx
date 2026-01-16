import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, Smartphone, Tablet, Laptop, Phone, Router, Tv,
  TrendingUp, Leaf, DollarSign, Recycle, TreePine, Car, Plane, Lightbulb
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart
} from 'recharts'

// LVMH Fleet Data
const FLEET_DATA = [
  { id: 'laptop', name: 'Laptops', count: 1000, icon: Laptop, co2_unit: 193, price_unit: 1000 },
  { id: 'smartphone', name: 'Smartphones', count: 1000, icon: Smartphone, co2_unit: 80, price_unit: 800 },
  { id: 'screen', name: 'Screens', count: 600, icon: Monitor, co2_unit: 350, price_unit: 500 },
  { id: 'tablet', name: 'Tablets', count: 100, icon: Tablet, co2_unit: 63, price_unit: 600 },
  { id: 'switch_router', name: 'Switch/Router', count: 100, icon: Router, co2_unit: 60, price_unit: 800 },
  { id: 'landline_phone', name: 'Phones', count: 500, icon: Phone, co2_unit: 20, price_unit: 200 },
  { id: 'refurbished_smartphone', name: 'Refurb Smartphones', count: 100, icon: Smartphone, co2_unit: 8, price_unit: 400, isRefurb: true },
  { id: 'refurbished_screen', name: 'Refurb Screens', count: 250, icon: Monitor, co2_unit: 35, price_unit: 250, isRefurb: true },
  { id: 'refurbished_switch_router', name: 'Refurb Switch', count: 300, icon: Router, co2_unit: 6, price_unit: 350, isRefurb: true },
  { id: 'meeting_room_screen', name: 'Meeting Screens', count: 200, icon: Tv, co2_unit: 500, price_unit: 2000 },
]

const COLORS = ['#1a1a1a', '#b8860b', '#2d2d2d', '#d4af37', '#4a4a4a', '#8b7355', '#3d3d3d', '#c9a227', '#5c5c5c', '#a08050']

// CO2 Equivalences
const CO2_EQUIVALENCES = {
  car_km: 0.21,        // 1 kg CO2 = 0.21 km en voiture (ou 1 km = 4.76 kg CO2... non, c'est l'inverse: 1 km = 0.21 kg, donc 1 kg = 4.76 km)
  tree_year: 25,       // 1 arbre absorbe 25 kg CO2/an
  plane_km: 0.255,     // 1 km avion = 0.255 kg CO2
  light_hours: 0.01,   // 1 heure ampoule LED = 0.01 kg CO2
  smartphone_charges: 0.008, // 1 charge = 0.008 kg CO2
}

export default function FleetDashboard() {
  const [selectedView, setSelectedView] = useState('overview')
  const [simulationMode, setSimulationMode] = useState(false)
  const [refurbRate, setRefurbRate] = useState(30) // % of fleet refurbished

  // Calculate totals
  const totalDevices = FLEET_DATA.reduce((sum, item) => sum + item.count, 0)
  const totalCO2 = FLEET_DATA.reduce((sum, item) => sum + (item.count * item.co2_unit), 0)
  const totalValue = FLEET_DATA.reduce((sum, item) => sum + (item.count * item.price_unit), 0)
  const refurbDevices = FLEET_DATA.filter(i => i.isRefurb).reduce((sum, item) => sum + item.count, 0)
  const refurbPercent = ((refurbDevices / totalDevices) * 100).toFixed(1)

  // Calculate potential savings if more refurbished
  const potentialCO2Savings = FLEET_DATA
    .filter(i => !i.isRefurb)
    .reduce((sum, item) => sum + (item.count * item.co2_unit * 0.9 * (refurbRate / 100)), 0)

  const potentialFinancialSavings = FLEET_DATA
    .filter(i => !i.isRefurb)
    .reduce((sum, item) => sum + (item.count * item.price_unit * 0.5 * (refurbRate / 100)), 0)

  // Data for charts
  const pieData = FLEET_DATA.map(item => ({
    name: item.name,
    value: item.count,
    co2: item.count * item.co2_unit
  }))

  const co2ByCategory = FLEET_DATA.map(item => ({
    name: item.name.replace('Refurb ', '').slice(0, 8),
    co2: Math.round(item.count * item.co2_unit / 1000), // in tonnes
    isRefurb: item.isRefurb
  }))

  const monthlyTrend = [
    { month: 'Jan', new: 85, refurb: 15, co2: 450 },
    { month: 'Feb', new: 80, refurb: 20, co2: 420 },
    { month: 'Mar', new: 75, refurb: 25, co2: 390 },
    { month: 'Apr', new: 72, refurb: 28, co2: 365 },
    { month: 'May', new: 68, refurb: 32, co2: 340 },
    { month: 'Jun', new: 65, refurb: 35, co2: 310 },
  ]

  return (
    <div className="min-h-screen bg-[#f8f7f5] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
            Environmental Monitoring
          </p>
          <h1 className="text-4xl font-display font-medium text-lvmh-black mb-2">
            FLEET <span className="italic">DASHBOARD</span>
          </h1>
          <p className="text-lvmh-gray-500">
            Overview of LVMH IT equipment fleet and environmental impact
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            icon={Monitor}
            label="Total Devices"
            value={totalDevices.toLocaleString()}
            sublabel="across all categories"
          />
          <KPICard
            icon={Leaf}
            label="Carbon Footprint"
            value={`${(totalCO2 / 1000).toFixed(0)}t`}
            sublabel="CO₂e total"
            highlight
          />
          <KPICard
            icon={DollarSign}
            label="Fleet Value"
            value={`€${(totalValue / 1000000).toFixed(1)}M`}
            sublabel="total investment"
          />
          <KPICard
            icon={Recycle}
            label="Refurbished"
            value={`${refurbPercent}%`}
            sublabel={`${refurbDevices} devices`}
            highlight
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fleet Composition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
              Fleet <span className="italic">Composition</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} units`, name]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* CO2 by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-luxury"
          >
            <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
              CO₂ Impact by Category (tonnes)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={co2ByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => [`${value}t CO₂e`]}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="co2" 
                  fill="#b8860b"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-luxury mb-8"
        >
          <h3 className="text-lg font-display font-medium text-lvmh-black mb-4">
            Refurbishment Adoption Trend (2024)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="new" 
                stackId="1"
                stroke="#1a1a1a" 
                fill="#1a1a1a" 
                name="New (%)"
              />
              <Area 
                type="monotone" 
                dataKey="refurb" 
                stackId="1"
                stroke="#b8860b" 
                fill="#b8860b" 
                name="Refurbished (%)"
              />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* CO2 Equivalences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-luxury mb-8"
        >
          <h3 className="text-lg font-display font-medium text-lvmh-black mb-2">
            Environmental Impact Equivalences
          </h3>
          <p className="text-sm text-lvmh-gray-500 mb-6">
            Your fleet's {(totalCO2 / 1000).toFixed(0)} tonnes of CO₂e is equivalent to:
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <EquivalenceCard
              icon={Car}
              value={Math.round(totalCO2 / 0.21).toLocaleString()}
              unit="km"
              label="driven by car"
            />
            <EquivalenceCard
              icon={TreePine}
              value={Math.round(totalCO2 / 25).toLocaleString()}
              unit="trees"
              label="needed for 1 year"
            />
            <EquivalenceCard
              icon={Plane}
              value={Math.round(totalCO2 / 0.255 / 1000).toLocaleString()}
              unit="flights"
              label="Paris → New York"
            />
            <EquivalenceCard
              icon={Lightbulb}
              value={Math.round(totalCO2 / 0.01 / 1000).toLocaleString()}
              unit="k hours"
              label="LED bulb usage"
            />
          </div>
        </motion.div>

        {/* Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-luxury border-2 border-dashed border-lvmh-gold/30"
        >
          <h3 className="text-lg font-display font-medium text-lvmh-black mb-2">
            🎯 Impact Simulation
          </h3>
          <p className="text-sm text-lvmh-gray-500 mb-6">
            What if we increased our refurbished equipment rate?
          </p>

          <div className="mb-6">
            <label className="label-luxury">Target Refurbishment Rate: {refurbRate}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={refurbRate}
              onChange={(e) => setRefurbRate(parseInt(e.target.value))}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-lvmh-gray-400 mt-1">
              <span>0% (all new)</span>
              <span>50%</span>
              <span>100% (all refurb)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-2 mb-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">CO₂ Avoided</span>
              </div>
              <p className="text-2xl font-display font-bold text-emerald-600">
                {(potentialCO2Savings / 1000).toFixed(0)} tonnes
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                = {Math.round(potentialCO2Savings / 25).toLocaleString()} trees for 1 year
              </p>
            </div>

            <div className="p-4 bg-lvmh-gold/10 rounded-lg border border-lvmh-gold/30">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-lvmh-gold" />
                <span className="text-sm font-medium text-lvmh-black">Financial Savings</span>
              </div>
              <p className="text-2xl font-display font-bold text-lvmh-gold">
                €{(potentialFinancialSavings / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-lvmh-gray-600 mt-1">
                potential budget reduction
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, sublabel, highlight }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl ${highlight ? 'bg-lvmh-gold/10 border border-lvmh-gold/30' : 'bg-white border border-lvmh-gray-200'}`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Icon className={`w-4 h-4 ${highlight ? 'text-lvmh-gold' : 'text-lvmh-gray-500'}`} />
        <span className="text-xs text-lvmh-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-display font-semibold text-lvmh-black">{value}</p>
      <p className="text-xs text-lvmh-gray-400 mt-1">{sublabel}</p>
    </motion.div>
  )
}

function EquivalenceCard({ icon: Icon, value, unit, label }) {
  return (
    <div className="p-4 bg-lvmh-gray-100 rounded-lg text-center">
      <Icon className="w-8 h-8 text-lvmh-gold mx-auto mb-2" />
      <p className="text-xl font-display font-bold text-lvmh-black">
        {value} <span className="text-sm font-normal">{unit}</span>
      </p>
      <p className="text-xs text-lvmh-gray-500 mt-1">{label}</p>
    </div>
  )
}
