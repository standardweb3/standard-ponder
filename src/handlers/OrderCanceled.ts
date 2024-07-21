import { formatUnits } from "viem";

export const OrderCanceledHandleOrder = async (
  event: any,
  Account: any,
  pair: any,
  Order: any,
  OrderHistory: any,
  io: any
) => {
  const id = event.args.owner
    .concat("-")
    .concat(event.args.orderbook)
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.id.toString());

  const canceled = await OrderHistory.findUnique({
    id,
  });

  const amountD = getVolume(
    event.args.isBid,
    event.args.amount,
    pair.bDecimal,
    pair.qDecimal
  );

  if (canceled!.amount - amountD <= 0) {
    await OrderHistory.delete({
      id,
    });

    // report to client
    await io.emit("deleteOrder", {
      id
    });
  } else {
    await OrderHistory.update({
      id,
      data: {
        amount: canceled!.amount - amountD,
      },
    });

    // report to client
    await io.emit("orderHistory", {
      ...canceled,
      amount: canceled!.amount - amountD,
    });
  }

  await Account.update({
    id: event.args.owner,
    data: ({ current }: any) => ({
      totalOrders: current.totalOrders - 1,
      totalOrderHistory: current.totalOrderHistory - 1,
    }),
  });

  await Order.delete({
    id,
  });

  // report to client
  await io.emit("deleteOrder", {
    id
  });
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
