let R = require('ramda')
let errorUnlessOK = require('./error-unless-ok')
let parseAsJSON = require('./parse-as-json')

const makeGetUserFields = ({ getFrom, discourseAPIUrl }) => {
  const promised = fn => R.pipe(fn, x => Promise.resolve(x))
  const extractFields = R.prop('user_fields')

  return R.pipeP(
    getFrom(discourseAPIUrl(`/admin/customize/user_fields.json`)),
    errorUnlessOK('getUserFields'),
    //x => console.log('x',x),
    parseAsJSON,
    promised(extractFields)
  )
}

module.exports = makeGetUserFields