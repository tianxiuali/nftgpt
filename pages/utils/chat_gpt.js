import {OPENAI_API_HOST, SYSTEM_PROMPT} from '@/constant'

const url = `${OPENAI_API_HOST}/v1/chat/completions`

export const config = {
    runtime: 'experimental-edge'
}

export const completions = async messages => {
    try {
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
                ]
            })
        })
        const result = await response.json()
        return result.choices[0].message.content
    } catch (error) {
        console.error(error)
        return new Response(error.message || 'Error', {status: 500})
    }
}
