import { formatUnits } from "viem";
import { Stablecoin } from "../consts/stablecoin";

export const OrderMatchedHandleToken = async (
  event: any,
  pair: any,
  chainId: any,
  BaseToken: any
) => {
  const id = pair.base;

  if (pair.quote === Stablecoin[chainId]) {
    const priceD = parseFloat(formatUnits(event.args.price, 8));
    BaseToken.update({
      id,
      data: {
        price: priceD,
      },
    });
  }
};

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

const handleBucketInTime = async (
  event: any,
  pair: any,
  seconds: any,
  contextObj: any,
  io: any,
  channel: string
) => {
  const secondsInBI = BigInt(seconds);
  const aggregatedTime = Math.floor(
    Number((event.block.timestamp / secondsInBI) * secondsInBI)
  );
  const id = pair!.base
    .concat("-")
    .concat(pair!.quote)
    .concat("-")
    .concat(aggregatedTime.toString());

  const priceD = parseFloat(formatUnits(event.args.price, 8));

  const matchedOrderType = event.args.isBid;

  // true then quote volume, false then base volume
  const volume = getVolume(
    matchedOrderType,
    event.args.amount,
    pair.bDecimal,
    pair.qDecimal
  );

  // true then base volume, false then quote volume
  const counterVolume =
    matchedOrderType == true ? volume / priceD : volume * priceD;

  const baseVolume = matchedOrderType == true ? counterVolume : volume;
  const quoteVolume = matchedOrderType == false ? counterVolume : volume;

  let bucket = await contextObj.findUnique({ id });
  if (bucket) {
    bucket = {
      ...bucket,
      close: priceD,
      low: priceD < bucket.low ? priceD : bucket.low,
      high: priceD > bucket.high ? priceD : bucket.high,
      average: (bucket.average * bucket.count + priceD) / (bucket.count + 1),
      count: bucket.count + 1,
      baseVolume: bucket.baseVolume + baseVolume,
      quoteVolume: bucket.quoteVolume + quoteVolume,
    };
    await contextObj.update({
      id,
      data: {
        close: priceD,
        low: priceD < bucket.low ? priceD : bucket.low,
        high: priceD > bucket.high ? priceD : bucket.high,
        average: (bucket.average * bucket.count + priceD) / (bucket.count + 1),
        count: bucket.count + 1,
        baseVolume: bucket.baseVolume + baseVolume,
        quoteVolume: bucket.quoteVolume + quoteVolume,
      },
    });
    await io.emit(channel, bucket);
  } else {
    await contextObj.create({
      id,
      data: {
        orderbook: event.args.orderbook,
        base: pair.base,
        quote: pair.quote,
        open: priceD,
        close: priceD,
        low: priceD,
        high: priceD,
        average: priceD,
        count: 1,
        baseVolume,
        quoteVolume,
        timestamp: aggregatedTime,
      },
    });
    await io.emit(channel, {
      id,
      orderbook: event.args.orderbook,
      base: pair.base,
      quote: pair.quote,
      open: priceD,
      close: priceD,
      low: priceD,
      high: priceD,
      average: priceD,
      count: 1,
      baseVolume,
      quoteVolume,
      timestamp: aggregatedTime,
    });
  }
};

export const OrderMatchedHandleMinBuckets = async (
  event: any,
  pair: any,
  MinBucket: any,
  io: any
) => {
  await handleBucketInTime(event, pair, 60, MinBucket, io, "min");
};

export const OrderMatchedHandleDayBuckets = async (
  event: any,
  pair: any,
  DayBucket: any,
  io: any
) => {
  await handleBucketInTime(event, pair, 60 * 60 * 24, DayBucket, io, "day");
};

export const OrderMatchedHandleHourBuckets = async (
  event: any,
  pair: any,
  HourBucket: any,
  io: any
) => {
  await handleBucketInTime(event, pair, 60 * 60, HourBucket, io, "hour");
};

export const OrderMatchedHandleBuckets = async (
  event: any,
  pair: any,
  DayBucket: any,
  HourBucket: any,
  MinBucket: any,
  io: any
) => {
  await OrderMatchedHandleDayBuckets(event, pair, DayBucket, io);
  await OrderMatchedHandleHourBuckets(event, pair, HourBucket, io);
  await OrderMatchedHandleMinBuckets(event, pair, MinBucket, io);
};

export const OrderMatchedHandleTrade = async (
  event: any,
  chainId: any,
  Analysis: any,
  pair: any,
  Trade: any,
  Tick: any,
  tickInfo: any,
  io: any
) => {
  const id = pair!.base
    .concat("-")
    .concat(pair!.quote)
    .concat("-")
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  const priceD = parseFloat(formatUnits(event.args.price, 8));
  // amountD is quote amount on isBid true, base amount on isBid false
  const amountD = getVolume(
    event.args.isBid,
    event.args.amount,
    pair.bDecimal,
    pair.qDecimal
  );
  // counter amount in decimal, when isBid is true, counter is base amount, when isBid is false, counter is quote amount
  const counterD = event.args.isBid ? amountD / priceD : amountD * priceD;

  // upsert Trade as the order rewrites on the id circulating with uint32.max
  await Trade.upsert({
    id,
    create: {
      orderId: Number(event.args.id),
      base: pair!.base,
      quote: pair!.quote,
      isBid: event.args.isBid,
      price: priceD,
      baseAmount: event.args.isBid ? counterD : amountD,
      quoteAmount: event.args.isBid ? amountD : counterD,
      taker: event.args.sender,
      maker: event.args.owner,
      timestamp: Number(event.block.timestamp),
      txHash: event.transaction.hash,
    },
    update: {
      orderId: Number(event.args.id),
      base: pair!.base,
      quote: pair!.quote,
      isBid: event.args.isBid,
      price: priceD,
      baseAmount: event.args.isBid ? counterD : amountD,
      quoteAmount: event.args.isBid ? amountD : counterD,
      taker: event.args.sender,
      maker: event.args.owner,
      timestamp: Number(event.block.timestamp),
      txHash: event.transaction.hash,
    },
  });

  // report to client
  await io.emit("trade", {
    id,
    orderId: Number(event.args.id),
    base: pair!.base,
    quote: pair!.quote,
    isBid: event.args.isBid,
    price: priceD,
    baseAmount: event.args.isBid ? counterD : amountD,
    quoteAmount: event.args.isBid ? amountD : counterD,
    taker: event.args.sender,
    maker: event.args.owner,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });

  // Subtract matched amount in tick
  const tickId = event.args.orderbook
    .concat("-")
    .concat(!event.args.isBid.toString())
    .concat("-")
    .concat(event.args.price.toString());

  // Matched amount in tick, if the matched tick is sell order with base amount, amountD is quote amount to match,
  // if the matched tick is buy order with quote amount, amountD is base amount to match
  const matched = counterD;
  if (tickInfo != null) {
    if (event.args.clear && tickInfo.count - 1 == 0) {
      await Tick.delete({
        id: tickId,
      });
      // report to client
      await io.emit("deleteTick", {
        id: tickId,
      });
    } else {
      await Tick.update({
        id: tickId,
        data: ({ current }: any) => ({
          amount: current.amount - matched < 0 ? 0 : current.amount - matched,
          count: event.args.clear ? current.count - 1 : current.count,
        }),
      });
      // report to client
      await io.emit("tick", {
        id: tickId,
        orderbook: event.args.orderbook,
        price: priceD,
        amount: tickInfo?.amount - matched < 0 ? 0 : tickInfo?.amount - matched,
        count: event.args.clear ? tickInfo?.count - 1 : tickInfo?.count,
      });
    }
  }

  await Analysis.upsert({
    id: chainId,
    create: {
      totalGlobalTrades: 1,
    },
    update: ({ current }: any) => ({
      totalGlobalTrades: current.totalGlobalTrades + 1,
    }),
  });
};

export const OrderMatchedHandleOrder = async (
  event: any,
  pair: any,
  Account: any,
  Order: any,
  TradeHistory: any,
  io: any
) => {
  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  const order = await Order.findUnique({
    id,
  });

  // if isBid is true, quote amount is in event, if isBid is false, base amount is in event
  // the amount sender deposited if isBid=true is quoteAmount, the amount sender deposited if isBid=false is baseAmount
  // normalize the amount with appropriate decimal
  const amountD = getVolume(
    event.args.isBid,
    event.args.amount,
    pair.bDecimal,
    pair.qDecimal
  );
  // counter amount in decimal, when isBid is true, counter is base amount, when isBid is false, counter is quote amount
  const counterD = event.args.isBid ? amountD / order.price : amountD * order.price;

  if (event.args.clear) {
    await Order.delete({
      id,
    });

    // report to client
    await io.emit("deleteOrder", {
      id,
    });

    Account.update({
      id: event.args.owner,
      data: ({ current }: any) => ({
        totalOrders: current.totalOrders - 1,
      }),
    });
  } else {
    await Order.update({
      id,
      data: {
        placed: order.placed >= counterD ? order.placed - counterD : 0,
        timestamp: Number(event.block.timestamp),
      },
    });

    // report to client
    await io.emit("order", {
      ...order,
      id,
      placed: order.placed >= counterD ? order.placed - counterD : 0,
      timestamp: Number(event.block.timestamp),
    });
  }

  const timestamp = Number(event.block.timestamp);

  // add trade history count to both taker and maker
  await Account.upsert({
    id: event.args.sender,
    create: {
      lastTraded: timestamp,
      totalOrders: 0,
      totalOrderHistory: 0,
      totalTradeHistory: 1,
    },
    update: ({ current }: any) => ({
      totalTradeHistory: current.totalTradeHistory + 1,
    }),
  });

  await Account.upsert({
    id: event.args.owner,
    create: {
      lastTraded: timestamp,
      totalOrders: 0,
      totalOrderHistory: 0,
      totalTradeHistory: 1,
    },
    update: ({ current }: any) => ({
      // do not add up when sender == owner
      totalTradeHistory: current.totalTradeHistory + 1,
    }),
  });

  // Add Trade history for both taker and maker
  const makerHistoryId = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(!event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString())
    .concat("-")
    .concat(event.transaction.hash.toString());

  const takerHistoryId = event.args.sender
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString())
    .concat("-")
    .concat(event.transaction.hash.toString());

  // add matched order to maker trade history

  await TradeHistory.upsert({
    id: makerHistoryId,
    create: {
      orderId: Number(event.args.id),
      base: pair!.base,
      quote: pair!.quote,
      isBid: !event.args.isBid,
      orderbook: event.args.orderbook,
      price: order.price,
      amount: counterD,
      taker: event.args.sender,
      maker: event.args.owner,
      account: event.args.owner,
      timestamp: Number(event.block.timestamp),
      txHash: event.transaction.hash,
    },
    update: {
      orderId: Number(event.args.id),
      base: pair!.base,
      quote: pair!.quote,
      isBid: !event.args.isBid,
      orderbook: event.args.orderbook,
      price: order.price,
      amount: counterD,
      taker: event.args.sender,
      maker: event.args.owner,
      account: event.args.owner,
      timestamp: Number(event.block.timestamp),
      txHash: event.transaction.hash,
    },
  });
  // Report to client
  await io.emit("tradeHistory", {
    id: makerHistoryId,
    orderId: Number(event.args.id),
    base: pair!.base,
    quote: pair!.quote,
    isBid: !event.args.isBid,
    orderbook: event.args.orderbook,
    price: order.price,
    amount: counterD,
    taker: event.args.sender,
    maker: event.args.owner,
    account: event.args.owner,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });

  // add matched order to taker Trade history
  await TradeHistory.upsert({
    id: takerHistoryId,
    create: {
      orderId: Number(event.args.id),
      base: pair!.base,
      quote: pair!.quote,
      isBid: event.args.isBid,
      orderbook: event.args.orderbook,
      price: order.price,
      amount: amountD,
      taker: event.args.sender,
      maker: event.args.owner,
      account: event.args.sender,
      timestamp: Number(event.block.timestamp),
      txHash: event.transaction.hash,
    },
    update: {
      orderId: Number(event.args.id),
      base: pair!.base,
      quote: pair!.quote,
      isBid: event.args.isBid,
      orderbook: event.args.orderbook,
      price: order.price,
      amount: amountD,
      taker: event.args.sender,
      maker: event.args.owner,
      account: event.args.sender,
      timestamp: Number(event.block.timestamp),
      txHash: event.transaction.hash,
    },
  });
  // report to client
  await io.emit("tradeHistory", {
    id: takerHistoryId,
    orderId: Number(event.args.id),
    base: pair!.base,
    quote: pair!.quote,
    isBid: event.args.isBid,
    orderbook: event.args.orderbook,
    price: order.price,
    amount: amountD,
    taker: event.args.sender,
    maker: event.args.owner,
    account: event.args.sender,
    timestamp: Number(event.block.timestamp),
    txHash: event.transaction.hash,
  });
};
