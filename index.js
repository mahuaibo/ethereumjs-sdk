const Web3 = require('web3');
const fs = require ('fs');
const solc = require ('solc');
const Tx = require('ethereumjs-tx');

module.exports = {
    web3: undefined,
    init: function () {
        if (this.web3 === undefined) {
            this.web3 = new Web3(Web3.givenProvider || this.config.serverURL);
        }
    },
    reset: function () {
        this.web3 = new Web3(Web3.givenProvider || this.config.serverURL);
    },
    config: {
        serverURL: 'http://127.0.0.1:8545', //default
        contracts: {},
        dev: false
    },
    deploy: async function (request) {
        try {
            // Request validation and initialization.
            if (request.path === undefined || request.path === ''){
                throw 'path cannot be "" or undefined.';
            }
            if (request.contract === undefined || request.contract === ''){
                throw 'contract cannot be "" or undefined.';
            }
            if (request.params === undefined || request.params === ''){
                request.params = [];
            }
            if (request.sender === undefined || request.sender === ''){
                throw 'sender cannot be "" or undefined.';
            }
            if (request.value === undefined || request.value === ''){
                request.value = 0;
            }
            if (parseInt(request.value) < 0){
                throw 'must be >= 0.';
            }
            if (request.gasLimit === undefined || request.gasLimit === ''){
                request.gasLimit = 0;
            }
            if (this.config.dev) {
                console.log("request: ", request);
            }
            this.init();
            const input = fs.readFileSync(request.path);
            const output = solc.compile(input.toString(), 1);
            var _contract = output.contracts[':'+request.contract];
            if (_contract === undefined || _contract === ''){
                throw 'contract not found';
            }
            var contract = new this.web3.eth.Contract(JSON.parse(_contract.interface));
            var data = '0x'+ contract.deploy({data: _contract.bytecode, arguments: request.params}).encodeABI()
            var result = {};
            if (request.id !== undefined && request.id !== '') {
                result.id = request.id;
            }
            var _account;
            var _privateKey;
            if (request.sender.indexOf("0x") >= 0) {
                _account = await this.web3.eth.accounts.privateKeyToAccount(request.sender);
                _privateKey = new Buffer(request.sender.substring(2), 'hex');
            } else {
                _account = await this.web3.eth.accounts.privateKeyToAccount('0x' + request.sender);
                _privateKey = new Buffer(request.sender, 'hex')
            }
            if (request.nonce === undefined || request.nonce === ''){
                request.nonce = await this.web3.eth.getTransactionCount(_account.address);
            }
            if (request.gasPrice === undefined || request.gasPrice === ''){
                request.gasPrice = await this.web3.eth.getGasPrice();
            }
            if (this.config.dev) {
                console.log("_account: ", _account);
            }
            var rawTx = {
                nonce: this.web3.utils.toHex(request.nonce),
                gasPrice: this.web3.utils.toHex(request.gasPrice),
                data: data,
                value: request.value,
                gasLimit: this.web3.utils.toHex(request.gasLimit)
            }
            if (this.config.dev) {
                console.log("rawTx: ",rawTx);
            }
            var tx = new Tx(rawTx);
            tx.sign(_privateKey);
            var serializedTx = tx.serialize().toString('hex');
            if (this.config.dev) {
                console.log("serializedTx: ",serializedTx);
            }
            var txHash = await this.web3.utils.sha3('0x'+serializedTx);
            result.txHash = txHash;
            await this.web3.eth.sendSignedTransaction('0x' + serializedTx).on('transactionHash', function (hash) {
                result.hash = hash;
            }).on('error', function(error){
                throw error;
            });
            return result;
        } catch (err) {
            if (this.config.dev) {
                console.log(err);
            }
            throw err;
        }
    },
    transfer: async function (request) {
        try {
            // Request validation and initialization.
            if (request.to === undefined || request.to === ''){
                throw 'toAccount cannot be "" or undefined.';
            }
            if (request.value === undefined || request.value === ''){
                throw 'toAccount cannot be "" or undefined.';
            }
            if (parseInt(request.value) <= 0){
                throw 'must be > 0.';
            }
            if (request.sender === undefined || request.sender === ''){
                throw 'sender cannot be "" or undefined.';
            }
            if (request.gasLimit === undefined || request.gasLimit === ''){
                request.gasLimit = 0;
            }
            if (this.config.dev) {
                console.log("request: ", request);
            }
            this.init();
            var _account;
            var _privateKey;
            if (request.sender.indexOf("0x") >= 0) {
                _account = await this.web3.eth.accounts.privateKeyToAccount(request.sender);
                _privateKey = new Buffer(request.sender.substring(2), 'hex');
            } else {
                _account = await this.web3.eth.accounts.privateKeyToAccount('0x' + request.sender);
                _privateKey = new Buffer(request.sender, 'hex')
            }
            if (request.nonce === undefined || request.nonce === ''){
                request.nonce = await this.web3.eth.getTransactionCount(_account.address);
            }
            if (request.gasPrice === undefined || request.gasPrice === ''){
                request.gasPrice = await this.web3.eth.getGasPrice();
            }
            if (this.config.dev) {
                console.log("_account: ", _account);
            }
            var rawTx = {
                nonce: this.web3.utils.toHex(request.nonce),
                gasPrice: this.web3.utils.toHex(request.gasPrice),
                to: request.to,
                value: request.value,
                gasLimit: this.web3.utils.toHex(request.gasLimit)
            }
            if (this.config.dev) {
                console.log("rawTx: ",rawTx);
            }
            var tx = new Tx(rawTx);
            tx.sign(_privateKey);
            var serializedTx = tx.serialize().toString('hex');
            if (this.config.dev) {
                console.log("serializedTx: ",serializedTx);
            }
            var result = {};
            if (request.id !== undefined && request.id !== '') {
                result.id = request.id;
            }
            var txHash = await this.web3.utils.sha3('0x'+serializedTx);
            result.txHash = txHash;

            await this.web3.eth.sendSignedTransaction('0x' + serializedTx).on('transactionHash', function (hash) {
                result.hash = hash;
            }).on('error', function(error){
                throw error;
            });
            return result;
        } catch (err) {
            if (this.config.dev) {
                console.log(err);
            }
            throw err;
        }
    },
    invoke: async function (request) {
        try {
            // Request validation and initialization.
            if (request.contract === undefined || request.contract === ''){
                throw 'contract cannot be "" or undefined.';
            }
            if (request.method === undefined || request.method === ''){
                throw 'method cannot be "" or undefined.';
            }
            if (request.params === undefined || request.params === ''){
                request.params = [];
            }
            if (request.sender === undefined || request.sender === ''){
                throw 'sender cannot be "" or undefined.';
            }
            if (request.value === undefined || request.value === ''){
                request.value = 0;
            }
            if (parseInt(request.value) < 0){
                throw 'must be >= 0.';
            }
            if (request.gasLimit === undefined || request.gasLimit === ''){
                request.gasLimit = 0;
            }
            if (this.config.dev) {
                console.log("request: ", request);
            }
            // Contract information.
            var _contract = this.config.contracts[request.contract];
            if (this.config.dev) {
                console.log("contract information: ", _contract);
            }
            // Invalid address or zero address.
            if (!Web3.utils.isAddress(_contract.address) || _contract.address === "0x0000000000000000000000000000000000000000") {
                throw "invalid contract address.";
            }
            // Invalid contract abi.
            if (_contract.abi === undefined || _contract.abi === '' || _contract.abi === []) {
                throw "contract not found.";
            }
            // The contract method invoked.
            var _method;
            for (var i in _contract.abi) {
                if (request.method === _contract.abi[i]["name"]) {
                    _method = _contract.abi[i];
                    break;
                }
            }
            if (this.config.dev) {
                console.log("method abi: ", _method);
            }
            // Invalid contract method.
            if (_method === undefined || _method === "") {
                throw "method not found.";
            }
            // Invalid params number
            if (request.params.length !== _method.inputs.length) {
                throw "the number of params is inconsistent.";
            }
            // web3 client of ethereum.
            this.init();
            // encodeABI.
            var _params = [];
            for (var i in _method.inputs) {
                if (_method.inputs[i].type.indexOf("bytes") >= 0 && _method.inputs[i].type.indexOf("[]") < 0) {
                    _params.push(this.web3.utils.toHex(request.params[i]));
                } else if (_method.inputs[i].type.indexOf("bytes") >= 0 && _method.inputs[i].type.indexOf("[]") >= 0) {
                    var ps = request.params[i];
                    var _ps = [];
                    for (var j in ps) {
                        _ps.push(this.web3.utils.toHex(ps[j]));
                    }
                    _params.push(_ps);
                } else {
                    _params.push(request.params[i]);
                }
            }
            var data = await this.web3.eth.abi.encodeFunctionCall(_method, _params);
            if (this.config.dev) {
                console.log("encode data: ", data);
            }
            var result = {};
            if (request.id !== undefined && request.id !== '') {
                result.id = request.id;
            }
            /**
             * call
             */
            if (_method.constant) {
                var _web3 = this.web3;
                var _result;

                var _sender;
                if (request.sender.indexOf("0x") >= 0) {
                    _sender = request.sender;
                } else {
                    _sender = '0x' + request.sender;
                }
                await _web3.eth.call({from: _sender, to: _contract.address, data: data}).then(function (data) {
                    var returnType = [];
                    for (var i in _method.outputs) {
                        returnType.push(_method.outputs[i].type);
                    }
                    _result = _web3.eth.abi.decodeParameters(returnType, data);
                });
                var _length = _result.__length__;
                for (var i = 0; i < _length; i++) {
                    result[i] = _result[i];
                }
                result.length = _length;
                return result;
            }
            /**
             * send
             */
            else {
                var _account;
                var _privateKey;
                if (request.sender.indexOf("0x") >= 0) {
                    _account = await this.web3.eth.accounts.privateKeyToAccount(request.sender);
                    _privateKey = new Buffer(request.sender.substring(2), 'hex');
                } else {
                    _account = await this.web3.eth.accounts.privateKeyToAccount('0x' + request.sender);
                    _privateKey = new Buffer(request.sender, 'hex')
                }
                if (this.config.dev) {
                    console.log("_account: ", _account);
                }
                if (this.config.dev) {
                    console.log("_privateKey: ", _privateKey.toString('hex'));
                }
                if (request.nonce === undefined || request.nonce === ''){
                    request.nonce = await this.web3.eth.getTransactionCount(_account.address);
                }
                if (request.gasPrice === undefined || request.gasPrice === ''){
                    request.gasPrice = await this.web3.eth.getGasPrice();
                }

                var rawTx = {
                    nonce: this.web3.utils.toHex(request.nonce),
                    gasPrice: this.web3.utils.toHex(request.gasPrice),
                    to: _contract.address,
                    data: data,
                    value: request.value,
                    gasLimit: this.web3.utils.toHex(request.gasLimit)
                }
                if (this.config.dev) {
                    console.log("rawTx: ",rawTx);
                }
                var tx = new Tx(rawTx);
                tx.sign(_privateKey);
                var serializedTx = tx.serialize().toString('hex');

                var txHash = await this.web3.utils.sha3('0x'+serializedTx);
                result.txHash = txHash;

                if (this.config.dev) {
                    console.log("serializedTx: ",serializedTx);
                }
                await this.web3.eth.sendSignedTransaction('0x' + serializedTx).on('transactionHash', function (hash) {
                    result.hash = hash;
                }).on('error', function(error){
                    throw error;
                });
                return result;
            }
        } catch (err) {
            if (this.config.dev) {
                console.log(err);
            }
            throw err;
        }
    }
}
