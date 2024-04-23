import { formatUnits } from "viem";
import { Stablecoin } from "../consts/stablecoin";

export const OrderMatchedHandleToken = async (event: any, pair: any, chainId: any, BaseToken: any) => {
  const id = pair.base;

  if(pair.quote === Stablecoin[chainId]) {
    const priceD = parseFloat(formatUnits(event.args.price, 8));
    BaseToken.update({
      id,
      data: {
        price: priceD
      }
    });
  }
}

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
  contextObj: any
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
  const matchedOrderType = !event.args.isBid;
  
  const volume = getVolume(matchedOrderType, event.args.amount, pair.bDecimal, pair.qDecimal);

  await contextObj.upsert({
    id,
    create: {
      orderbook: event.args.orderbook,
      open: priceD,
      close: priceD,
      low: priceD,
      high: priceD,
      average: priceD,
      count: 1,
      baseVolume: matchedOrderType == false ? volume : 0,
      quoteVolume: matchedOrderType == true ? volume : 0,
      timestamp: aggregatedTime,
    },
    update: ({ current }) => ({
      close: priceD,
      low: current.low > priceD ? priceD : current.low,
      high: current.high < priceD ? priceD : current.high,
      average:
        (current.average * current.count + priceD) / (current.count + 1n),
      count: current.count + 1,
      baseVolume: matchedOrderType == false ? current.baseVolume + volume : 0,
      quoteVolume: matchedOrderType == true ? current.quoteVolume + volume : 0,
    }),
  });
};

export const OrderMatchedHandleMinBuckets = async (
  event: any,
  pair: any,
  MinBucket: any
) => {
  await handleBucketInTime(event, pair, 60, MinBucket);
};

export const OrderMatchedHandleDayBuckets = async (
  event: any,
  pair: any,
  DayBucket: any
) => {
  await handleBucketInTime(event, pair, 60*60*24, DayBucket);
};

export const OrderMatchedHandleHourBuckets = async (
  event: any,
  pair: any,
  HourBucket: any
) => {
  await handleBucketInTime(event, pair, 60*60, HourBucket);
};

export const OrderMatchedHandleBuckets = async (
  event: any,
  pair: any,
  DayBucket: any,
  HourBucket: any,
  MinBucket: any
) => {
  await OrderMatchedHandleDayBuckets(event, pair, DayBucket);
  await OrderMatchedHandleHourBuckets(event, pair, HourBucket);
  await OrderMatchedHandleMinBuckets(event, pair, MinBucket);
};

export const OrderMatchedHandleTrade = async (
  event: any,
  pair: any,
  Trade: any
) => {
  const id = pair!.base
    .concat("-")
    .concat(pair!.quote)
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  const priceD = parseFloat(formatUnits(event.args.price, 8));

  // upsert Trade as the order rewrites on the id circulating with uint32.max
  Trade.upsert({
    id,
    create: {
      orderId: event.args.id,
      base: pair!.base,
      quote: pair!.quote,
      isBid: event.args.isBid,
      price: priceD,
      amount: event.args.amount,
      taker: event.args.sender,
      maker: event.args.owner,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash
    },
    update: {
      orderId: event.args.id,
      base: pair!.base,
      quote: pair!.quote,
      isBid: event.args.isBid,
      price: priceD,
      amount: event.args.amount,
      taker: event.args.sender,
      maker: event.args.owner,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash
    },
  });
};

export const OrderMatchedHandleOrder = async (
  event: any,
  pair: any,
  Order: any
) => {
  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  
  if (event.args.clear) {
    Order.delete({
      id,
    });
  } else {
    Order.update({
      id,
      data: ({current}) => ({
        placed: current.amount - event.args.amount,
        timestamp: event.block.timestamp,
      }),
    });
  }
};
