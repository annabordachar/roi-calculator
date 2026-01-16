import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Award, Leaf, Download, TreePine, Car, Plane, Share2, Check } from 'lucide-react'

export default function CO2Certificate({ results, userName = "Collaborateur LVMH" }) {
  const [showCertificate, setShowCertificate] = useState(false)
  const [copied, setCopied] = useState(false)
  const certificateRef = useRef(null)

  if (!results || !results.carbon_avoided_kg || results.carbon_avoided_kg <= 0) {
    return null
  }

  const generatePDF = async () => {
    // Create a printable version
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificat Green IT LVMH</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #faf9f7 0%, #f5f4f2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          
          .certificate {
            background: white;
            width: 800px;
            padding: 60px;
            border: 3px solid #b8860b;
            position: relative;
            box-shadow: 0 25px 50px rgba(0,0,0,0.1);
          }
          
          .certificate::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid #b8860b;
            pointer-events: none;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 600;
            letter-spacing: 4px;
            color: #1a1a1a;
          }
          
          .subtitle {
            color: #b8860b;
            font-size: 12px;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-top: 8px;
          }
          
          .title {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            color: #1a1a1a;
            text-align: center;
            margin: 40px 0 20px;
          }
          
          .recipient {
            text-align: center;
            font-size: 24px;
            color: #b8860b;
            font-family: 'Playfair Display', serif;
            margin: 30px 0;
          }
          
          .description {
            text-align: center;
            color: #666;
            font-size: 16px;
            line-height: 1.8;
            max-width: 600px;
            margin: 0 auto 40px;
          }
          
          .impact-box {
            background: linear-gradient(135deg, #f8f6f3 0%, #f0ede8 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          
          .co2-value {
            font-family: 'Playfair Display', serif;
            font-size: 72px;
            font-weight: 700;
            color: #1a1a1a;
          }
          
          .co2-unit {
            font-size: 24px;
            color: #666;
          }
          
          .co2-label {
            color: #b8860b;
            font-size: 14px;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-top: 10px;
          }
          
          .equivalences {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin: 40px 0;
          }
          
          .equiv-item {
            text-align: center;
          }
          
          .equiv-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .equiv-value {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
          }
          
          .equiv-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e5e5e5;
          }
          
          .date {
            color: #999;
            font-size: 14px;
          }
          
          .signature {
            margin-top: 30px;
          }
          
          .signature-line {
            width: 200px;
            border-top: 1px solid #1a1a1a;
            margin: 0 auto 10px;
          }
          
          .signature-name {
            font-size: 14px;
            color: #666;
          }
          
          .badge {
            position: absolute;
            top: -20px;
            right: 40px;
            width: 80px;
            height: 80px;
            background: #b8860b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(184, 134, 11, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="badge">Certifié</div>
          
          <div class="header">
            <div class="logo">LVMH</div>
            <div class="subtitle">Green IT Initiative</div>
          </div>
          
          <div class="title">Certificat d'Impact Environnemental</div>
          
          <div class="recipient">${userName}</div>
          
          <div class="description">
            En choisissant un équipement reconditionné, vous avez contribué à réduire 
            l'empreinte carbone de LVMH et participé à notre engagement pour un futur durable.
          </div>
          
          <div class="impact-box">
            <div class="co2-value">${results.carbon_avoided_kg}<span class="co2-unit"> kg</span></div>
            <div class="co2-label">CO₂ Évités</div>
          </div>
          
          <div class="equivalences">
            <div class="equiv-item">
              <div class="equiv-icon">🚗</div>
              <div class="equiv-value">${Math.round(results.carbon_avoided_kg / 0.21).toLocaleString()}</div>
              <div class="equiv-label">km en voiture</div>
            </div>
            <div class="equiv-item">
              <div class="equiv-icon">🌲</div>
              <div class="equiv-value">${Math.round(results.carbon_avoided_kg / 25)}</div>
              <div class="equiv-label">arbres pendant 1 an</div>
            </div>
            <div class="equiv-item">
              <div class="equiv-icon">✈️</div>
              <div class="equiv-value">${(results.carbon_avoided_kg / 255).toFixed(1)}</div>
              <div class="equiv-label">vols Paris-NYC</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="date">Délivré le ${new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</div>
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">Direction Green IT LVMH</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const shareResults = () => {
    const text = `🌿 J'ai évité ${results.carbon_avoided_kg} kg de CO₂ en choisissant du matériel reconditionné chez LVMH ! C'est l'équivalent de ${Math.round(results.carbon_avoided_kg / 0.21)} km en voiture. #GreenIT #LVMH #Sustainability`
    
    if (navigator.share) {
      navigator.share({
        title: 'Mon impact Green IT LVMH',
        text: text
      })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      {/* Button to show certificate */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowCertificate(true)}
        className="w-full mt-4 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center justify-center space-x-2 text-emerald-700 transition-colors"
      >
        <Award className="w-5 h-5" />
        <span className="font-medium">Obtenir mon Certificat CO₂</span>
      </motion.button>

      {/* Certificate Modal */}
      {showCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCertificate(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Certificate Preview */}
            <div ref={certificateRef} className="p-8 bg-gradient-to-br from-lvmh-cream to-white">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-semibold text-lvmh-black tracking-wider">LVMH</h2>
                <p className="text-xs text-lvmh-gold tracking-widest uppercase mt-1">Green IT Initiative</p>
              </div>

              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-lvmh-gold/10 border-2 border-lvmh-gold flex items-center justify-center">
                  <Award className="w-10 h-10 text-lvmh-gold" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-display text-center text-lvmh-black mb-2">
                Certificat d'Impact Environnemental
              </h3>
              <p className="text-center text-lvmh-gray-500 mb-6">
                Décerné à <span className="font-medium text-lvmh-black">{userName}</span>
              </p>

              {/* Impact Box */}
              <div className="bg-emerald-50 rounded-xl p-6 text-center mb-6 border border-emerald-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-5xl font-display font-bold text-emerald-600">
                  {results.carbon_avoided_kg}
                  <span className="text-2xl ml-2">kg</span>
                </p>
                <p className="text-sm text-emerald-700 mt-2 uppercase tracking-wider">CO₂ Évités</p>
              </div>

              {/* Equivalences */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-lvmh-gray-100 rounded-lg">
                  <Car className="w-6 h-6 text-lvmh-gold mx-auto mb-2" />
                  <p className="text-lg font-bold text-lvmh-black">
                    {Math.round(results.carbon_avoided_kg / 0.21).toLocaleString()}
                  </p>
                  <p className="text-xs text-lvmh-gray-500">km en voiture</p>
                </div>
                <div className="text-center p-4 bg-lvmh-gray-100 rounded-lg">
                  <TreePine className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-lvmh-black">
                    {Math.round(results.carbon_avoided_kg / 25)}
                  </p>
                  <p className="text-xs text-lvmh-gray-500">arbres / an</p>
                </div>
                <div className="text-center p-4 bg-lvmh-gray-100 rounded-lg">
                  <Plane className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-lvmh-black">
                    {(results.carbon_avoided_kg / 255).toFixed(1)}
                  </p>
                  <p className="text-xs text-lvmh-gray-500">vols Paris-NYC</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-center text-sm text-lvmh-gray-600 mb-6">
                En choisissant un équipement reconditionné, vous avez contribué à réduire 
                l'empreinte carbone de LVMH et participé à notre engagement pour un futur durable.
              </p>

              {/* Date */}
              <p className="text-center text-xs text-lvmh-gray-400">
                Délivré le {new Date().toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-lvmh-gray-200 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generatePDF}
                className="flex-1 py-3 bg-lvmh-black text-white rounded-lg flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={shareResults}
                className="flex-1 py-3 bg-lvmh-gold text-white rounded-lg flex items-center justify-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Partager'}</span>
              </motion.button>
            </div>

            {/* Close */}
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-2 hover:bg-lvmh-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
