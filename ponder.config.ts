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
      address: "0x8D44C188E64045b64879fc7FD9fa80d81AbF9942",
      network: {
        blast: {
          startBlock: 2094834,
        }
      }
    }
  },
});
