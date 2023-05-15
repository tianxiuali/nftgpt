import Database from 'simple-json-db'
import {base64ToFile} from '../../utils/base64_2_file'
import {nftMetadataToFile} from '../../utils/nft_metadata_2_file'
import {uploadNftInfoToIpfs} from '../../utils/upload_nft'
import {getContractCompletions, getSubjectCompletions} from "../../utils/chat_gpt"

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
    const stableDiffusion2Prompt = promptInfo.stableDiffusion2Prompt
    const name = await getSubjectCompletions(stableDiffusion2Prompt)

    const nftMetadatas = []
    for (let i = 0; i < nftImages.length; i++) {
        nftMetadatas.push({
            'name': name,
            'description': stableDiffusion2Prompt,
            'image': i
        })
    }
    await nftMetadataToFile(nftMetadatas)
    await uploadNftInfoToIpfs(name)

    const contract = await getContractCompletions(promptInfo.prompt)
    res.status(200).json({contract: contract})
}

export default handler
