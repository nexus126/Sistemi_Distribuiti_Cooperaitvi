Alla base di questo progetto c'è la creazione di uno Smart Contrat Ethereum che consenta operazioni sugli NFT.
Fra queste operazioni le più importanti sono :
- generazione di NFT
- memorizzazione di NFT
- trasferimento

L'idea alla base è quella di creare un servizio sottoforma di WebApp che esegua tutte le funzionalità dello smart contract ed in più che rappresenti un portale per la visualizzazione di NFT creati.
Quindi per l'utente che non conosce il linguaggio di Ethereum con questa WebApp risulterebbe molto facile effettuare operazioni sugli NFT.
Il flusso di esecuzione dell'applicazione è il seguente:
1) Un utente effettua una richiesta legata ad una specifica operazione sugli NFT.
2) Se la richiesta è lecita(cioè i dati al suo interno sono corretti ad es. indirizzi giusti,tokenID esistenti.) viene chiesto all'utente di effettuare un pagamento verso il proprietario dello Smart Contract. Questo pagamento può essere effettuato attraverso applicazioni terze(come Metamask ad esempio).
3) A quel punto manualmente il gestore del Server visualizzerà tra le pagamenti in entrata quello che ha come mittente l'indirizzo dell'utente che ha effettuato la richiesta e quindi l'operazione su NFT(creazione o trasferimento) verrà effettuata invocando il file interface.js.

NOTA: in questa applicazione si è scelto che solamente il creatore dello smart contract ha diritto di creazione e trasferimento degli NFT.

Le pagine web che offrono un'interfaccia per l'effettuazione di richieste di creazione o trasferimento sono:  "createNFT.html" e "transferNFT.html" presenti in WebPage/static e processate da server.js.
Infine c'è una pagina attraverso la quale navigare tra gli NFT creati dallo smart contract "GalleriaNFT.html" in /WebPage/static.

Dettagli Implementativi :

- Lo Smart Contract è stato creato sulla rete di test Sepolia facente parte dell'ambiente Ethereum,ma è perfettamente funzionante anche su Mainnet(che ha evidentemente gasPrice differente) modificando il file truffle-config.js.
- Lo standard degli NFT considerato è ERC721.
- Tra le librerie più importanti utilizzate ci sono truffle,openzeppelin,web3(per la parte dello Smart Contract) e express per la parte backend della pagina web.
- L'insieme delle richieste effettuate dagli utenti e l'insieme degli NFT creati sono memorizzati all'interno di files json che vengono letti periodicamente dal gestore del servizio.

Limitazioni e Sviluppi Futuri:

Una forte limitazione di questo servizio il cui obiettivo è quello di facilitare gli utenti nell'interazione con gli NFT è legata al fatto che le richieste di transfer o create fatte dagli utenti non vengono processate il automatico.L'obiettivo originale era quello di processarle in automatico, ma ciò avrebbe esposto l'applicazione a delle vulnerabilità.Infatti un utente malintenzionato avrebbe potuto creare NFT con l'indirizzo di qualcun altro.Dunque la soluzione più semplice proposta è stata quella di richiedere al proprietario dell'indirizzo(chiave pubblica) di effettuare prima il pagamento attaverso una terza applicazione(per effettuare questo pagamento l'utente ha bisogno della chiave privata).
Una soluzione più smart e che consente anche di automatizzare l'intero processo di gestione della richiesta consiste nell'integrare all'interno della WebApp queste applicazioni terze mediante opportune API.
Oltre a quello appena descritto tra gli sviluppi futuri c'è anche quello di customizzare l'intera applicazione per NFT legati ad opere d'arte poiché l'idea all'origine era proprio quella di creare un portale per la creazione e interazioni con opere d'arte digitali.
















