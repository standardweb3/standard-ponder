import { createConfig } from "@ponder/core";
import { http, createPublicClient } from "viem";
import { MatchingEngineABI } from "./abis/matchingengineAbi";

const latestBlockMode = await createPublicClient({
  transport: http(process.env.MODE_RPC),
}).getBlock();


export default createConfig({
  networks: {
    mode: {
      chainId: 34443,
      transport: http(process.env.MODE_RPC)
    }
  },
  contracts: {
    matchingEngine: {
      abi: MatchingEngineABI,
      address: "0x3df48559F01F07691D03179380919767553a74f8",
      network: {
        mode: {
          startBlock: 6257308,
        }
      }
    }
  },
});
