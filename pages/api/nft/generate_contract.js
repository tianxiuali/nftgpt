import {base64ToFile} from '../../utils/base64_2_file'
import {nftMetadataToFile} from '../../utils/nft_metadata_2_file'
import {getGlobalDalle2Prompt} from './generate_image'
import {uploadNftInfoToIpfs} from '../../utils/upload_nft'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb' // Set desired value here
        }
    }
}

const handler = async (req, res) => {
    // let body = req.body
    // if (typeof req.body === 'string') {
    //     body = JSON.parse(req.body)
    // }
    // const {nftImages} = body
    // await base64ToFile(nftImages)
    // const nftMetadatas = []
    // for (let i = 0; i < nftImages.length; i++) {
    //     nftMetadatas.push({
    //         'name': 'NFT' + i,
    //         'description': getGlobalDalle2Prompt(),
    //         'image': i + '.png'
    //     })
    // }
    // await nftMetadataToFile(nftMetadatas)
    // await uploadNftInfoToIpfs()

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
    let contract = 'pragma solidity ^0.4.0;contract Calc{  /*区块链存储*/  uint count;  /*执行会写入数据，所以需要`transaction`的方式执行。*/  function add(uint a, uint b) returns(uint){    count++;    return a + b;  }  /*执行不会写入数据，所以允许`call`的方式执行。*/  function getCount() constant returns (uint){    return count;  }}';
    res.status(200).json({contract: contract})
}

export default handler
