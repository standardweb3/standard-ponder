import { formatUnits } from "viem";
/*
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
  
    await contextObj.upsert({
      id,
      create: {
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
      update: ({ current }: any) => ({
        close: priceD,
        low: current.low > priceD ? priceD : current.low,
        high: current.high < priceD ? priceD : current.high,
        average: (current.average * current.count + priceD) / (current.count + 1),
        count: current.count + 1,
        baseVolume: current.baseVolume + baseVolume,
        quoteVolume: current.quoteVolume + quoteVolume,
      }),
    });
  };
  */