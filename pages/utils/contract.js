import Web3 from 'web3'
import solc from 'solc'
import fs from 'fs-extra'
import nftLocation from '../../nft/location.json'
import pRetry from "p-retry"

export const compileAndDeploy = async (contractSource, userAddress) => {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.g.alchemy.com/v2/mAXUxZ82WYt00fr2Uvqn1GcxkVlCzzUQ'))

    const input = {
        language: 'Solidity',
        sources: {
            'AiNFT.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }
    const erc721 = fs.readFileSync('./contracts/ERC721.sol', 'utf8')
    const counters = fs.readFileSync('./contracts/Counters.sol', 'utf8')

    function findImports(path) {
        if (path === '@openzeppelin/contracts/token/ERC721/ERC721.sol')
            return {
                contents: erc721
            }
        else if (path === '@openzeppelin/contracts/utils/Counters.sol') {
            return {
                contents: counters
            }
        } else return {error: 'File not found'}
    }

    const contractCompiled = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}))

    // 2. 部署合约
    // 2.1 获取合约的代码，部署时传递的就是合约编译后的二进制码
    const contractBytecode = contractCompiled.contracts['AiNFT.sol']['AiNFT'].evm.bytecode.object
    const contractAbi = contractCompiled.contracts['AiNFT.sol']['AiNFT'].abi

    // 将私钥转换为账户对象
    const account = web3.eth.accounts.privateKeyToAccount(process.env.AI_NFT_ADMIN_PRIVATE_KEY)
    // 设置燃料上限
    const gasLimit = 3000000
    // 获取当前网络的平均燃料价格
    const gasPriceReq = async () => {
        return web3.eth.getGasPrice()
    }
    const gasPrice = await pRetry(gasPriceReq, {
        onFailedAttempt: error => {
            console.error(`Attempt gasPriceReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
        },
        retries: 10
    })

    // deploy
    const initContract = new web3.eth.Contract(contractAbi)
    console.log('nftLocation.name:', nftLocation.name)
    const contractDeploy = initContract.deploy({
        data: contractBytecode,
        arguments: [nftLocation.name, nftLocation.name, `https://ipfs.io/ipfs/${nftLocation.metadatas}/`]
    })
    const deployTxParams = {
        from: account.address,
        gas: gasLimit,
        gasPrice: gasPrice,
        data: contractDeploy.encodeABI()
    }
    const deployReq = async () => {
        // 对交易进行签名
        const deploySignedTx = await account.signTransaction(deployTxParams)
        // 发送交易并等待交易确认
        return web3.eth.sendSignedTransaction(deploySignedTx.rawTransaction)
    }
    const deployReceipt = await pRetry(deployReq, {
        onFailedAttempt: error => {
            console.error(`Attempt deployReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
        },
        retries: 10
    })
    console.log('Contract deployed at address:', deployReceipt.contractAddress)

    // mint
    const aiNFTContract = new web3.eth.Contract(contractAbi, deployReceipt.contractAddress)
    const mintTxParams = {
        from: account.address,
        to: deployReceipt.contractAddress,
        gas: gasLimit,
        data: aiNFTContract.methods.mint(userAddress).encodeABI() // 要调用的合约方法及其参数
    }
    const mintReq = async () => {
        // 对交易进行签名
        const mintSignedTx = await account.signTransaction(mintTxParams)
        // 发送交易并等待交易确认
        return web3.eth.sendSignedTransaction(mintSignedTx.rawTransaction)
    }
    const mintReceipt = await pRetry(mintReq, {
        onFailedAttempt: error => {
            console.error(`Attempt mintReq ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`)
        },
        retries: 10
    })

    return deployReceipt.contractAddress
}
