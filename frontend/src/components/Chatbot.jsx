import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'

const GEMINI_API_KEY = 'AIzaSyDcDj6tJkEI44S4yKCW7GLNlNdN1KLwseg'

// Equipment catalog context for the AI
const EQUIPMENT_CONTEXT = `
You are the Green IT assistant for LVMH. You help employees choose IT equipment responsibly.

LVMH EQUIPMENT CATALOG:

LAPTOPS (Dell Partnership - €1 symbolic price for new):
- Dell Pro 14 (DC14250): €629, 14", 4.5★ - Recommended for office use
- Dell Pro 16 (PC16250): €941, 16", 4.3★ - For creatives and developers
- Dell XPS 13 (9350): €1349, 13.4", 3.6★ - Premium ultra-portable
- Dell Latitude 5540: €899, 15.6" - Versatile enterprise
- Refurbished available at 50% of new price

SMARTPHONES:
- iPhone 15 Pro: €1229 new, €750 refurb - 80kg CO2 new vs 8kg refurb
- iPhone 15: €969 new, €590 refurb
- Samsung Galaxy S24: €899 new, €540 refurb
- Fairphone 5: €699 - Most ecological (45kg CO2)
- Refurbished recommended: 40% savings + 90% CO2 avoided

SCREENS:
- Dell UltraSharp 27" 4K: €599 new, €280 refurb
- Dell Professional 24": €349 new, €160 refurb
- LG 27" 4K: €449 new, €210 refurb
- Lifespan: 72 months

TABLETS:
- iPad Pro 12.9": €1329 new, €800 refurb
- iPad Air: €769 new, €460 refurb
- Samsung Galaxy Tab S9: €949 new, €570 refurb

RECOMMENDATION RULES:
1. Always suggest the refurbished option first
2. Mention CO2 savings (90% less for refurb)
3. For laptops, mention the Dell partnership at €1
4. Adapt recommendation to needs (office, creative, mobile)
5. Give CO2 equivalences (car km, trees)

CO2 EQUIVALENCES:
- 1 new laptop (193kg CO2) = 920 km by car = 8 trees for 1 year
- 1 new smartphone (80kg CO2) = 380 km by car = 3 trees
- 1 new screen (350kg CO2) = 1667 km by car = 14 trees

Always respond in English, concisely and professionally with the LVMH tone (luxury, excellence, responsibility).
Keep responses to 2-3 sentences unless asked for more details.
`

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm the LVMH Green IT assistant. How can I help you choose eco-responsible equipment?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Build conversation history
      const conversationHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: EQUIPMENT_CONTEXT }]
              },
              {
                role: 'model', 
                parts: [{ text: "Compris, je suis l'assistant Green IT LVMH. Je vais aider les collaborateurs à choisir des équipements éco-responsables en recommandant le refurbished en priorité." }]
              },
              ...conversationHistory,
              {
                role: 'user',
                parts: [{ text: userMessage }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        }
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickQuestions = [
    "Best laptop for office work?",
    "Most eco-friendly smartphone?",
    "New vs refurbished difference?",
    "How does Dell partnership work?"
  ]

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-lvmh-black text-white rounded-full shadow-lg flex items-center justify-center z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-lvmh-gold rounded-full flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-lvmh-gray-200"
          >
            {/* Header */}
            <div className="bg-lvmh-black text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-lvmh-gold rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">Assistant Green IT</h3>
                  <p className="text-xs text-lvmh-gray-300">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-lvmh-black' : 'bg-lvmh-gold'}`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${message.role === 'user' ? 'bg-lvmh-black text-white' : 'bg-lvmh-gray-100 text-lvmh-black'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-7 h-7 rounded-full bg-lvmh-gold flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-lvmh-gray-100 p-3 rounded-2xl">
                    <Loader2 className="w-4 h-4 animate-spin text-lvmh-gray-500" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-lvmh-gray-400 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q)
                      }}
                      className="text-xs px-3 py-1.5 bg-lvmh-gray-100 hover:bg-lvmh-gray-200 rounded-full text-lvmh-gray-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-lvmh-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your question..."
                  className="flex-1 px-4 py-2 bg-lvmh-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-lvmh-gold"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-lvmh-black text-white rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
