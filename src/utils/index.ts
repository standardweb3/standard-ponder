import { timeStamp } from "console";
import { formatUnits } from "viem";

const getBaseVolume = (
    isBid: any,
    price: any,
    amount: bigint,
    bDecimal: any,
    qDecimal: any
  ) => {
    if (isBid) {
      const priceD = formatUnits(price, 8);
      const quoteD = formatUnits(amount, qDecimal);
      return parseFloat(quoteD) / parseFloat(priceD);
    } else {
      const baseD = formatUnits(amount, bDecimal);
      return parseFloat(baseD);
    }
  };

export const OrderMatchedHandleMinBuckets = async (
    event: any,
    pair: any,
    MinBucket: any
  ) => {
    const secondsInMin = BigInt(60);
    const aggregatedTime = Math.floor(
        Number((event.block.timestamp / secondsInMin) * secondsInMin)
      );
    const minId = pair!.base
      .concat("-")
      .concat(pair!.quote)
      .concat("-")
      .concat(
        aggregatedTime.toString()
      );
  
    const baseVolume = getBaseVolume(
      event.args.isBid,
      event.args.price,
      event.args.amount,
      pair!.bDecimal,
      pair!.qDecimal
    );
  
    await MinBucket.upsert({
      id: minId,
      create: {
        open: event.args.price,
        close: event.args.price,
        low: event.args.price,
        high: event.args.price,
        average: event.args.price,
        count: 1n,
        volume: baseVolume,
        timestamp: aggregatedTime
      },
      update: ({ current }) => ({
        close: event.args.price,
        low: current.low > event.args.price ? event.args.price : current.low,
        high: current.high < event.args.price ? event.args.price : current.high,
        average:
          (current.average * current.count + event.args.price) /
          (current.count + 1n),
        count: current.count + 1n,
        volume: current.volume + baseVolume,
      }),
    });
  };

export const OrderMatchedHandleDayBuckets = async (
    event: any,
    pair: any,
    DayBucket: any
  ) => {
    const secondsInDay = BigInt(60 * 60 * 24);
    const aggregatedTime = Math.floor(
        Number((event.block.timestamp / secondsInDay) * secondsInDay)
    );
    const dayId = pair!.base
      .concat("-")
      .concat(pair!.quote)
      .concat("-")
      .concat(
        aggregatedTime.toString()
      );
  
    const baseVolume = getBaseVolume(
      event.args.isBid,
      event.args.price,
      event.args.amount,
      pair!.bDecimal,
      pair!.qDecimal
    );
  
    await DayBucket.upsert({
      id: dayId,
      create: {
        open: event.args.price,
        close: event.args.price,
        low: event.args.price,
        high: event.args.price,
        average: event.args.price,
        count: 1n,
        volume: baseVolume,
        timestamp: aggregatedTime
      },
      update: ({ current }) => ({
        close: event.args.price,
        low: current.low > event.args.price ? event.args.price : current.low,
        high: current.high < event.args.price ? event.args.price : current.high,
        average:
          (current.average * current.count + event.args.price) /
          (current.count + 1n),
        count: current.count + 1n,
        volume: current.volume + baseVolume,
      }),
    });
  };

export const OrderMatchedHandleHourBuckets = async (
  event: any,
  pair: any,
  HourBucket: any
) => {
  const secondsInHour = BigInt(60 * 60);
  const aggregatedTime = Math.floor(
    Number((event.block.timestamp / secondsInHour) * secondsInHour)
  );
  const hourId = pair!.base
    .concat("-")
    .concat(pair!.quote)
    .concat("-")
    .concat(
      aggregatedTime.toString()
    );

  const baseVolume = getBaseVolume(
    event.args.isBid,
    event.args.price,
    event.args.amount,
    pair!.bDecimal,
    pair!.qDecimal
  );

  await HourBucket.upsert({
    id: hourId,
    create: {
      open: event.args.price,
      close: event.args.price,
      low: event.args.price,
      high: event.args.price,
      average: event.args.price,
      count: 1n,
      volume: baseVolume,
      timestamp: aggregatedTime
    },
    update: ({ current }) => ({
      close: event.args.price,
      low: current.low > event.args.price ? event.args.price : current.low,
      high: current.high < event.args.price ? event.args.price : current.high,
      average:
        (current.average * current.count + event.args.price) /
        (current.count + 1n),
      count: current.count + 1n,
      volume: current.volume + baseVolume
    }),
  });
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
  const id = event.args.orderbook
    .concat("-")
    .concat((!event.args.isBid).toString())
    .concat("-")
    .concat(event.args.id.toString());

  Trade.create({
    id,
    data: {
      base: pair!.base,
      quote: pair!.quote,
      price: event.args.price,
      amount: event.args.amount,
      taker: event.args.sender,
      maker: event.args.owner,
      timestamp: event.block.timestamp,
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

  const placed = await Order.findUnique({
    id,
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
};
