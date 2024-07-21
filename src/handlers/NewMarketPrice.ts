import { formatUnits } from "viem";
import { Stablecoin } from "../consts/stablecoin";

export const NewMarketPriceHandleBuckets = async (
  event: any,
  pair: any,
  DayBucket: any,
  HourBucket: any,
  MinBucket: any,
  io: any
) => {
  await NewMarketPriceHandleDayBuckets(event, pair, DayBucket, io);
  await NewMarketPriceHandleHourBuckets(event, pair, HourBucket, io);
  await NewMarketPriceHandleMinBuckets(event, pair, MinBucket, io);
};

export const NewMarketPriceHandleToken = async (
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

  let bucket = await contextObj.findUnique({ id });
  if (bucket) {
    bucket = {
      ...bucket,
      close: priceD,
      low: priceD < bucket.low ? priceD : bucket.low,
      high: priceD > bucket.high ? priceD : bucket.high,
      average: (bucket.average * bucket.count + priceD) / (bucket.count + 1),
      count: bucket.count + 1,
    };
    await contextObj.update({
      id,
      data: {
        close: priceD,
        low: priceD < bucket.low ? priceD : bucket.low,
        high: priceD > bucket.high ? priceD : bucket.high,
        average: (bucket.average * bucket.count + priceD) / (bucket.count + 1),
        count: bucket.count + 1,
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
        baseVolume: 0,
        quoteVolume: 0,
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
      baseVolume: 0,
      quoteVolume: 0,
      timestamp: aggregatedTime,
    });
  }
};

export const NewMarketPriceHandleMinBuckets = async (
  event: any,
  pair: any,
  MinBucket: any,
  io: any
) => {
  await handleBucketInTime(event, pair, 60, MinBucket, io, "min");
};

export const NewMarketPriceHandleDayBuckets = async (
  event: any,
  pair: any,
  DayBucket: any,
  io: any
) => {
  await handleBucketInTime(event, pair, 60 * 60 * 24, DayBucket, io, "day");
};

export const NewMarketPriceHandleHourBuckets = async (
  event: any,
  pair: any,
  HourBucket: any,
  io: any
) => {
  await handleBucketInTime(event, pair, 60 * 60, HourBucket, io, "hour");
};
