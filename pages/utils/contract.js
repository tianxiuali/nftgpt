import Web3 from 'web3'
import solc from 'solc'
import fs from 'fs-extra'
import nftLocation from '../../nft/location.json'


export const compileAndDeploy = async (userAddress) => {
    // set the provider you want from Web3.providers
    const web3 = new Web3(new Web3.providers.HttpProvider('https://polygon-mumbai.g.alchemy.com/v2/mAXUxZ82WYt00fr2Uvqn1GcxkVlCzzUQ'))

    // 编译合约
    let contractSource = '// SPDX-License-Identifier: MIT\n' +
        'pragma solidity ^0.8.0;\n' +
        '\n' +
        'import "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n' +
        'import "@openzeppelin/contracts/utils/Counters.sol";\n' +
        '\n' +
        'contract AiNFT is ERC721 {\n' +
        '    using Counters for Counters.Counter;\n' +
        '    Counters.Counter private tokenIdCounter;\n' +
        '\n' +
        '    string public baseURI;\n' +
        '\n' +
        '    constructor(\n' +
        '        string memory _name,\n' +
        '        string memory _symbol,\n' +
        '        string memory _baseURI\n' +
        '    ) ERC721(_name, _symbol) {\n' +
        '        baseURI = _baseURI;\n' +
        '    }\n' +
        '\n' +
        '    function _baseURI() internal view virtual override returns (string memory) {\n' +
        '        return baseURI;\n' +
        '    }\n' +
        '\n' +
        '    function mint(address _to) public payable {\n' +
        '        uint256 tokenId = tokenIdCounter.current();\n' +
        '        _mint(_to, tokenId);\n' +
        '        tokenIdCounter.increment();\n' +
        '    }\n' +
        '}'
    // const contractSource = source.replace(/\n/g, '').replace('```', '')
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
    const gasPrice = await web3.eth.getGasPrice()
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
    // 对交易进行签名
    const deploySignedTx = await account.signTransaction(deployTxParams)
    // 发送交易并等待交易确认
    const deployReceipt = await web3.eth.sendSignedTransaction(deploySignedTx.rawTransaction)
    // 打印合约的地址
    console.log('Contract deployed at address:', deployReceipt.contractAddress)

    const aiNFTContract = new web3.eth.Contract(contractAbi, deployReceipt.contractAddress)
    const mintTxParams = {
        from: account.address,
        to: deployReceipt.contractAddress,
        gas: gasLimit,
        data: aiNFTContract.methods.mint(userAddress).encodeABI() // 要调用的合约方法及其参数
    }
    // 对交易进行签名
    const mintSignedTx = await account.signTransaction(mintTxParams)
    // 发送交易并等待交易确认
    const mintReceipt = await web3.eth.sendSignedTransaction(mintSignedTx.rawTransaction)
    console.log('Contract mint receipt:', mintReceipt)
}
