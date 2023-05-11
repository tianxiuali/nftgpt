import {ThirdwebStorage} from "@thirdweb-dev/storage"
import fs from 'fs-extra'
import pRetry from "p-retry"

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
        const imagesUploadReq = async () => {
            return storage.uploadBatch(images)
        }
        const imagesUris = await pRetry(imagesUploadReq, {
            onFailedAttempt: error => {
                console.error(`Attempt imagesUploadReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
            },
            retries: 10
        })

        const modifiedMetadatas = []
        const metadatas = readMetadataDirectory('./nft/metadatas')
        for (let i = 0; i < metadatas.length; i++) {
            let modifiedMetadata = JSON.parse(metadatas[i])
            modifiedMetadata.image = 'https://ipfs.io/ipfs/' + imagesUris[i].replace('ipfs://', '')
            modifiedMetadatas.push(modifiedMetadata)
        }
        const metadatasUploadReq = async () => {
            return storage.uploadBatch(modifiedMetadatas)
        }
        const metadataUris = await pRetry(metadatasUploadReq, {
            onFailedAttempt: error => {
                console.error(`Attempt metadatasUploadReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
            },
            retries: 10
        })

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
