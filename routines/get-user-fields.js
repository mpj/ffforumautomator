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
      errorUnlessOK('getUserFields')(response)
      return { $call: [ 'fetch-response-json', response.id ] }
    })
    .onCallback('fetch-response-json', R.prop('user_fields'))
}


/*
let parseAsJSON = require('./parse-as-json')
const makeGetUserFields = ({ bus, fetch }) => {
  const promised = fn => R.pipe(fn, x => Promise.resolve(x))
  const extractFields = R.prop('user_fields')

  return R.pipeP(
    () => bus.call('discourse-api-url', { path: `/admin/customize/user_fields.json` }),
    fetch,
    errorUnlessOK('getUserFields'),
    parseAsJSON,
    promised(extractFields)
  )
}

module.exports = makeGetUserFields*/