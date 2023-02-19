'use strict';

// Deploying 'bs721'
// truffle migrate --reset --compile-all --network sepolia
// -----------------
/* INFORMATIONS ON THE S.C.
   > transaction hash:    0x103492291ce86cee90fde3212c5737aff204629bb78082cf4ad1c7d9e5bad3fb
   > Blocks: 1            Seconds: 12c-bin. Attempt #1
   > contract address:    0xA41494e3e5BC7e88112fA811854787885667373A
   > block number:        2852641
   > block timestamp:     1675778376
   > account:             0xe6df9c7927B3689429465eAaE2FDebe360509FD3
   > balance:             1.911465024022382358
   > gas used:            3255613 (0x31ad3d)
   > gas price:           0.04 gwei
   > value sent:          0 ETH
   > total cost:          0.00013022452 ETH
*/

const Web3 = require('web3');
const fs = require('fs');
const axios = require('axios');

//Path compilation, from the compiled contract in build/contracts/bs721.json (only the section "abi")
const bs721_json = 'bs721.json';

//Load the configurations (network, addresses, keys and contract)
let bs712_config = null;
let network = null;

//HttpProvider Endpoint
let web3 = null;

//Owner and contract
let contract_owner = null;
let contractAddress = null;
let contract_owner_pk = null;

try {
    bs712_config = JSON.parse(fs.readFileSync('bs721-config.json'));
    network = bs712_config["network"];

    web3 = new Web3(new Web3.providers.HttpProvider(bs712_config[network]["infura"]));
    contract_owner = bs712_config[network]["contract_owner"];
    contractAddress = bs712_config[network]["contractAddress"];
    contract_owner_pk = bs712_config[network]["contract_owner_pk"];
} catch (err) {
    console.log(JSON.stringify({ result: false, code: err.toString() }));
    process.exit(1);
}

//Just to check if lost something
if (!network || !contract_owner || !contractAddress || !contract_owner_pk) {
    console.log(JSON.stringify({ result: false, code: "error in bs721-config.json" }));
    process.exit(1);
}

async function getCurrentGasMediumPrice(network) {
    if (network === null || typeof (network) === 'undefined' || network === "sepolia") {
        //console.log("Ropsten and others for development");
        let gasLimit = web3.utils.toHex(30000000);
        let gasPrice = web3.utils.toHex(web3.utils.toWei('1', 'gwei'));
        return { gasPrice: gasPrice, gasLimit: gasLimit };
    }

    try {
        let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
        let prices = {
            low: response.data.safeLow / 10,
            medium: response.data.average / 10,
            high: response.data.fast / 10
        };

        let highwei = web3.utils.toWei((3 * prices.high).toString(), 'gwei');
        return { gasPrice: web3.utils.toHex(highwei), gasLimit: web3.utils.toHex(8000000) };
    } catch (err) {
        return { gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')), gasLimit: web3.utils.toHex(8000000) };
    }
}

async function main(request) {
    if (request === null || request.length === 0) {
        return { result: false, code: "request " + request + " not found" };
    }

    //Read the ABI contract
    const contract_raw = fs.readFileSync(bs721_json, "UTF-8");
    const contract_json = JSON.parse(contract_raw);
    const contractABI = contract_json.abi;

    let account = null;
    try {
        // Add account from private key
        account = web3.eth.accounts.privateKeyToAccount('0x' + contract_owner_pk);
        web3.eth.accounts.wallet.add(account);
        web3.eth.defaultAccount = account.address;
    } catch (err) {
        return { result: false, code: err.toString() };
    }

    //Connects to contract
    const contract = await new web3.eth.Contract(contractABI, contractAddress);

    //check whether there are pending transactions
    if (request[0] == "mint" || request[0] == "setTokenURI") {
        const pending = await web3.eth.getTransactionCount(contract_owner, 'pending');
        const notpending = await web3.eth.getTransactionCount(contract_owner);
        if ((pending - notpending) > 0) {
            return { result: false, err: "pending" };
        }
    }

    //Web3 builds the transaction(serializes,signature...) 
    let tx = {
        // from: account1, 
        // to: account2, 
        // gasLimit: web3.utils.toHex(4700000), 
        // gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
    };

    try {
        switch (request[0]) //command name
        {
            case "price": {
                const price = await getCurrentGasMediumPrice(network);
                return { result: true, data: { price: price } };
            }
            case "name": {
                let name = await contract.methods.name().call(tx);
                return { result: true, data: { name: name } };
            }
                break;
            case "symbol": {
                let symbol = await contract.methods.symbol().call(tx);
                return { result: true, data: { symbol: symbol } };
            }
                break;
            case "mint": {
                if (request.length != 4) {
                    return { result: false, code: "mint address tokenid tokenURI" };
                }
                let gasprices = await getCurrentGasMediumPrice(network);
                tx.gasPrice = gasprices.gasPrice;
                tx.gasLimit = gasprices.gasLimit;
                tx.to = request[1];
                tx.from = contract_owner;

                let to = request[1];
                let tokenId = request[2];
                let tokenURI = request[3];
                try {
                    let result = await contract.methods.mintWithTokenURI(to, tokenId, tokenURI).send(tx);
                    NFTs.push({"id" : tokenId,"ownerAddress"  : to,"tokenURI" : tokenURI})
                    fs.writeFileSync("./NFTs.json",JSON.stringify(NFTs), function(err) {    //add the NFT created to a json file called NFTs.json
                        if (err) throw err;
                        console.log('complete');
                        })
                    return { result: true, data: { mint: true } };
                } catch (err) {
                    return { result: false, code: err.toString() };
                }
            }
                break;
            case "setTokenURI": {
                if (request.length != 3) {
                    return { result: false, code: "seTokenURI tokenid tokenURI" };
                }
                let gasprices = await getCurrentGasMediumPrice(network);
                tx.gasPrice = gasprices.gasPrice;
                tx.gasLimit = gasprices.gasLimit;
                tx.from = contract_owner;
                let tokenId = request[1];
                let tokenURI = request[2];
                try {
                    await contract.methods.setTokenURI(tokenId, tokenURI).send(tx);
                    return { result: true, data: { setTokenURI: true } };
                } catch (err) {
                    return { result: false, code: "error in setTokenURI" };
                }
            }
                break;
            case "tokensOfOwner": {
                if (request.length != 2) {
                    return { result: false, code: "tokensOfOwner address" };
                }
                let address = request[1];
                let tokens = await contract.methods.tokensOfOwner(address).call(tx);
                return { result: true, data: { tokensOfOwner: tokens } };
            }
                break;
            case "countTokensOf": {
                if (request.length != 2) {
                    return { result: false, code: "countTokensOf address" };
                }
                let address = request[1];
                let balance = await contract.methods.balanceOf(address).call(tx);
                return { result: true, data: { countTokensOf: balance } };
            }
                break;
            case "ownerOf": {
                if (request.length != 2) {
                    return { result: false, code: "ownerOf tokenId" };
                }
                let tokenId = request[1];
                let owner = await contract.methods.ownerOf(tokenId).call(tx);
                return { result: true, data: { ownerOf: owner } };
            }
                break;
            case "exists": {
                if (request.length != 2) {
                    return { result: false, code: "exists tokenId" };
                }
                let tokenId = request[1];
                let ret = await contract.methods.exists(tokenId).call(tx);
                return { result: true, data: { exists: ret } };
            }
            case "tokenURI": {
                if (request.length != 2) {
                    return { result: false, code: "tokenURI tokenId" };
                }
                let tokenId = request[1];
                let uri = await contract.methods.tokenURI(tokenId).call(tx);
                //console.log(uri);
                return { result: true, data: { tokenURI: uri } };
            }
                break;
            case "transferFrom": {
                if (request.length != 4) {
                    return { result: false, code: "transferFrom from to tokenId" };
                }
                let from = request[1];
                let to = request[2];
                let tokenId = request[3];

                let gasprices = await getCurrentGasMediumPrice(network);
                tx.gasPrice = gasprices.gasPrice;
                tx.gasLimit = gasprices.gasLimit;
                tx.from = contract_owner;

                let ret = await contract.methods.transferFrom(from, to, tokenId).send(tx);
                console.log(ret);
                for (var i = 0; i < NFTs.length; i++) {
                    if (NFTs[i].id === tokenID) {
                        NFTs[i].ownerAddress = to;
                      break;
                    }
                }
                fs.writeFileSync("./NFTs.json",JSON.stringify(NFTs), function(err) {    //update the owner of the NFT transferred inside NFTs.json
                    if (err) throw err;
                    console.log('complete');
                    })
                return { result: true, data: { transferFrom: ret } };
            }
                break;
        }
    } catch (err) {
        return { result: false, code: err.toString() };
    }
}

main(process.argv.slice(2)).then(
    ret => {
        console.log(JSON.stringify(ret));
    },
    err => {
        console.log(JSON.stringify({ result: false, code: err.toString() }));
    });
