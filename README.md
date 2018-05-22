# Ethereum SDK

The Etherem SDK is an Local signature transfer, Local signature contract release and contract interaction tool, as well as the web3 client.

## Config.

The etherem network service address, default is 'http://127.0.0.1:8545'.
```
client.config.serverURL = 'http://127.0.0.1:8545'
```

The etherem network contract information, default is {}
```
client.config.contracts = {}
```
example:
```
    {
      "Token": {
        "address": "0x6062b12c40be844603858dd14902b35175227825",
        "abi": [{
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [{
            "name": "",
            "type": "string"
          }],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },{
            ...
        }]
      },
      ...
    }
```

Development mode log information，default is false
```
client.config.dev = false
```

## API

### web3
Web3 clients can be used directly and need to be init or reset before use.
```
client.web3
```
example:
```
console.log(client.web3.version)
```

### init
Initialize the web3 client.
```
client.config.serverURL = 'http://127.0.0.1:8545'
client.init()
```

### reset
Reset the web3 client.
```
client.config.serverURL = 'ws://127.0.0.1:8546'
client.reset()
```

### transfer
Local signature transfer
```
/**
 * @param to : to account.
 * @param value : value[wei].
 * @param gasLimit : gasLimit.
 * @param id : id.
 * @param sender : contract method caller[string],The sender is public key when the method type is called;The sender is private key when the method type is send.
 */
deploy: async function (request)
```
example:
```
client.transfer({
    to: "0x7ebef78f23fe5cac4d5c5d7ad76008129fa5bfd9",
    value: 1,
    sender: '0x605297a0025b7b6bff5b7d219e78cd4f7c4dce928e86069d64c99a47547aa8e8',
    gasLimit: 60000,
    id: 'transfer001'
}).then(function (data) {
    console.log(data);
});
```
### deploy
Local signature deploy contract
```
/**
 * @param path : contract path[string].
 * @param contract : contract name[string].
 * @param params : method params [array].
 * @param value : value.
 * @param gasLimit : gasLimit.
 * @param id : id.
 * @param sender : contract method caller[string],The sender is private key.
 */
invoke: async function (request)
```
example:
```
client.deploy({
    path:'../contract/token.sol',
    contract: 'Fund',
    params: ["XXX Coin",1000000000,9,"XXX"],
    sender: '0x605297a0025b7b6bff5b7d219e78cd4f7c4dce928e86069d64c99a47547aa8e8',
    gasLimit: 650000,
    id: 'transfer001'
}).then(function (data) {
    console.log(data);
});
```

### invoke
Local signature invoke contract
```
/**
 * @param contract : contract name[string].
 * @param method : contract method name[string].
 * @param params : method params [array].
 * @param value : value.
 * @param gasLimit : gasLimit.
 * @param id : id.
 * @param sender : contract method caller[string],The sender is public key when the method type is called;The sender is private key when the method type is send.
 */
invoke: async function (request)
```
example: call contract.
```
// call Token [name]
client.invoke({
    contract: 'Token',
    method: 'name',
    sender: '0xc66cd3deec506713d653681c7663f2c4fe96fb2f'
}).then(function (data) {
    console.log(data);
});
```

example: send contract.
```
// send Token [approve]
client.invoke({
    contract: 'Token',
    method: 'approve',
    params:["0x7ebef78f23fe5cac4d5c5d7ad76008129fa5bfd9",999],
    gasLimit: 46000,
    sender: '0x605297a0025b7b6bff5b7d219e78cd4f7c4dce928e86069d64c99a47547aa8e8'
}).then(function (data) {
    console.log(data);
});
```
