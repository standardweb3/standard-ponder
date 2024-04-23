export const PairAddedHandleTokenPairOrderbook = async (
  event: any,
  Token: any,
  Pair: any,
) => {
  

  await Token.create({
    id: event.args.base,
    data: {
      price: 0,
      cgPrice: 0.0,
      cgId: "",
    },
  });
  await Token.create({
    id: event.args.quote,
    data: {
      price: 0,
      cgPrice: 0.0,
      cgId: "",
    },
  });

  const id = event.args.orderbook;

  await Pair.create({
    id,
    data: {
      base: event.args.base,
      quote: event.args.quote,
      orderbook: event.args.orderbook,
      bDecimal: event.args.bDecimal,
      qDecimal: event.args.qDecimal,
    },
  });
};
