import Web3 from 'web3';
import solc from 'solc';

export const compileAndDeploy = async type => {
    // set the provider you want from Web3.providers
    const web3 = new Web3(new Web3.providers.HttpProvider('https://eth-goerli.g.alchemy.com/v2/Co4QPEVi3tFbWBMzwyqWiYpM9LEOFO7z'));

    // 编译合约
    let source = 'pragma solidity ^0.4.0;contract Calc{  /*区块链存储*/  uint count;  /*执行会写入数据，所以需要`transaction`的方式执行。*/  function add(uint a, uint b) returns(uint){    count++;    return a + b;  }  /*执行不会写入数据，所以允许`call`的方式执行。*/  function getCount() constant returns (uint){    return count;  }}';
    let calcCompiled = solc.compile(source, 1);

    // 得到合约对象
    let abiDefinition = calcCompiled.contracts[':Calc']['interface'];
    let calcContract = new web3.eth.Contract(JSON.parse(abiDefinition));

    // 2. 部署合约

    // 2.1 获取合约的代码，部署时传递的就是合约编译后的二进制码
    let deployCode = calcCompiled.contracts[':Calc']['bytecode'];

    // // 2.2 部署者的地址，当前取默认账户的第一个地址。
    // let deployeAddr = (await web3.eth.getAccounts())[0];
    //
    // // 2.3 异步方式，部署合约
    // let myContractReturned = await calcContract.deploy({
    //   data: deployCode,
    //   from: deployeAddr
    // }).send({
    //   from: deployeAddr,
    //   gas: '1500000'
    // }).then(instance => {
    //   console.log(instance.options.address);
    // });

    const privateKey = 'b41271ca245de6c7f181810e1811a994282ae470f65eb0273657f28eae188712'; // 从环境变量中获取账户的私钥
    const account = web3.eth.accounts.privateKeyToAccount(privateKey); // 将私钥转换为账户对象
    const nonce = await web3.eth.getTransactionCount(account.address); // 获取账户的交易次数
    const gasPrice = await web3.eth.getGasPrice(); // 获取当前网络的平均燃料价格
    const gasLimit = 1500000; // 设置燃料上限
    const txParams = {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        from: account.address,
        data: deployCode
    };
    const signedTx = await account.signTransaction(txParams); // 对交易进行签名
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction); // 发送交易并等待交易确认
    console.log('Deployed contract address: ' + receipt.contractAddress); // 打印合约的地址

    console.log('end');
}
