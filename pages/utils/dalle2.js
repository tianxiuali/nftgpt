import {DALLE2_HOST} from '@/constant'

const url = `${DALLE2_HOST}/generate`

export const generate = async (prompt, generateNumber) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                text: prompt,
                num_images: generateNumber
            })
        })
        const result = await response.json()
        return result['generatedImgs']
    } catch (error) {
        console.error(error)
        return new Response(error.message || 'Error', {status: 500})
    }
}
