import fs from 'fs';

export const nftMetadataToFile = async metadatas => {
    for (let i = 0; i < metadatas.length; i++) {
        fs.writeFileSync(`./nft/metadatas/${i}.json`, JSON.stringify(metadatas[i]), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('JSON数据已保存到本地文件');
        });
    }
}
