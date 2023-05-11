import {ThirdwebStorage} from "@thirdweb-dev/storage"
import fs from 'fs-extra'

function readImageDirectory(dir) {
    const names = fs.readdirSync(dir)
    const files = []
    names.map(name => {
        files.push(fs.readFileSync(dir + '/' + name))
    })
    return files
}

function readMetadataDirectory(dir) {
    const names = fs.readdirSync(dir)
    const files = []
    names.map(name => {
        files.push(fs.readFileSync(dir + '/' + name, 'utf8'))
    })
    return files
}


export const uploadNftInfoToIpfs = async (name) => {
    try {
        const storage = new ThirdwebStorage()
        const images = readImageDirectory('./nft/images')
        const imagesUris = await storage.uploadBatch(images)

        const modifiedMetadatas = []
        const metadatas = readMetadataDirectory('./nft/metadatas')
        for (let i = 0; i < metadatas.length; i++) {
            let modifiedMetadata = JSON.parse(metadatas[i])
            modifiedMetadata.image = 'https://ipfs.io/ipfs/' + imagesUris[i].replace('ipfs://', '')
            modifiedMetadatas.push(modifiedMetadata)
        }
        const metadataUris = await storage.uploadBatch(modifiedMetadatas)

        fs.writeFileSync('./nft/location.json', JSON.stringify({
            name: name,
            images: imagesUris[0].replace('ipfs://', '').replace('/0', ''),
            metadatas: metadataUris[0].replace('ipfs://', '').replace('/0', ''),
            count: metadatas.length
        }, null, 2))
    } catch (error) {
        console.error(`upload_nft uploadNftInfoToIpfs error. error: ${error}`)
        throw error
    }
}
