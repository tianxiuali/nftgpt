const fs = require('fs')
const path = require('path')

export const removeFile = async directoryPath => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return
        }

        files.forEach((fileName) => {
            const filePath = path.join(directoryPath, fileName)
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
            })
        })
    })
}
