import { motion } from 'framer-motion'
import { ArrowRight, Leaf, Recycle, BarChart3, Shield, Play } from 'lucide-react'

export default function Homepage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.prismic.io/lvmh-com/ZlRN6Ck0V36pXpd3_engagement_environnementheader.jpg?auto=format%2Ccompress&fit=max&w=3840"
            alt="LVMH Environment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
                Sustainable Technology Initiative
              </p>
              <h1 className="text-5xl md:text-7xl font-display text-white leading-tight mb-6">
                GREEN <span className="italic text-lvmh-gold">IT</span>
              </h1>
              <div className="w-20 h-0.5 bg-lvmh-gold mb-6" />
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Empowering LVMH employees to make sustainable IT choices. 
                Reduce environmental impact while optimizing costs through 
                refurbished equipment and smart leasing options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('calculator')}
                  className="px-8 py-4 bg-lvmh-gold text-white font-medium tracking-wider hover:bg-lvmh-goldDark transition-colors flex items-center justify-center space-x-2"
                >
                  <span>START CALCULATING</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate('fleet')}
                  className="px-8 py-4 border border-white/30 text-white font-medium tracking-wider hover:bg-white/10 transition-colors"
                >
                  VIEW FLEET DASHBOARD
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-lvmh-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
              Discover Our Mission
            </p>
            <h2 className="text-4xl font-display text-white">
              THE <span className="italic text-lvmh-gold">LIFE 360</span> PROGRAM
            </h2>
          </div>
          
          {/* Video Player */}
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
            <video 
              className="w-full h-full object-cover"
              controls
              poster="https://images.prismic.io/lvmh-com/Zk3H9Sol0Zci9WNZ_climat02.png?auto=format%2Ccompress&fit=max&w=3840"
            >
              <source src="/video.mov" type="video/quicktime" />
              <source src="/video.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <p className="text-center text-white/60 text-sm mt-6">
            Learn about LVMH's environmental commitment through the LIFE 360 program
          </p>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-20 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
              Our Impact
            </p>
            <h2 className="text-4xl font-display text-lvmh-black">
              KEY <span className="italic">FIGURES</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="90%" label="CO₂ reduction with refurbished" />
            <StatCard number="50%" label="Cost savings vs. new" />
            <StatCard number="4,000+" label="Devices in fleet" />
            <StatCard number="€2M+" label="Annual savings potential" />
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
              Our Approach
            </p>
            <h2 className="text-4xl font-display text-lvmh-black">
              STRATEGIC <span className="italic">PILLARS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PillarCard
              image="https://images.prismic.io/lvmh-com/ZlRTsyk0V36pXphY_environnement_e%CC%81conomiecirculaire.jpg?auto=format%2Ccompress&fit=max&w=800"
              title="CREATIVE CIRCULARITY"
              description="Extend equipment life through refurbishment, repair, and internal reuse programs."
              onClick={() => onNavigate('marketplace')}
            />
            <PillarCard
              image="https://images.prismic.io/lvmh-com/ZlRTiCk0V36pXphJ_environnement_biodiversite%CC%81.jpg?auto=format%2Ccompress&fit=max&w=800"
              title="CARBON REDUCTION"
              description="Reduce IT carbon footprint by 90% through sustainable equipment choices."
              onClick={() => onNavigate('calculator')}
            />
            <PillarCard
              image="https://images.prismic.io/lvmh-com/ZlRUjCk0V36pXphw_environnement_climat.jpg?auto=format%2Ccompress&fit=max&w=800"
              title="COST OPTIMIZATION"
              description="Save up to 50% on IT equipment with Dell partnership and refurbished options."
              onClick={() => onNavigate('compare')}
            />
            <PillarCard
              image="https://images.prismic.io/lvmh-com/ZlRRjik0V36pXpf3_environnement_trac%CC%A7abilite%CC%81ettransparence.jpg?auto=format%2Ccompress&fit=max&w=800"
              title="TRANSPARENCY"
              description="Track your personal environmental impact and earn sustainability badges."
              onClick={() => onNavigate('myimpact')}
            />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-lvmh-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-0.5 bg-lvmh-gold mx-auto mb-8" />
          <blockquote className="text-2xl md:text-3xl font-display text-white italic leading-relaxed mb-8">
            "Environmental challenges can only be met collectively, with public and private institutions, 
            scientists, NGOs, and industry peers working together."
          </blockquote>
          <p className="text-lvmh-gold font-medium">Hélène Valade</p>
          <p className="text-white/60 text-sm">Environment Development Director, LVMH</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
              Platform Features
            </p>
            <h2 className="text-4xl font-display text-lvmh-black">
              OUR <span className="italic">TOOLS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={BarChart3}
              title="ROI Calculator"
              description="Compare financial and environmental impact of your IT choices"
              onClick={() => onNavigate('calculator')}
            />
            <FeatureCard
              icon={Recycle}
              title="Marketplace"
              description="Browse and reserve refurbished equipment from internal inventory"
              onClick={() => onNavigate('marketplace')}
            />
            <FeatureCard
              icon={Leaf}
              title="My Impact"
              description="Track your personal contribution to LVMH's sustainability goals"
              onClick={() => onNavigate('myimpact')}
            />
            <FeatureCard
              icon={Shield}
              title="Fleet Dashboard"
              description="View company-wide IT fleet statistics and environmental metrics"
              onClick={() => onNavigate('fleet')}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2">
              <p className="text-lvmh-gold text-sm tracking-[0.3em] uppercase mb-4">
                Get Started
              </p>
              <h2 className="text-4xl font-display text-lvmh-black mb-4">
                MAKE YOUR FIRST <span className="italic">SUSTAINABLE</span> CHOICE
              </h2>
              <p className="text-lvmh-gray-600 leading-relaxed">
                Use our ROI calculator to discover the financial and environmental benefits 
                of choosing refurbished equipment. Every choice counts towards our LIFE 360 objectives.
              </p>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('calculator')}
                className="px-12 py-5 bg-lvmh-black text-white font-medium tracking-wider hover:bg-lvmh-charcoal transition-colors flex items-center space-x-3"
              >
                <span>OPEN CALCULATOR</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ number, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <p className="text-4xl md:text-5xl font-display font-semibold text-lvmh-black mb-2">
        {number}
      </p>
      <p className="text-lvmh-gray-600 text-sm">{label}</p>
    </motion.div>
  )
}

function PillarCard({ image, title, description, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative h-64 overflow-hidden mb-4">
        <img 
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
      </div>
      <h3 className="text-sm font-medium tracking-wider text-lvmh-black mb-2">
        {title.split(' ')[0]} <span className="italic">{title.split(' ').slice(1).join(' ')}</span>
      </h3>
      <p className="text-sm text-lvmh-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, description, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="p-6 border border-lvmh-gray-200 hover:border-lvmh-gold transition-colors cursor-pointer group"
    >
      <div className="w-12 h-12 bg-lvmh-gold/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-lvmh-gold/20 transition-colors">
        <Icon className="w-6 h-6 text-lvmh-gold" />
      </div>
      <h3 className="text-lg font-medium text-lvmh-black mb-2">{title}</h3>
      <p className="text-sm text-lvmh-gray-600 leading-relaxed">{description}</p>
      <div className="flex items-center space-x-2 mt-4 text-lvmh-gold text-sm font-medium">
        <span>Learn more</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  )
}
