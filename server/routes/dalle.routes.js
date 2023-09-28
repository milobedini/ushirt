import { config } from 'dotenv'
import express from 'express'
import OpenAi from 'openai'

config()

const openai = new OpenAi({ apiKey: process.env.OPENAI_SECRET })

const router = express.Router()

router.route('/').get((req, res) => {
  res.status(200).json({
    message: 'Hello from DALLE Routes',
  })
})

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    })

    console.log(prompt, response)

    const image = response.data[0].b64_json

    res.status(200).json({
      message: 'Image generated successfully.',
      image,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Something went wrong.',
      error: err,
    })
  }
})

export default router
