import { createConfig, mergeAbis } from "@ponder/core";
import { http } from "viem";
import { MatchingEngineABI } from "./abis/matchingengineAbi";
import { STNDXPABI } from "./abis/stndxpAbi";

export default createConfig({
  networks: {
    deployed: {
      chainId: parseInt(process.env.CHAINID!),
      transport: http(process.env.RPC)
    }
  },
  contracts: {
    matchingEngine: {
      abi: MatchingEngineABI,
      address: process.env.CONTRACT as `0x${string}`,
      network: {
        deployed: {
          startBlock: parseInt(process.env.STARTBLOCK as string),
        }
      }
    },
    stndxp: {
      abi: mergeAbis([MatchingEngineABI, STNDXPABI]),
      address: process.env.STNDXP as `0x${string}`,
      network: {
        deployed: {
          startBlock: parseInt(process.env.STARTBLOCK as string),
        }
      }
    }
  }
});
