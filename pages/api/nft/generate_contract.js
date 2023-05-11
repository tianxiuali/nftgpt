import Database from 'simple-json-db'
import {base64ToFile} from '../../utils/base64_2_file'
import {nftMetadataToFile} from '../../utils/nft_metadata_2_file'
import {uploadNftInfoToIpfs} from '../../utils/upload_nft'
import {completions} from "../../utils/chat_gpt"

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb' // Set desired value here
        }
    }
}

const promptDB = new Database('db/nft/prompt.json')

const handler = async (req, res) => {
    let body = req.body
    if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
    }
    const {nftImages} = body

    await base64ToFile(nftImages)

    const promptInfo = promptDB.get('promptInfo')
    const dalle2Prompt = promptInfo.dalle2Prompt

    const messages = [
        {
            role: 'system',
            content: '请严格按照我后续提问的要求给出回答，不要用问题回答问题，直接给出你认为最合适的答案，不要其他任何描述'
        },
        {
            role: 'user',
            content: '请从以下描述中提取主体名词，不要其他任何描述：' + dalle2Prompt
        }
    ]
    const name = await completions(messages)

    const nftMetadatas = []
    for (let i = 0; i < nftImages.length; i++) {
        nftMetadatas.push({
            'name': name,
            'description': dalle2Prompt,
            'image': i
        })
    }
    await nftMetadataToFile(nftMetadatas)
    await uploadNftInfoToIpfs(name)

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
    let contract = '\n' +
        'pragma solidity ^0.8.0;\n' +
        '\n' +
        'import "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n' +
        'import "@openzeppelin/contracts/utils/Counters.sol";\n' +
        '\n' +
        'contract MyNFT is ERC721 {\n' +
        '    using Counters for Counters.Counter;\n' +
        '    Counters.Counter private _tokenIds;\n' +
        '\n' +
        '    constructor() ERC721("MyNFT", "MNFT") {}\n' +
        '\n' +
        '    function mintNFT(address recipient, string memory metadataURI) public returns (uint256) {\n' +
        '        _tokenIds.increment();\n' +
        '\n' +
        '        uint256 newItemId = _tokenIds.current();\n' +
        '        _mint(recipient, newItemId);\n' +
        '        _setTokenURI(newItemId, metadataURI);\n' +
        '\n' +
        '        return newItemId;\n' +
        '    }\n' +
        '}\n' +
        ''
    res.status(200).json({contract: contract})
}

export default handler
