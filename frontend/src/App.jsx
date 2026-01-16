import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Calculator, Package, Shield, User, LogOut, Menu, X, BarChart3, GitCompare, UserCircle, Home, Server } from 'lucide-react'
import ROICalculator from './components/ROICalculator'
import Results from './components/Results'
import Marketplace from './components/Marketplace'
import AdminDashboard from './components/AdminDashboard'
import LoginModal from './components/LoginModal'
import FleetDashboard from './components/FleetDashboard'
import Chatbot from './components/Chatbot'
import CompareMode from './components/CompareMode'
import MyImpact from './components/MyImpact'
import Homepage from './components/Homepage'
import ScraperDashboard from './components/ScraperDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    setUser(null)
    if (currentPage === 'admin') {
      setCurrentPage('marketplace')
    }
  }

  const handleLoginRequired = () => {
    setShowLoginModal(true)
  }

  return (
    <div className="min-h-screen bg-lvmh-cream flex flex-col">
      {/* Header */}
      <header className="bg-lvmh-black text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-display font-semibold tracking-wide">LVMH</span>
              <span className="text-lvmh-gray-400 text-sm hidden sm:inline">|</span>
              <span className="text-sm text-lvmh-gray-300 tracking-wider uppercase hidden sm:inline">Green IT</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <NavButton 
                active={currentPage === 'home'}
                onClick={() => setCurrentPage('home')}
                icon={Home}
                label="Home"
              />
              <NavButton 
                active={currentPage === 'calculator'}
                onClick={() => setCurrentPage('calculator')}
                icon={Calculator}
                label="Calculator"
              />
              <NavButton 
                active={currentPage === 'compare'}
                onClick={() => setCurrentPage('compare')}
                icon={GitCompare}
                label="Compare"
              />
              <NavButton 
                active={currentPage === 'myimpact'}
                onClick={() => setCurrentPage('myimpact')}
                icon={UserCircle}
                label="My Impact"
              />
              <NavButton 
                active={currentPage === 'fleet'}
                onClick={() => setCurrentPage('fleet')}
                icon={BarChart3}
                label="Fleet"
              />
              <NavButton 
                active={currentPage === 'marketplace'}
                onClick={() => setCurrentPage('marketplace')}
                icon={Package}
                label="Marketplace"
              />
              {user?.role === 'admin' && (
                <>
                  <NavButton 
                    active={currentPage === 'admin'}
                    onClick={() => setCurrentPage('admin')}
                    icon={Shield}
                    label="Admin"
                  />
                  <NavButton 
                    active={currentPage === 'scraper'}
                    onClick={() => setCurrentPage('scraper')}
                    icon={Server}
                    label="Scraper"
                  />
                </>
              )}
            </nav>

            {/* User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-lvmh-gold/20 flex items-center justify-center">
                      {user.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-lvmh-gold" />
                      ) : (
                        <User className="w-4 h-4 text-lvmh-gold" />
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-lvmh-gray-400">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm tracking-wider hover:text-lvmh-gold transition-colors"
                >
                  Connexion
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pt-4 pb-2 border-t border-lvmh-charcoal mt-4"
              >
                <nav className="space-y-2">
                  <MobileNavButton 
                    active={currentPage === 'home'}
                    onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }}
                    icon={Home}
                    label="Home"
                  />
                  <MobileNavButton 
                    active={currentPage === 'calculator'}
                    onClick={() => { setCurrentPage('calculator'); setMobileMenuOpen(false); }}
                    icon={Calculator}
                    label="Calculator"
                  />
                  <MobileNavButton 
                    active={currentPage === 'compare'}
                    onClick={() => { setCurrentPage('compare'); setMobileMenuOpen(false); }}
                    icon={GitCompare}
                    label="Compare"
                  />
                  <MobileNavButton 
                    active={currentPage === 'myimpact'}
                    onClick={() => { setCurrentPage('myimpact'); setMobileMenuOpen(false); }}
                    icon={UserCircle}
                    label="My Impact"
                  />
                  <MobileNavButton 
                    active={currentPage === 'fleet'}
                    onClick={() => { setCurrentPage('fleet'); setMobileMenuOpen(false); }}
                    icon={BarChart3}
                    label="Fleet Dashboard"
                  />
                  <MobileNavButton 
                    active={currentPage === 'marketplace'}
                    onClick={() => { setCurrentPage('marketplace'); setMobileMenuOpen(false); }}
                    icon={Package}
                    label="Marketplace"
                  />
                  {user?.role === 'admin' && (
                    <>
                      <MobileNavButton 
                        active={currentPage === 'admin'}
                        onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}
                        icon={Shield}
                        label="Admin"
                      />
                      <MobileNavButton 
                        active={currentPage === 'scraper'}
                        onClick={() => { setCurrentPage('scraper'); setMobileMenuOpen(false); }}
                        icon={Server}
                        label="Scraper"
                      />
                    </>
                  )}
                </nav>
                <div className="mt-4 pt-4 border-t border-lvmh-charcoal">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-lvmh-gold/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-lvmh-gold" />
                        </div>
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="text-sm text-lvmh-gray-400"
                      >
                        Déconnexion
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                      className="w-full text-left text-sm py-2"
                    >
                      Connexion
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Homepage onNavigate={setCurrentPage} />
            </motion.div>
          )}

          {currentPage === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CalculatorPage 
                results={results}
                setResults={setResults}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </motion.div>
          )}

          {currentPage === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Marketplace 
                user={user}
                onLoginRequired={handleLoginRequired}
              />
            </motion.div>
          )}

          {currentPage === 'admin' && user?.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard user={user} />
            </motion.div>
          )}

          {currentPage === 'fleet' && (
            <motion.div
              key="fleet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FleetDashboard />
            </motion.div>
          )}

          {currentPage === 'compare' && (
            <motion.div
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CompareMode />
            </motion.div>
          )}

          {currentPage === 'myimpact' && (
            <motion.div
              key="myimpact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <MyImpact />
            </motion.div>
          )}

          {currentPage === 'scraper' && user?.role === 'admin' && (
            <motion.div
              key="scraper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScraperDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="bg-lvmh-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-display">LVMH</span>
              <span className="text-lvmh-gray-500 text-sm ml-3">Green IT Initiative</span>
            </div>
            <div className="text-sm text-lvmh-gray-500">
              © 2024 LVMH. Sustainable Technology Investment Analysis.
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLogin={(userData) => setUser(userData)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 text-sm tracking-wider transition-colors ${
        active ? 'text-lvmh-gold' : 'text-lvmh-gray-300 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  )
}

function MobileNavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 py-3 px-2 rounded transition-colors ${
        active ? 'bg-lvmh-gold/10 text-lvmh-gold' : 'text-lvmh-gray-300'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}

function CalculatorPage({ results, setResults, isLoading, setIsLoading }) {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-lvmh-black text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center space-x-2 mb-6">
              <Leaf className="w-5 h-5 text-lvmh-gold" />
              <span className="text-lvmh-gold text-sm tracking-widest uppercase">Sustainable Technology</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-medium leading-tight mb-6">
              Green IT ROI
              <br />
              <span className="text-lvmh-gold">Calculator</span>
            </h1>
            <div className="w-16 h-0.5 bg-lvmh-gold mb-6"></div>
            <p className="text-lg text-lvmh-gray-300 leading-relaxed max-w-xl">
              Make informed decisions on IT equipment purchases. Compare financial 
              and environmental impact between new and refurbished options.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16" id="calculator">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ROICalculator 
              onResults={setResults} 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {results ? (
                <Results key="results" results={results} />
              ) : (
                <EmptyState key="empty" />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white shadow-lg p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center rounded-lg"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Calculator className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-display text-gray-500 mb-2">Ready to Analyze</h3>
      <p className="text-sm text-gray-400 max-w-xs">
        Configure your investment parameters and calculate the ROI to see detailed results here.
      </p>
    </motion.div>
  )
}

export default App
