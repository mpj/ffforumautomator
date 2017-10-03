module.exports = bus => {

  bus.onCall('discourse-api-url', ({ path, query }) => ({
    $setState: { path },
    $call: [ 'querystring/parse', query ]
  }))

  .onCallback('querystring/parse', parsedQuery => ({
    $setState: { parsedQuery },
    $call: 'base-url'
  }))

  .onCallback('base-url', baseUrl => ({
    $setState: { baseUrl },
    $call: 'api-key'
  }))

  .onCallback('api-key', (apiKey, state) => ({
    $setState: { apiKey },
    $call: [ 'querystring/stringify', {
      ...(state.parsedQuery || {}),
      api_key: apiKey,
      api_username: 'system'
    }]
  }))

  .onCallback('querystring/stringify', (stringifiedQuery, state) =>
    `${state.baseUrl}${state.path}?${stringifiedQuery}`)
}
