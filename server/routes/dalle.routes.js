import { config } from 'dotenv'
import express from 'express'
import { OpenAI } from 'openai'

config()

const router = express.Router()

router.route('/').get((req, res) => {
  res.status(200).json({
    message: 'Hello from DALLE Routes',
  })
})

export default router
