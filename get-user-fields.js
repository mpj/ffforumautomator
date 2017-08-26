let R = require('ramda')

const makeGetUserFields = ({ fetch, discourseAPIUrl }) => {
  const getFrom = R.curry(fetch),
        parseAsJSON = response => response.json(),
        extractFields = R.prop('user_fields')

  return R.pipeP(
    getFrom(discourseAPIUrl(`/admin/customize/user_fields.json`)),
    parseAsJSON,
    extractFields
  )
}

module.exports = makeGetUserFields