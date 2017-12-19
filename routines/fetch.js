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
            url,
            rateLimited: true,
          }
        }
        const id = uuid()
        responses[id] = response
        return {
          id,
          url,
          rateLimited: false,
          status: response.status
        }
      })

  bus.impure.onCall('fetch', ({ url, opts }) => {
    let initialBackoff = 1000
    let backoff = initialBackoff

    const throttledFetch = (url, opts) =>
      standardFetch(url, opts)
        .then(response => {
          if (response.rateLimited) {
            backoff = backoff * 2
            console.log('rate limited, backing off', backoff)
            return wait(backoff)
              .then(() => throttledFetch(url, opts))
          }
          console.log('Request url:', url)
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

