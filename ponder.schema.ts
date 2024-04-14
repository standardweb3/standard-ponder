import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  MinBucket: p.createTable({
    /// {base address}-{quote address}-{min}
    id: p.string(),
    /// open price in 1 min related to asset
    open: p.bigint(),
    /// high price in 1 min related to asset
    high: p.bigint(),
    /// low price in 1 min related to asset
    low: p.bigint(),
    /// close price in 1 min related to asset
    close: p.bigint(),
    /// average price in 1 min related to asset
    average: p.bigint(),
    /// trade count
    count: p.bigint(),
    /// volume in 1 min in base amount
    volume: p.float(),
    /// aggregated timestamp in 1 min in seconds
    timestamp: p.int()
  }),
  HourBucket: p.createTable({
    /// {base address}-{quote address}-{hour}
    id: p.string(),
    /// open price in 24 hours related to asset
    open: p.bigint(),
    /// high price in 24 hours related to asset
    high: p.bigint(),
    /// low price in 24 hours related to asset
    low: p.bigint(),
    /// close price in 24 hours related to asset
    close: p.bigint(),
    /// average price in 1 min related to asset
    average: p.bigint(),
    /// trade count
    count: p.bigint(),
    /// volume in 24 hours related to asset
    volume: p.float(),
    /// aggregated timestamp in 1 hour in seconds
    timestamp: p.int()
  }),
  DayBucket: p.createTable({
    /// {base address}-{quote address}-{hour}
    id: p.string(),
    /// open price in 24 hours related to asset
    open: p.bigint(),
    /// high price in 24 hours related to asset
    high: p.bigint(),
    /// low price in 24 hours related to asset
    low: p.bigint(),
    /// close price in 24 hours related to asset
    close: p.bigint(),
    /// average price in 1 min related to asset
    average: p.bigint(),
    /// trade count
    count: p.bigint(),
    /// volume in 24 hours related to asset
    volume: p.float(),
    /// aggregated timestamp in 24 hours in seconds
    timestamp: p.int()
  }),
  Token: p.createTable({
    /// address of the token contract
    id: p.string(),
    /// price in DEX
    price: p.bigint(),
    /// Coingecko id
    cgId: p.string(),
    /// price in Coingecko
    cgPrice: p.float(),
  }),
  Trade: p.createTable({
    /// identifier for a trade
    id: p.string(),
    /// base info
    base: p.string(),
    /// quote info
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
    maker: p.string()
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
    bDecimal: p.int(),
    /// quote token decimal
    qDecimal: p.int(),
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

