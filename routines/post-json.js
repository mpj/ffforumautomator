let errorUnlessOK = require('../error-unless-ok')

module.exports = bus =>
  bus.onCall('post-json', ({ url, body }) => ({
    $call: ['fetch', {
      url,
      opts: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    }]
  }))
  .onCallback('fetch', ({ status, id }) =>
    status !== 200
      ? { status, body: null }
      : {
        $setState: { status: status },
        $call: ['fetch-response-json', id ]
      }
  )
  .onCallback('fetch-response-json', (body, {status}) => ({
    status,
    body
  }))

