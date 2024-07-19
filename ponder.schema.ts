import { createSchema } from "@ponder/core";
import { timeStamp } from "console";

export default createSchema((p) => ({
  Analysis: p.createTable({
    id: p.int(),
    totalGlobalTrades: p.int(),
    totalGlobalPairs: p.int(),
  }),
  PointAccount : p.createTable({
    /// wallet address 
    id: p.string(),
    /// Total minted points
    points: p.float(),
  }),
  PointDay: p.createTable({
    id: p.string(),
    totalGlobalGenerated: p.float()
  }),
  PairPoint: p.createTable({
    id: p.string(),
    multiplier: p.float(),
    pointsPairGenerated: p.float()
  }),
  MinBucket: p.createTable({
    /// {base address}-{quote address}-{min}
    id: p.string(),
    /// base address
    base: p.string(),
    /// quote address
    quote: p.string(),
    /// orderbook contract address
    orderbook: p.string().references("Pair.id"),
    /// open price in 1 min related to asset
    open: p.float(),
    /// high price in 1 min related to asset
    high: p.float(),
    /// low price in 1 min related to asset
    low: p.float(),
    /// close price in 1 min related to asset
    close: p.float(),
    /// average price in 1 min related to asset
    average: p.float(),
    /// volume in 1 min for base asset
    baseVolume: p.float(),
    /// volume in 1 min for quote asset
    quoteVolume: p.float(),
    /// trade count
    count: p.int(),
    /// aggregated timestamp in 1 min in seconds
    timestamp: p.int()
  }, {
    pairIndex: p.index(["base", "quote"]),
    timeStampIndex: p.index("timestamp").desc().nullsLast()
  }),
  HourBucket: p.createTable({
    /// {base address}-{quote address}-{hour}
    id: p.string(),
    /// base address
    base: p.string(),
    /// quote address
    quote: p.string(),
    /// orderbook contract address
    orderbook: p.string().references("Pair.id"),
    /// open price in 24 hours related to asset
    open: p.float(),
    /// high price in 24 hours related to asset
    high: p.float(),
    /// low price in 24 hours related to asset
    low: p.float(),
    /// close price in 24 hours related to asset
    close: p.float(),
    /// average price in 1 min related to asset
    average: p.float(),
    /// volume in 1 min for base asset
    baseVolume: p.float(),
    /// volume in 1 min for quote asset
    quoteVolume: p.float(),
    /// trade count
    count: p.int(),
    /// aggregated timestamp in 1 hour in seconds
    timestamp: p.int()
  }, {
    pairIndex: p.index(["base", "quote"]),
    timeStampIndex: p.index("timestamp").desc().nullsLast()
  }),
  DayBucket: p.createTable({
    /// {base address}-{quote address}-{hour}
    id: p.string(),
    /// base address
    base: p.string(),
    /// quote address
    quote: p.string(),
    /// orderbook contract address
    orderbook: p.string().references("Pair.id"),
    /// open price in 24 hours related to asset
    open: p.float(),
    /// high price in 24 hours related to asset
    high: p.float(),
    /// low price in 24 hours related to asset
    low: p.float(),
    /// close price in 24 hours related to asset
    close: p.float(),
    /// average price in 1 min related to asset
    average: p.float(),
    /// volume in 1 min for base asset
    baseVolume: p.float(),
    /// volume in 1 min for quote asset
    quoteVolume: p.float(),
    /// trade count
    count: p.int(),
    /// aggregated timestamp in 24 hours in seconds
    timestamp: p.int()
  }, {
    pairIndex: p.index(["base", "quote"]),
    timeStampIndex: p.index("timestamp").desc().nullsLast()
  }),
  Token: p.createTable({
    /// address of the token contract
    id: p.string(),
    /// price in DEX in USDT
    price: p.float(),
    /// Coingecko id
    cgId: p.string(),
    /// price in Coingecko
    cgPrice: p.float(),
    /// supported pairs as the base asset
    basePairs: p.many("Pair.base"),
    /// supported pairs as the quote asset
    quotePairs: p.many("Pair.quote"),
  }),
  Trade: p.createTable({
    /// identifier for a trade
    id: p.string(),
    /// order id which was matched
    orderId: p.bigint(),
    /// base info
    base: p.string(),
    /// quote info
    quote: p.string(),
    /// order type (bid(buy) if true, ask(sell) if false)
    isBid: p.boolean(),
    /// price in 8 decimals
    price: p.float(),
    /// traded base token amount on isBid == false, traded quote token amount on isBid == true
    baseAmount: p.float(),
    /// traded quote token amount on isBid == false, traded base token amount on isBid == true
    quoteAmount: p.float(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// taker of the matched order in the orderbook
    taker: p.string(),
    /// maker of the matched order in the orderbook
    maker: p.string().references("Account.id"),
    /// transaction hash
    txHash: p.string()
  }, {
    pairIndex: p.index(["base", "quote"]),
  }),
  Account: p.createTable({
    /// account wallet address
    id: p.string(),
    /// Last traded
    lastTraded: p.int(),
    /// orders that are placed by the account
    orders: p.many("Order.account"),
    /// orders that are already matched or canceled
    orderHistory: p.many("OrderHistory.account"),
    /// trades that are made by the account
    tradeHistory: p.many("TradeHistory.account"),
    /// total orders that a user has currently
    totalOrders: p.int(),
    /// total order history that a user has currently
    totalOrderHistory: p.int(),
    /// total trade number that a user has currently
    totalTradeHistory: p.int()
  }),
  Pair: p.createTable({
    /// orderbook contract address
    id: p.string(),
    /// base token address
    base: p.string().references("Token.id"),
    /// quote token address
    quote: p.string().references("Token.id"),
    /// orderbook contract address
    orderbook: p.string(),
    /// base token decimal
    bDecimal: p.int(),
    /// quote token decimal
    qDecimal: p.int(),
    /// orderbook ticks
    ticks: p.many("Tick.orderbook"),
    /// orders
    orders: p.many("Order.orderbook"),
    /// order history
    orderHistory: p.many("OrderHistory.orderbook"),
    /// trade history
    tradeHistory: p.many("TradeHistory.orderbook"),
    /// aggregated info per min
    minBuckets: p.many("MinBucket.orderbook"),
    /// aggregated info per hour
    hourBuckets: p.many("HourBucket.orderbook"),
    /// aggregated info per day
    DayBuckets: p.many("DayBucket.orderbook")
  }, {
    pairIndex: p.index(["base", "quote"]),
  }),
  Tick: p.createTable({
    /// {orderbook contract address}-{isBid}-{price}
    id: p.string(),
    /// orcerbook contract address
    orderbook: p.string().references("Pair.id"),
    /// buy or sell
    isBid: p.boolean(),
    /// price
    price: p.float(),
    /// total amount of order stored in the price
    amount: p.float(),
    /// total order count in the price
    count: p.float()
  }, {
    tickIndex: p.index(["isBid", "price"]),
  }),
  TradeHistory: p.createTable({
    // a unique identifier
    id: p.string(),
    /// placed order id
    orderId: p.bigint(),
    /// order type (bid(buy) if true, ask(sell) if false)
    isBid: p.boolean(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// orderbook contract address
    orderbook: p.string().references("Pair.id"),
    /// price in 8 decimals
    price: p.float(),
    /// deposit asset amount
    amount: p.float(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// wallet address who made an order
    maker: p.string().references("Account.id"),
    /// wallet address who took an order
    taker: p.string().references("Account.id"),
    /// wallet address who send the transaction in an order
    account: p.string().references("Account.id"),
    /// transaction hash 
    txHash: p.string()
  }, {
    pairIndex: p.index(["base", "quote"]),
  }),
  OrderHistory: p.createTable({
    // a unique identifier
    id: p.string(),
    /// placed order id
    orderId: p.bigint(),
    /// order type (bid(buy) if true, ask(sell) if false)
    isBid: p.boolean(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// orderbook contract address
    orderbook: p.string().references("Pair.id"),
    /// price in 8 decimals
    price: p.float(),
    /// deposit asset amount
    amount: p.float(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// wallet address who send the transaction in an order
    account: p.string().references("Account.id"),
    /// transaction hash 
    txHash: p.string()
  }, {
    accountIndex: p.index(["account"]),
  }),
  Order: p.createTable({
    /// a unique identifier
    id: p.string(),
    /// order type (bid(buy) if true, ask(sell) if false)
    isBid: p.boolean(),
    /// placed order id
    orderId: p.bigint(),
    /// base token address
    base: p.string(),
    /// quote token address
    quote: p.string(),
    /// orderbook contract address
    orderbook: p.string().references("Pair.id"),
    /// price in 8 decimals
    price: p.float(),
    /// deposit asset amount
    amount: p.float(),
    /// placed asset amount
    placed: p.float(),
    /// submitted timestamp
    timestamp: p.bigint(),
    /// wallet address who made an order
    account: p.string().references("Account.id"),
    /// transaction hash
    txHash: p.string()
  }, {
    makerIndex: p.index(["account"]),
  }),
}));
