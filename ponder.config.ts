import { createConfig } from "@ponder/core";
import { http } from "viem";
import { MatchingEngineABI } from "./abis/matchingengineAbi";

export default createConfig({
  networks: {
    blast: {
      chainId: 238,
      transport: http(process.env.RPC)
    }
  },
  contracts: {
    matchingEngine: {
      abi: MatchingEngineABI,
      address: process.env.CONTRACT,
      network: {
        blast: {
          startBlock: process.env.STARTBLOCK,
        }
      }
    }
  }
});
