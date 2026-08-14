import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { analyzeFoodImage } from './analyzeFood.js'

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

  const { image } = req.body || {}
  if (typeof image !== 'string' || !image.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Request body must include an "image" data URL.' })
  }

  try {
    const result = await analyzeFoodImage(image)
    res.json(result)
  } catch (err) {
    console.error('Analysis failed:', err)
    res.status(err.status || 500).json({ error: err.message || 'Analysis failed.' })
  }
})

app.listen(PORT, () => {
  console.log(`Vitrack backend listening on http://localhost:${PORT}`)
})
