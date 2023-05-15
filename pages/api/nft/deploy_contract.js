import {removeFile} from "../../utils/remove_file"
import {compileAndDeploy} from "../../utils/contract"

const handler = async (req, res) => {
    let body = req.body
    if (typeof req.body === 'string') {
        body = JSON.parse(req.body)
    }
    const {contract, userAddress} = body

    const contractAddress = await compileAndDeploy(contract, userAddress)
    // await removeFile('./nft')
    await removeFile('./nft/images')
    await removeFile('./nft/metadatas')
    res.status(200).json({openseaUrl: `https://testnets.opensea.io/assets/mumbai/${contractAddress}/0`})
}

export default handler
