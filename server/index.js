import { config } from 'dotenv'
import express from 'express'
import cors from 'cors'
import dalleRoutes from './routes/dalle.routes.js'

config()

const app = express()
app.use(cors())
app.use(
  express.json({
    limit: '50mb',
  })
)
app.use('/api/v1/dalle', dalleRoutes)

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Helllo from DALLE',
  })
})

app.listen(8080, () => console.log('Server running on port 8080'))
