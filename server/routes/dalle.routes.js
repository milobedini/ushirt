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

router.route('/').post(async (req, res) => {
  try {
    const { prompt } = req.body
    const response = await openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    })

    const image = response.data[0].url

    const blob = await removeBackground(image)
    const blobData = await blob.arrayBuffer()
    const base64Data = Buffer.from(blobData).toString('base64')
    const base64Image = `data:${blob.type};base64,${base64Data}`

    // imageStream.pipe(
    cloudinary.v2.uploader.unsigned_upload(
      base64Image,
      'ilrqnidr',
      {
        resource_type: 'image',
      },

      (error, result) => {
        if (error) {
          console.log(error)
          console.error('Error uploading to Cloudinary:', error)
          res.status(500).json({
            message: 'Failed to upload to Cloudinary.',
            error,
          })
        } else {
          res.status(200).json({
            message: 'Image uploaded successfully to Cloudinary.',
            imageNoBg: result.url,
            originalImg: image,
          })
        }
      }
    )
  } catch (err) {
    console.log(err)
    console.error(err)
    res.status(500).json({
      message: 'Something went wrong.',
      error: err,
    })
  }
})

export default router
