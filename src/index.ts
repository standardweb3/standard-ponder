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
    .concat(event.args.id.toString())

  const placed = await Order.findUnique({
    id,
  });

  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  if (event.args.clear) {
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
        amount: placed!.amount,
        placed: placed!.amount - event.args.amount,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      },
    });
  }
});

ponder.on("matchingEngine:OrderPlaced", async ({ event, context }) => {
  const { Order, Pair, OrderHistory } = context.db;
  const pair = await Pair.findUnique({
    id: event.args.orderbook,
  });

  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString())

  await Order.create({
    id,
    data: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      price: event.args.price,
      amount: event.args.withoutFee,
      placed: event.args.placed,
      timestamp: event.block.timestamp,
      maker: event.args.owner,
    },
  });
  await OrderHistory.upsert({
    id,
    create: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      price: event.args.price,
      amount: event.args.withoutFee,
      timestamp: event.block.timestamp,
      maker: event.args.owner,
    },
    update: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      price: event.args.price,
      amount: event.args.withoutFee,
      timestamp: event.block.timestamp,
      maker: event.args.owner,
    },
  });
});

ponder.on("matchingEngine:OrderCanceled", async ({ event, context }) => {
  const { Order, OrderHistory } = context.db;

  const id = event.args.owner
  .concat("-")
  .concat(event.args.orderbook)
  .concat("-")
  .concat(event.args.isBid.toString())
  .concat("-")
  .concat(event.args.id.toString())  

  const canceled = await OrderHistory.findUnique({
    id,
  });

  if(canceled!.amount - event.args.amount == 0n) {
    OrderHistory.delete({
      id,
    })
  } else {
    OrderHistory.update({
      id, 
      data: {
        amount: canceled!.amount - event.args.amount
      }
    })
  }

  
  
  Order.delete({
    id,
  });
});
