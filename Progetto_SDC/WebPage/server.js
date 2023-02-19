var path = require('path');
var fs = require('fs')
var express = require('express');
var bodyParser = require('body-parser');    //for processing URLencoded HTTPrequests
var NFTs = require('../NFTs.json')  //all NFTs created with owner,tokenID and tokenURI
var requests = require('./requests.json') //all requests by clients
//var checkTransactions = require('./SepoliaTransactions.js');  //extension of the project
//var transactions = require('./transactions.json');    //extension of the project
//var smartContract = require('../SC.js');    //extension of the project

app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));

function checkID(tokenID){  //check whether an NFT has been already registered
    for(var i=0;i<requests.length;i++){
        if(requests[i].tokenID==tokenID){
            return true
        }
    }
    return false
}

let id=0    //for generating request's IDs

app.post('/createNFT.html',(req,res) => {    
    var newRequest = req.body;
    tokenID = newRequest.tokenID;
    if(!checkID(tokenID)){  //if exists an NFT with that tokenID
        requests.push({ 
                        "id":id,    //assign a requestID(usefull for the server)
                        "addressFrom":newRequest.addressFrom.toLowerCase(),
                        "addressTo":null,   //only for transfer
                        "tokenID":tokenID,
                        "tokenURI":newRequest.tokenURI, //only for mint
                        "operation":"mint",
                        "status":"pending"
                        })
        fs.writeFileSync("./requests.json",JSON.stringify(requests), function(err) {    //stores the user's request inside a file called requests.json
            if (err) throw err;
            //console.log('complete');
            }
        )
        id++;   //increments the requestID
        res.send('<p>Non appena pagherai 0.001 ETH all`indirizzo 0xe6df9c7927B3689429465eAaE2FDebe360509FD3 il tuo NFT verrà creato</p>')
    }else{
        res.send('<p>Esiste già un NFT con questo tokenID.Prova un altro tokenID <a href="createNFT.html">Riprova con un altro tokenID<a></p>')    
    }
})


app.post('/transferNFT.html',(req,res) => {    
    var newRequest = req.body;
    tokenID = newRequest.tokenID;   //the tokenID associated to the NFT to be transferred
    let NFTindex=-1;   //NFTindex inside the NFTs file
    for(var i=0;i<NFTs.length;i++){ //find that NFT inside the NFTs file
        if(NFTs[i].id==tokenID){
            NFTindex=i;
        }
    }
    if(NFTindex==-1){
        res.send('<p>Non ci sono NFT corrispondenti al tokenID che hai digitato <a href="transferNFT.html">Ritorna alla pagina precedente</a></p>') 
    }else if(NFTs[NFTindex].ownerAddress != newRequest.addressFrom){
            res.send('<p> L &#39 indirizzo inserito non corrisponde a quello del proprietario dell &#39 NFT <a href="transferNFT.html">Ritorna alla pagina precedente</a></p>')
    }else if(!(newRequest.addressTo.includes("x")) || newRequest.addressTo.length!=42){
            res.send('<p> L  &#39 indirizzo del destinatario è stato inserito male <a href="transferNFT.html">Ritorna alla pagina precedente</a></p>')
    }else{
        requests.push({ 
            "addressFrom":newRequest.addressFrom.toLowerCase(),
            "addressTo":newRequest.addressTo.toLowerCase(),   //only for transfer
            "tokenID":tokenID,
            "tokenURI":null,    //only for mint
            "operation":"transfer",
            "status":"pending"
            })
        fs.writeFileSync("./requests.json",JSON.stringify(requests), function(err) {
            if (err) throw err; })
        res.send('<p>Non appena pagherai 0.0002 ETH all`indirizzo 0xe6df9c7927B3689429465eAaE2FDebe360509FD3 il tuo NFT verrà trasferito</p>')
    }
})

app.post('/Galleria.html',(req,res) => {    
    var newRequest = req.body;
    let searchParam = newRequest.param;
    let array=[]
    if(String(searchParam).includes("x") && String(searchParam).length==42){    //an address always contains x (for example: 0x....)
        for(var i=0;i<NFTs.length;i++){
            if(NFTs[i].ownerAddress.toLowerCase()==String(searchParam).toLowerCase()){
                array.push(NFTs[i])
                //console.log(NFTs[i])
            }
        }
        if(array.length==0){
            res.send("Non ci sono NFT di cui questo indirizzo è proprietario.<a href='/Galleria.html'>Torna alla pagina di ricerca</a>")
        }else{
            res.json(array)
            res.send("ciao")
        }
    }else if(/^\d+$/.test(String(searchParam))){  //verifies whether the param is a parsible to a number
        for(var j=0;j<NFTs.length;j++){
            if(NFTs[j].id==Number(searchParam)){
                array.push(NFTs[j])
            }
        }
        if(array.length==0){
            res.send("Non ci sono NFT con questo tokenID.<a href='/Galleria.html'>Torna alla pagina di ricerca</a>") 
        }else{
            res.json(array)
        }
    }else{
        res.send("Non ci sono NFT corrispondenti alla tua ricerca.<a href='/Galleria.html'>Torna alla pagina di ricerca</a>")
    }
})

app.get('/NFTs.html',(req,res) => {
    res.json(NFTs)
})

app.listen(3000, function () {  //starts the server on localhost
    console.log("Server is running on 127.0.0.1:3000"); 
});
