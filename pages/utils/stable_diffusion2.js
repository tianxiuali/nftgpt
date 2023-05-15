import {STABLE_DIFFUSION2_HOST} from '@/constant'
import pRetry from "p-retry"

const url = `${STABLE_DIFFUSION2_HOST}/generate`

export const generate = async (prompt, generateNumber) => {
    const stableDiffusionReq = async () => {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                text: prompt,
                num_images: generateNumber
            })
        })
        return await response.json()
    }
    try {
        const result = await pRetry(stableDiffusionReq, {
            onFailedAttempt: error => {
                console.error(`Attempt stableDiffusionReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
            },
            retries: 10
        })
        return result['generatedImgs']
    } catch (error) {
        console.error(`stableDiffusion2 generate error. param: prompt: ${prompt}, generateNumber: ${generateNumber}. error: ${error}`)
        throw error
    }
}
