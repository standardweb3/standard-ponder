import { createConfig } from "@ponder/core";
import { http, createPublicClient } from "viem";
import { MatchingEngineABI } from "./abis/matchingengineAbi";

const latestBlockMode = await createPublicClient({
  transport: http(process.env.MODE_RPC),
}).getBlock();


export default createConfig({
  networks: {
    blast: {
      chainId: 238,
      transport: http(process.env.BLAST_RPC)
    }
  },
  contracts: {
    matchingEngine: {
      abi: MatchingEngineABI,
      address: "0x5Fb6d8e80Aa8829e41053898B8C756E1cdAcbFD9",
      network: {
        blast: {
          startBlock: 2094834,
        }
      }
    }
  },
});
