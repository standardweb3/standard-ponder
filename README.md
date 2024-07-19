# standard2.0-ponder
a Ponder indexer for Standard

### Directory structure

```
─── 📁abis: Solidity contract ABIs
└── 📁src
    └── 📁consts: Constant  
        └── augment.ts
    └── 📁handlers: Handlers on Lumina contract events
        └── {ContractEvent}.ts
    └── index.ts: Entry point for relayer to react on Lumina contract events
    └── server.ts: Websocket configuration file 
─── ponder.config.ts: Solidity contract indexing configuration
─── ponder.schema.ts: Database schema declaration file. 
    This is where data types to store in DB is defined.
```

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/AXN0Ks?referralCode=DNYk6c)
