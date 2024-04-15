import { formatUnits } from "viem";

export const OrderPlacedHandleAccountOrders = async (event: any, pair: any, Account: any, Order: any, OrderHistory: any) => {
    const id = event.args.owner
      .concat("-")
      .concat(event.args.orderbook)
      .concat("-")
      .concat(event.args.isBid.toString())
      .concat("-")
      .concat(event.args.id.toString());

    const priceD = parseFloat(formatUnits(event.args.price, 8));

    const timestamp = Number(event.block.timestamp)

    await Account.upsert({
        id: event.args.owner,
        create: {
            lastTraded: timestamp,
        },
        update: {
            lastTraded: timestamp
        }
    })

    // upsert Order as the order rewrites on the id circulating with uint32.max
    await Order.upsert({
      id,
      create: {
        orderId: event.args.id,
        isBid: event.args.isBid,
        base: pair!.base,
        quote: pair!.quote,
        orderbook: event.args.orderbook,
        price: priceD,
        amount: event.args.withoutFee,
        placed: event.args.placed,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      },
      update: {
        orderId: event.args.id,
        isBid: event.args.isBid,
        base: pair!.base,
        quote: pair!.quote,
        orderbook: event.args.orderbook,
        price: priceD,
        amount: event.args.withoutFee,
        placed: event.args.placed,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      }
    });

    // upsert OrderHistory as the order rewrites on the id circulating with uint32.max
    await OrderHistory.upsert({
      id,
      create: {
        orderId: event.args.id,
        isBid: event.args.isBid,
        base: pair!.base,
        quote: pair!.quote,
        orderbook: event.args.orderbook,
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
        orderbook: event.args.orderbook,
        price: priceD,
        amount: event.args.withoutFee,
        timestamp: event.block.timestamp,
        maker: event.args.owner,
      },
    });
  };