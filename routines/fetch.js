let fetch = require('node-fetch')
let uuid = require('uuid/v4')

module.exports = bus => {
  const responses = {}

  bus.impure.onCall('fetch', (url, opts) => fetch(url, opts).then(response => {
    const id = uuid()
    responses[id] = response
    return {
      id,
      status: response.status
    }
  }))

  bus.impure.onCall('fetch-response-json', id => {
    let res = responses[id].json()
    delete responses[id]
    return res
  })

}

