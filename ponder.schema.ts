import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Trade: p.createTable({
    /// identifier for a trade
    id: p.bigint(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// price in 8 decimals
    price: p.bigint(),
    /// traded base token amount
    amount: p.bigint(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// taker of the matched order in the orderbook
    taker: p.string(),
    /// maker of the matched order in the orderbook
    maker: p.string(),
    /// whether the order is open
    isOpen: p.boolean()
  }),
  Account: p.createTable({
    /// account wallet address
    id: p.string(),
    /// orders that are already matched or canceled
    orders: p.many("Order.maker"),
  }),
  Pair: p.createTable({
    /// orderbook contract address
    id: p.string(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// base token decimal
    bDecimal: p.bigint(),
    /// quote token decimal
    qDecimal: p.bigint()
  }),
  OrderHistory: p.createTable({
    id: p.string(),
    /// placed order id
    orderId: p.bigint(),
    /// order type (bid(buy) if true, ask(sell) if false)
    isBid: p.boolean(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// price in 8 decimals
    price: p.bigint(),
    /// deposit asset amount
    amount: p.bigint(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// wallet address who made an order
    maker: p.string().references("Account.id"),
  }),
  Order: p.createTable({
    /// a unique identifier
    id: p.string(),
    /// placed order id
    orderId: p.bigint(),
    /// order type (bid(buy) if true, ask(sell) if false)
    isBid: p.boolean(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// price in 8 decimals
    price: p.bigint(),
    /// deposit asset amount
    amount: p.bigint(),
    /// placed asset amount
    placed: p.bigint(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// wallet address who made an order
    maker: p.string().references("Account.id"),
  }),
}));

