import { config } from 'dotenv'
import express from 'express'
import OpenAi from 'openai'
import cloudinary from 'cloudinary'
import axios from 'axios'
import FormData from 'form-data'

config()

const openai = new OpenAi({ apiKey: process.env.OPENAI_SECRET })

const router = express.Router()

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
})

router.route('/').get((req, res) => {
  res.status(200).json({
    message: 'Hello from DALLE Routes',
  })
})

// https://removal.ai/my-account/
// https://docs.picsart.io/reference/post_removebg  50 free per month

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    })

    // Use RemoveBG API
    const formData = new FormData()
    formData.append('size', 'auto')
    formData.append('image_url', response.data[0].url)

    const response2 = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVE_BG_API,
      },
      encoding: null,
    })
    res.status(200).json({
      message: 'Success',
      original: response.data[0].url,
      noBg: response2.data,
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
