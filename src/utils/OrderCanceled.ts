export const OrderCanceledHandleOrder = async (
  event: any,
  Account: any, 
  Order: any,
  OrderHistory: any
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

  if (canceled!.amount - event.args.amount == 0n) {
    await OrderHistory.delete({
      id,
    });
  } else {
    await OrderHistory.update({
      id,
      data: {
        amount: canceled!.amount - event.args.amount,
      },
    });
  }

  await Account.update({
    id: event.args.owner,
    data: ({current}) => ({
      orders: current.orders - 1,
      orderHistory: current.orderHistory - 1
    }),
  })

  await Order.delete({
    id,
  });
};
