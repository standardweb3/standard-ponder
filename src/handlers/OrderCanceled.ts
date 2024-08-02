import { formatUnits } from "viem";

export const OrderCanceledHandleOrder = async (
  event: any,
  Account: any,
  pair: any,
  Tick: any,
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
    await io.emit("deleteOrderHistory", {
      id,
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

  // remove tick amount from the canceled order
  const tickId = event.args.orderbook
    .concat("-")
    .concat(event.args.isBid.toString())
    .concat("-")
    .concat(event.args.price.toString());
  const tickInfo = await Order.findUnique({
    id: tickId,
  });
  if (tickInfo) {
    if (tickInfo.amount - amountD <= 0) {
      await Tick.delete({
        id: tickId,
      });
    } else {
      await Tick.update({
        id: tickId,
        data: {
          amount: tickInfo.amount - amountD,
        },
      });
    }
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
    id,
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
