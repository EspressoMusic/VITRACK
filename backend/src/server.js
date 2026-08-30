import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { analyzeFoodImage, analyzeFoodText } from './analyzeFood.js'
import { identifyFood } from './identifyFood.js'
import { askNutritionBot } from './nutritionChat.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) })
})

app.post('/api/analyze', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Server is missing OPENAI_API_KEY. Add it to backend/.env and restart the server.',
    })
  }

  const { image, foodName, quantity } = req.body || {}

  try {
    let result
    if (typeof image === 'string' && image.startsWith('data:image/')) {
      result = await analyzeFoodImage(image)
    } else if (typeof foodName === 'string' && foodName.trim()) {
      result = await analyzeFoodText(foodName, quantity)
    } else {
      return res.status(400).json({ error: 'Request body must include an "image" data URL or a "foodName".' })
    }
    res.json(result)
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(err.status || 500).json({ error: err.message || 'Analysis failed.' })
  }
})

app.post('/api/identify-food', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Server is missing OPENAI_API_KEY. Add it to backend/.env and restart the server.',
    })
  }

  const { image } = req.body || {}
  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Request body must include an "image" data URL.' })
  }

  try {
    const result = await identifyFood(image)
    res.json(result)
  } catch (err) {
    console.error('Food identification failed:', err)
    res.status(err.status || 500).json({ error: err.message || 'Food identification failed.' })
  }
})

app.post('/api/nutrition-chat', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Server is missing OPENAI_API_KEY. Add it to backend/.env and restart the server.',
    })
  }

  const { messages, lang } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty "messages" array.' })
  }

  const history = messages
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .slice(-10)

  try {
    const result = await askNutritionBot(history, lang || 'en')
    res.json(result)
  } catch (err) {
    console.error('Nutrition chat failed:', err)
    res.status(err.status || 500).json({ error: err.message || 'Nutrition chat failed.' })
  }
})

app.listen(PORT, () => {
  console.log(`Vitrack backend listening on http://localhost:${PORT}`)
})
