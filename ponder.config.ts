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
      address: "0x2e2044e5De8a89eC292D7736b0289eCF7eA6Df7A",
      network: {
        blast: {
          startBlock: 2094834,
        }
      }
    }
  },
});
