import {completions} from '../../utils/chat_gpt'
import {generate} from '../../utils/dalle2'

const handler = async (req, res) => {

    const {prompt} = req.body
    const messages = [
        {
            role: 'user',
            content: '请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述，不要Prompt前缀，为以下描述给出dalle2的英文版提示Prompt：' + prompt
        }
    ]
    const dalle2Prompt = await completions(messages)
    const result = {
        'images': await generate(dalle2Prompt, 3)
    }
    res.status(200).json(result)
}

export default handler
