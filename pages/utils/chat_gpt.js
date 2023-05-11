import {OPENAI_API_HOST, SYSTEM_PROMPT} from '@/constant'
import pRetry from "p-retry"

const url = `${OPENAI_API_HOST}/v1/chat/completions`

export const config = {
    runtime: 'experimental-edge'
}

export const completions = async messages => {
    const gptReq = async () => {
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
        return await response.json()
    }
    try {
        const result = await pRetry(gptReq, {
            onFailedAttempt: error => {
                console.error(`Attempt gptReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
            },
            retries: 10
        })
        return result.choices[0].message.content
    } catch (error) {
        console.error(`chat_gpt completions error. param: %o. error: %o`, messages, error)
        throw error
    }
}
