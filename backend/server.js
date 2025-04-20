const express = require('express')
const app = express()
const port = 7777
const cors = require('cors')
const axios = require('axios')
const dotenv = require('dotenv')

app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));


async function getPredictionStatus (id) {
  const response = await axios.get(
    'https://api.replicate.com/v1/predictions/' + id,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`
      }
    }
  )
  const prediction = response.data
  return prediction
}

async function createImagePrediction (text) {
  const response = await axios.post(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro-ultra/predictions',
    {
      input: { prompt: text }
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const prediction = response.data
  return prediction
}

async function createPrediction (image_original, prompt) {
  // const response = await axios.post(
  //   'https://api.replicate.com/v1/predictions',
  //   {
  //     version:
  //       '9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772',
  //     input: { prompt: prompt, subject: image_original, number_of_outputs:1, output_quality: 100 }
  //   },
  //   {
  //     headers: {
  //       Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
  //       'Content-Type': 'application/json'
  //     }
  //   }
  // )

  const response = await axios.post(
    'https://api.replicate.com/v1/predictions',
    {
      version:
        '8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b',
      input: { width: 896, 
       height: 1152,
       prompt: prompt,
       main_face_image: image_original,
       negative_prompt: "bad quality, worst quality, text, signature, watermark, extra limbs, low resolution, partially rendered objects, deformed or partially rendered eyes, deformed, deformed eyeballs, cross-eyed, blurry",
       true_cfg: 1,
       id_weight: 1,
       num_steps: 20,
       start_step: 0,
       num_outputs: 1,
       output_quality: 100,
       max_sequence_length: 128
      }
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )
  const prediction = response.data
  console.log(prediction);
  return prediction
}

app.post('/generateImage', async (req, res) => {
  let prompt = req.body.prompt

  const prediction = await createImagePrediction(prompt)
  let response = null
  let nCount = 0
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await sleep(1000)
    nCount++
    if (nCount >= 600) {
      break
    }
    response = await getPredictionStatus(prediction.id)
    console.log("glory", response);
    if (response.error || response.output) {
      break
    }
  }
  
  if (response.output) {
    return res.status(200).send({ response: response })
  } else {
    return res.status(201).send({ response: 'fail' })
  }
})

app.post('/getImage', async (req, res) => {
  let image_original = req.body.image_original
  let prompt = req.body.prompt

  const prediction = await createPrediction(image_original, prompt)
  let response = null
  let nCount = 0
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await sleep(1000)
    nCount++
    if (nCount >= 600) {
      break
    }
    response = await getPredictionStatus(prediction.id)
    console.log("glory", response);
    if (response.error || (response.output && response.output.length > 0)) {
      break
    }
  }

  
  if (response.output) {
    return res.status(200).send({ response: response })
  } else {
    return res.status(201).send({ response: 'fail' })
  }
})

app.listen(port, () => {
  console.log(`connected on port ${port}`)
})

module.exports = app
