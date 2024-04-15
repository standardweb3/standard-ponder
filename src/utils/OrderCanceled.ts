export const OrderCanceledHandleOrder = async (
  event: any,
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
    OrderHistory.delete({
      id,
    });
  } else {
    OrderHistory.update({
      id,
      data: {
        amount: canceled!.amount - event.args.amount,
      },
    });
  }

  Order.delete({
    id,
  });
};
