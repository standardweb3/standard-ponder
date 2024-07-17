import { ponder } from "@/generated";

import {
  OrderCanceledHandleOrder,
  OrderMatchedHandleBuckets,
  OrderMatchedHandleOrder,
  OrderMatchedHandleTrade,
  OrderPlacedHandleAccountOrders,
  PairAddedHandleTokenPairOrderbook,
  NewMarketPriceHandleBuckets,
  NewMarketPriceHandleToken,
} from "./handlers";
import { formatUnits } from "viem";

import io from "./server";

// const knock = new Knock(process.env.KNOCK_API_KEY);

ponder.on("matchingEngine:PairAdded", async ({ event, context }) => {
  const { Analysis, Token, Pair } = context.db;
  const chainId = context.network.chainId;
  await PairAddedHandleTokenPairOrderbook(
    event,
    chainId,
    Analysis,
    Token,
    Pair
  );
});

ponder.on("matchingEngine:OrderMatched", async ({ event, context }) => {
  const {
    Order,
    TradeHistory,
    Tick,
    Pair,
    DayBucket,
    HourBucket,
    MinBucket,
    Trade,
    Token,
    Account,
    Analysis,
  } = context.db;

  // Get Pair Info
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  // Get tick info
  const tickId = event.args.orderbook
    .concat("-")
    .concat(!event.args.isBid.toString())
    .concat("-")
    .concat(event.args.price.toString());
  //console.log("matched", tickId);
  const tickInfo = await Tick.findUnique({
    id: tickId,
  });

  const chainId = context.network.chainId;

  // Update trade info
  await OrderMatchedHandleTrade(
    event,
    chainId,
    Analysis,
    pair,
    Trade,
    Tick,
    tickInfo
  );

  // Update trade buckets
  await OrderMatchedHandleBuckets(
    event,
    pair,
    DayBucket,
    HourBucket,
    MinBucket,
    io
  );

  // Update Order info
  await OrderMatchedHandleOrder(event, pair, Account, Order, TradeHistory);
});


ponder.on("matchingEngine:NewMarketPrice", async ({ event, context }) => {
  const { DayBucket, HourBucket, MinBucket, Pair, Token } = context.db;

  const chainId = context.network.chainId;

  // Get Pair Info
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  // Update token info
  await NewMarketPriceHandleToken(event, pair, chainId, Token);

  await NewMarketPriceHandleBuckets(event, pair, DayBucket, HourBucket, MinBucket, io);
});

ponder.on("matchingEngine:OrderPlaced", async ({ event, context }) => {
  const { Account, Order, Pair, OrderHistory, Tick } = context.db;
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  await OrderPlacedHandleAccountOrders(
    event,
    pair,
    Account,
    Order,
    OrderHistory,
    Tick
  );
});


ponder.on("matchingEngine:OrderCanceled", async ({ event, context }) => {
  const { Order, OrderHistory, Account, Pair } = context.db;
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  await OrderCanceledHandleOrder(event, Account, pair, Order, OrderHistory);
});

//@ts-ignore
ponder.on("stndxp:Transfer", async ({ event, context }) => {
  const { PointAccount } = context.db;
  // @ts-ignore
  if (event.args.from === "0x0000000000000000000000000000000000000000") {
    PointAccount.upsert({
      // @ts-ignore
      id: event.args.to,
      create: {
        points: formatUnits(event.args.value, 18),
      },
      update: ({ current }: any) => ({
        points: current.points + formatUnits(event.args.value, 18),
      }),
    });
  }
});
