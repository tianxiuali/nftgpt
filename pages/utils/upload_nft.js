import {NFTStorage, File} from 'nft.storage'
import fs from 'fs-extra'
import path from 'path'

function readDirectory(dir) {
    const names = fs.readdirSync(dir)
    return names.map(name =>
        new File([fs.readFileSync(dir + '/' + name)], name))
}

export const uploadNftInfoToIpfs = async () => {
    const images = readDirectory('./nft/images')
    const nftStorage = new NFTStorage({token: process.env.NFT_STORAGE_API_KEY})
    const imageCid = await nftStorage.storeDirectory(images)
    console.log("images uploaded to: ", imageCid)

    const metadatas = readDirectory('./nft/metadatas')
    const modifiedMetadatas = await Promise.all(metadatas.map(async file => {
        const obj = JSON.parse(await file.text())
        obj.image = `ipfs://${imageCid.toString()}/${obj.image}`
        return new File([JSON.stringify(obj)], file.name)
    }))
    const metadataCid = await nftStorage.storeDirectory(modifiedMetadatas)
    console.log("metadata uploaded to: ", metadataCid)

    const locationPath = path.join(__dirname, "./nft/location.json")
    fs.writeFileSync(locationPath, JSON.stringify({
        images: imageCid.toString(),
        metadata: metadataCid.toString(),
        count: metadatas.length
    }, null, 2));
}