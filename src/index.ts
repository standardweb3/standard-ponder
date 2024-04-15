import { ponder } from "@/generated";

import { Knock } from "@knocklabs/node";
import {
  OrderCanceledHandleOrder,
  OrderMatchedHandleBuckets,
  OrderMatchedHandleOrder,
  OrderMatchedHandleTrade,
  OrderPlacedHandleAccountOrders,
} from "./utils";

const knock = new Knock(process.env.KNOCK_API_KEY);

ponder.on("matchingEngine:PairAdded", async ({ event, context }) => {
  const { Pair, Token } = context.db;

  const id = event.args.orderbook;

  await Pair.create({
    id,
    data: {
      base: event.args.base,
      quote: event.args.quote,
      orderbook: event.args.orderbook,
      bDecimal: event.args.bDecimal,
      qDecimal: event.args.qDecimal,
    },
  });

  await Token.create({
    id: event.args.base,
    data: {
      price: 0,
      cgPrice: 0.0,
      cgId: "",
    },
  });
  await Token.create({
    id: event.args.quote,
    data: {
      price: 0,
      cgPrice: 0.0,
      cgId: "",
    },
  });
});

ponder.on("matchingEngine:OrderMatched", async ({ event, context }) => {
  const { BidOrder, AskOrder, Pair, DayBucket, HourBucket, MinBucket, Trade } = context.db;

  // Get Pair Info
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  // Update trade info
  await OrderMatchedHandleTrade(event, pair, Trade);

  // Update trade buckets
  await OrderMatchedHandleBuckets(
    event,
    pair,
    DayBucket,
    HourBucket,
    MinBucket
  );

  // Update recent transactions
  await OrderMatchedHandleTrade(event, pair, Trade);

  // Update Order info
  // if matching order is buy
  if(!event.args.isBid) {
    await OrderMatchedHandleOrder(event, pair, BidOrder);
  } else {
    await OrderMatchedHandleOrder(event, pair, AskOrder);
  }
 
});

ponder.on("matchingEngine:OrderPlaced", async ({ event, context }) => {
  const { Account, BidOrder, AskOrder, Pair, BidOrderHistory, AskOrderHistory } = context.db;
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });
  
  if(event.args.isBid) {
    await OrderPlacedHandleAccountOrders(event, pair, Account, BidOrder, BidOrderHistory);
  } else {
    await OrderPlacedHandleAccountOrders(event, pair, Account, AskOrder, AskOrderHistory);
  }
});

ponder.on("matchingEngine:OrderCanceled", async ({ event, context }) => {
  const { BidOrder, AskOrder, BidOrderHistory, AskOrderHistory } = context.db;

  if(event.args.isBid) {
    await OrderCanceledHandleOrder(event, BidOrder, BidOrderHistory);
  } else {
    await OrderCanceledHandleOrder(event, AskOrder, AskOrderHistory);
  }
});
