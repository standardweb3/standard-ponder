const accountOrders = `{
    orders(
      where: { maker: "0x34CCCa03631830cD8296c172bf3c31e126814ce9" }
      limit: 10  # Specify the number of items to fetch per page
      after: null  # Set to the cursor of the last item of the previous page
    ) {
      pageInfo {
        hasNextPage  # Indicates if there are more pages
        endCursor  # Cursor of the last item of the current page
      }
      items {
        id
        base
        quote
        price
        amount
        placed
        maker
        timestamp
        isBid
      }
    }
    orderHistorys(
      where: { maker: "0x34CCCa03631830cD8296c172bf3c31e126814ce9" }
      limit: 10  # Specify the number of items to fetch per page
      after: null  # Set to the cursor of the last item of the previous page
    ) {
      pageInfo {
        hasNextPage  # Indicates if there are more pages
        endCursor  # Cursor of the last item of the current page
      }
      items {
        id
        base
        quote
        price
        amount
        maker
        timestamp
        isBid
      }
    }
  }
  `

const recentTrades = ``