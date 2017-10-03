let R = require('ramda')
let errorUnlessOK = require('./error-unless-ok')
let parseAsJSON = require('./parse-as-json')

const makeGetUserFields = ({ bus, discourseAPIUrl }) => {
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

module.exports = makeGetUserFields