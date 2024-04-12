import { ponder } from "@/generated";

ponder.on("matchingEngine:PairAdded", async ({ event, context }) => {
  const { Pair } = context.db;

  await Pair.create({
    id: event.args.orderbook,
    data: {
      base: event.args.base,
      quote: event.args.quote,
      bDecimal: BigInt(event.args.bDecimal),
      qDecimal: BigInt(event.args.qDecimal),
    },
  });
});

ponder.on("matchingEngine:OrderMatched", async ({ event, context }) => {
  const { Order, Pair } = context.db;

  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  const placed = await Order.findUnique({
    id,
  });

  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  if (placed!.amount - event.args.amount == 0n) {
    Order.delete({
      id,
    });
  } else {
    Order.update({
      id,
      data: {
        orderId: event.args.id,
        isBid: event.args.isBid,
        base: pair!.base,
        quote: pair!.quote,
        price: event.args.price,
        amount: placed!.amount - event.args.amount,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      },
    });
  }
});

ponder.on("matchingEngine:OrderPlaced", async ({ event, context }) => {
  const { Account, Order, Pair, OrderHistory } = context.db;
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString());

  await Order.create({
    id,
    data: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      price: event.args.price,
      amount: event.args.amount,
      timestamp: event.block.timestamp,
      maker: event.args.owner,
    },
  });
  await OrderHistory.create({
    id,
    data: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      price: event.args.price,
      amount: event.args.amount,
      timestamp: event.block.timestamp,
      maker: event.args.owner,
    },
  });
});

ponder.on("matchingEngine:OrderCanceled", async ({ event, context }) => {
  const { Order } = context.db;

  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  Order.delete({
    id,
  });
});
