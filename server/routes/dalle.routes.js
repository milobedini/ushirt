import { config } from 'dotenv'
import express from 'express'
import OpenAi from 'openai'
import { removeBackground } from '@imgly/background-removal-node'
import cloudinary from 'cloudinary'

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

router.route('/create-image').post(async (req, res) => {
  try {
    const { prompt } = req.body
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    })

    const image = response.data[0].url
    res.status(200).json({
      message: 'Image created successfully.',
      originalImg: image,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Error creating image.',
      error: err,
    })
  }
})

router.route('/remove-background').post(async (req, res) => {
  try {
    const { imageUrl } = req.body
    const blob = await removeBackground(imageUrl)
    const blobData = await blob.arrayBuffer()
    const base64Data = Buffer.from(blobData).toString('base64')
    const base64Image = `data:${blob.type};base64,${base64Data}`

    res.status(200).json({
      message: 'Background removed successfully.',
      base64Image: base64Image,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Error removing background.',
      error: err,
    })
  }
})

router.route('/upload-cloudinary').post((req, res) => {
  try {
    const { base64Image } = req.body

    cloudinary.v2.uploader.unsigned_upload(
      base64Image,
      'ilrqnidr',
      {
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error)
          res.status(500).json({
            message: 'Failed to upload to Cloudinary.',
            error,
          })
        } else {
          res.status(200).json({
            message: 'Image uploaded successfully to Cloudinary.',
            imageNoBg: result.url,
          })
        }
      }
    )
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: 'Error uploading image.',
      error: err,
    })
  }
})

export default router
