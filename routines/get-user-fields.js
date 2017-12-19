let R = require('ramda')
let errorUnlessOK = require('../error-unless-ok')

module.exports = bus => {
  bus
    .onCall('get-user-fields', () => ({
      $call: [ 'discourse-api-url', { path: `/admin/customize/user_fields.json` } ]
    }))
    .onCallback('discourse-api-url', url => ({
      $call: [ 'fetch', { url } ]
    }))
    .onCallback('fetch', response => {
      console.log('got user fields back', response.status, response.url)
      errorUnlessOK('getUserFields')(response)
      return { $call: [ 'fetch-response-json', response.id ] }
    })
    .onCallback('fetch-response-json', R.prop('user_fields'))
}