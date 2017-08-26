let R = require('ramda')

const makeGetUserFields = ({ fetch, discourseAPIUrl }) => {
  const makeAPIUrl = () => discourseAPIUrl(`/admin/customize/user_fields.json`)
        parseAsJSON = response => response.json(),
        extractFields = R.prop('user_fields')

  return R.pipe(
    makeAPIUrl,
    R.pipeP(
      fetch,
      parseAsJSON,
      extractFields
    )
  )
}

module.exports = makeGetUserFields