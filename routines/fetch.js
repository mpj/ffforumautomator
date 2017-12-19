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

    const throttledFetch = (url, opts) =>
      standardFetch(url, opts)
        .then(response => {
          if (response.rateLimited) {
            backoff = backoff * 2
            console.log('rate limited, backing off', backoff)
            return wait(backoff)
              .then(() => throttledFetch(url, opts))
          }
          return response
        })

    return throttledFetch(url, opts)
  })

  bus.impure.onCall('fetch-response-json', id => {
    let res = responses[id].json()
    delete responses[id]
    return res
  })

}

