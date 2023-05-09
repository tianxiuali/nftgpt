import { OPENAI_API_HOST, SYSTEM_PROMPT } from '@/constant'
import { createParser } from 'eventsource-parser'

const url = `${OPENAI_API_HOST}/v1/chat/completions`

export const config = {
  runtime: 'edge'
}

const handler = async req => {
  try {
    const { messages } = await req.json()
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          ...messages.map(el => ({
            role: el.role,
            content: el.content
          }))
        ],
        stream: true
      })
    })
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const stream = new ReadableStream({
      async start(controller) {
        const onParse = event => {
          if (event.type === 'event') {
            const data = event.data

            try {
              const json = JSON.parse(data)
              if (json.choices[0].finish_reason != null) {
                controller.close()
                return
              }
              const text = json.choices[0].delta.content
              console.log('text', text)
              const queue = encoder.encode(text)
              controller.enqueue(queue)
            } catch (e) {
              controller.error(e)
            }
          }
        }

        const parser = createParser(onParse)

        for await (const chunk of response.body) {
          parser.feed(decoder.decode(chunk))
        }
      }
    })
    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response(error.message || 'Error', { status: 500 })
  }
}

export default handler
