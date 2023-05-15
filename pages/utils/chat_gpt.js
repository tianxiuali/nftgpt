import {OPENAI_API_HOST} from '@/constant'
import pRetry from "p-retry"
import Database from "simple-json-db";

const url = `${OPENAI_API_HOST}/v1/chat/completions`

export const config = {
    runtime: 'experimental-edge'
}

const contractTemplateDB = new Database('db/nft/contract_template.json')

export const getStableDiffusion2PromptCompletions = async (prompt) => {
    const messages = [
        {
            role: 'system',
            content: '你是一名prompt engineer，请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述'
        },
        {
            role: 'user',
            content: '为以下描述给出Stable Diffusion2的英文版Prompt，不要Prompt前缀：' + prompt
        }
    ]

    return await completions(JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
            ...messages.map(el => ({
                role: el.role,
                content: el.content
            }))
        ]
    }))
}

export const getSubjectCompletions = async (prompt) => {
    const messages = [
        {
            role: 'system',
            content: '请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述'
        },
        {
            role: 'user',
            content: '请从以下描述中提取主体名词，不要其他任何描述：' + prompt
        }
    ]

    return await completions(JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
            ...messages.map(el => ({
                role: el.role,
                content: el.content
            }))
        ]
    }))
}

export const getContractCompletions = async (prompt) => {
    let contractTemplate;
    if (prompt.includes('数字艺术')) {
        contractTemplate = contractTemplateDB.get('digital_art')
    } else {
        contractTemplate = contractTemplateDB.get('learning_voucher')
    }

    const messages = [
        {
            role: 'system',
            content: '你是一名solidity开发工程师，请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述'
        },
        {
            role: 'user',
            content: `请按模板：${contractTemplate}生成${prompt}合约代码，不要其他任何描述`
        }
    ]

    return await completions(JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
            ...messages.map(el => ({
                role: el.role,
                content: el.content
            }))
        ]
    }))

}

export const completions = async body => {
    const gptReq = async () => {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            },
            method: 'POST',
            body: body
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
