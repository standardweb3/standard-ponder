import { formatUnits } from "viem";

export const OrderPlacedHandleOrders = async (event: any, pair: any, Order: any, OrderHistory: any) => {
    const id = event.args.owner
      .concat("-")
      .concat(event.args.orderbook)
      .concat("-")
      .concat(event.args.isBid.toString())
      .concat("-")
      .concat(event.args.id.toString());

    const priceD = parseFloat(formatUnits(event.args.price, 8));


    await Order.create({
      id,
      data: {
        orderId: event.args.id,
        isBid: event.args.isBid,
        base: pair!.base,
        quote: pair!.quote,
        price: priceD,
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
        price: priceD,
        amount: event.args.withoutFee,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      },
      update: {
        orderId: event.args.id,
        isBid: event.args.isBid,
        base: pair!.base,
        quote: pair!.quote,
        price: priceD,
        amount: event.args.withoutFee,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      },
    });
  };