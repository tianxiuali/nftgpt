import {removeFile} from "../../utils/remove_file"
import {compileAndDeploy} from "../../utils/contract"

const handler = async (req, res) => {
    let body = req.body
    if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
    }
    const {userAddress} = body

    await compileAndDeploy(userAddress)
    await removeFile('./nft')
    await removeFile('./nft/images')
    await removeFile('./nft/metadatas')
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
    res.status(200).json({openseaUrl: 'https://testnets.opensea.io/collections'})
}

export default handler
