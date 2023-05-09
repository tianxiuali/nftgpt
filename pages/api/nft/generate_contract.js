import {base64ToFile} from "../../utils/base64_2_file";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb' // Set desired value here
        }
    }
}


const handler = async (req, res) => {
    let body = req.body
    if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
    }
    const {nftImages} = body

    await base64ToFile(nftImages)
    // const {prompt} = req.body
    // const messages = [
    //     {
    //         role: 'user',
    //         content: '你是一名solidity开发，请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述' + prompt
    //     }
    // ]
    // const dalle2Prompt = await completions(messages)
    // const result = {
    //     'images': await generate(dalle2Prompt, 3)
    // }
    res.status(200).json({})
}

export default handler
