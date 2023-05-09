import { OPENAI_API_HOST } from '@/constant'

const url = `${OPENAI_API_HOST}/v1/models`

export default async function (req, res) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    }
  })
  const json = await response.json()
  res.status(200).json(json)
}
