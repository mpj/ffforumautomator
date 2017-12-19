let fetch = require('node-fetch')
let uuid = require('uuid/v4')

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = bus => {
  const responses = {}

  const standardFetch = (url, opts) =>
    fetch(url, opts)
      .then(response => {
        if (response.status === 429) {
          return {
            rateLimited: true,
          }
        }
        const id = uuid()
        responses[id] = response
        return {
          id,
          rateLimited: false,
          status: response.status
        }
      })

  bus.impure.onCall('fetch', ({ url, opts }) => {
    let backoff = 1000

    return standardFetch(url, opts)
      .then(response => {
        if (response.rateLimited) {
          backoff = backoff * 2
          return wait(backoff)
            .then(() => standardFetch(url, opts))
        }
        return response
      })
  })

  bus.impure.onCall('fetch-response-json', id => {
    let res = responses[id].json()
    delete responses[id]
    return res
  })

}

