import { createConfig, mergeAbis } from "@ponder/core";
import { http } from "viem";
import { MatchingEngineABI } from "./abis/matchingengineAbi";
import { STNDXPABI } from "./abis/stndxpAbi";
import defaultTokenList from "@standardweb3/default-token-list";

const networkName = process.env.NETWORKNAME ?? "Base";

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
      address: defaultTokenList.matchingEngine[networkName].address as `0x${string}`,
      network: {
        deployed: {
          startBlock: parseInt(defaultTokenList.matchingEngine[networkName].startBlock as string),
        }
      }
    }
  }
});
