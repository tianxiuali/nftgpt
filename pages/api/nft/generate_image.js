import Database from 'simple-json-db'
import {completions} from '../../utils/chat_gpt'
import {generate} from '../../utils/dalle2'

const promptDB = new Database('db/nft/prompt.json')

const handler = async (req, res) => {
    let body = req.body
    if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
    }
    const {prompt} = body
    const messages = [
        {
            role: 'system',
            content: '请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述'
        },
        {
            role: 'user',
            content: '为以下描述给出dalle2的英文版提示Prompt，不要Prompt前缀：' + prompt
        }
    ]
    const dalle2Prompt = await completions(messages)
    const generatedImages = await generate(dalle2Prompt, 3)
    for (let i = 0; i < generatedImages.length; i++) {
        generatedImages[i] = 'data:image/png;base64,' + generatedImages[i]
    }

    if (promptDB.has('promptInfo')) {
        promptDB.delete('promptInfo')
    }
    promptDB.set('promptInfo', {
        'prompt': prompt,
        'dalle2Prompt': dalle2Prompt
    })

    res.status(200).json({
        'images': generatedImages
    })
}

export default handler
