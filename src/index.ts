import { ponder } from "@/generated";

import { Knock } from "@knocklabs/node";
import {
  OrderMatchedHandleBuckets,
  OrderMatchedHandleOrder,
  OrderMatchedHandleTrade,
  OrderPlacedHandleOrders,
} from "./utils";

const knock = new Knock(process.env.KNOCK_API_KEY);

ponder.on("matchingEngine:PairAdded", async ({ event, context }) => {
  const { Pair, Token } = context.db;

  await Pair.create({
    id: event.args.orderbook,
    data: {
      base: event.args.base,
      quote: event.args.quote,
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
  const { Order, Pair, DayBucket, HourBucket, MinBucket, Trade } = context.db;

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
  await OrderMatchedHandleOrder(event, pair, Order);
});

ponder.on("matchingEngine:OrderPlaced", async ({ event, context }) => {
  const { Order, Pair, OrderHistory } = context.db;
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  await OrderPlacedHandleOrders(event, pair, Order, OrderHistory);
});

ponder.on("matchingEngine:OrderCanceled", async ({ event, context }) => {
  const { Order, OrderHistory } = context.db;

  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString());

  const canceled = await OrderHistory.findUnique({
    id,
  });

  if (canceled!.amount - event.args.amount == 0n) {
    OrderHistory.delete({
      id,
    });
  } else {
    OrderHistory.update({
      id,
      data: {
        amount: canceled!.amount - event.args.amount,
      },
    });
  }

  Order.delete({
    id,
  });
});
