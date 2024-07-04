import { formatUnits } from "viem";

const getVolume = (
  isBid: any,
  amount: bigint,
  bDecimal: any,
  qDecimal: any
) => {
  if (isBid) {
    const quoteD = formatUnits(amount, qDecimal);
    return parseFloat(quoteD);
  } else {
    const baseD = formatUnits(amount, bDecimal);
    return parseFloat(baseD);
  }
};

export const OrderPlacedHandleAccountOrders = async (
  event: any,
  pair: any,
  Account: any,
  Order: any,
  OrderHistory: any,
  Tick: any
) => {
  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString());

  const priceD = parseFloat(formatUnits(event.args.price, 8));

  const amountD = getVolume(event.args.isBid, event.args.withoutFee, pair.bDecimal, pair.qDecimal);
  
  const placedD = getVolume(event.args.isBid, event.args.placed, pair.bDecimal, pair.qDecimal);

  const timestamp = Number(event.block.timestamp);

  await Account.upsert({
    id: event.args.owner,
    create: {
      lastTraded: timestamp,
      totalOrders: 1,
      totalOrderHistory: 1,
      totalTradeHistory: 0,
    },
    update: ({ current }: any) => ({
      lastTraded: timestamp,
      totalOrders: current.totalOrders + 1,
      totalOrderHistory: current.totalOrderHistory + 1,
    }),
  });

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
      amount: amountD,
      placed: placedD,
      timestamp: event.block.timestamp,
      account: event.args.owner,
      txHash: event.transaction.hash,
    },
    update: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      orderbook: event.args.orderbook,
      price: priceD,
      amount: amountD,
      placed: placedD,
      timestamp: event.block.timestamp,
      account: event.args.owner,
      txHash: event.transaction.hash,
    },
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
      amount: amountD,
      timestamp: event.block.timestamp,
      account: event.args.owner,
      txHash: event.transaction.hash,
    },
    update: {
      orderId: event.args.id,
      isBid: event.args.isBid,
      base: pair!.base,
      quote: pair!.quote,
      orderbook: event.args.orderbook,
      price: priceD,
      amount: amountD,
      timestamp: event.block.timestamp,
      account: event.args.owner,
      txHash: event.transaction.hash,
    },
  });

  // upsert tick in a placed price with a unique id
  const tickId = event.args.orderbook.concat("-").concat((event.args.isBid).toString()).concat("-").concat(event.args.price.toString());
  console.log("placed", tickId )
  await Tick.upsert({
    id: tickId,
    create: {
      orderbook: event.args.orderbook,
      isBid: event.args.isBid,
      price: priceD,
      amount: amountD,
    }, update({ current }: any) {
      return {
        amount: current.amount + amountD,
      };
    }
  });
};
