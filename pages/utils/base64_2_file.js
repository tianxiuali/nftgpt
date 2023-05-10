import fs from 'fs';

export const base64ToFile = async nftImages => {
    for (let i = 0; i < nftImages.length; i++) {
        // Base64编码的图像数据
        const base64Data = nftImages[i]
        // 将Base64数据转换为字节数组
        const data = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        // 将字节数组写入本地文件
        fs.writeFileSync(`./nft/images/image${i}.png`, data, (err) => {
            if (err) throw err
            console.log('图像已保存到本地文件')
        })
    }
}
