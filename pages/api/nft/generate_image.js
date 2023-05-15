import Database from 'simple-json-db'
import {getStableDiffusion2PromptCompletions} from '../../utils/chat_gpt'
import {generate} from '../../utils/stable_diffusion2'

const promptDB = new Database('db/nft/prompt.json')

const handler = async (req, res) => {
    let body = req.body
    if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
    }
    const {prompt} = body

    const stableDiffusion2Prompt = await getStableDiffusion2PromptCompletions(prompt)
    const generatedImages = await generate(stableDiffusion2Prompt, 3)
    for (let i = 0; i < generatedImages.length; i++) {
        generatedImages[i] = 'data:image/png;base64,' + generatedImages[i]
    }

    if (promptDB.has('promptInfo')) {
        promptDB.delete('promptInfo')
    }
    promptDB.set('promptInfo', {
        'prompt': prompt,
        'stableDiffusion2Prompt': stableDiffusion2Prompt
    })

    res.status(200).json({
        'images': generatedImages
    })
}

export default handler
