let R = require('ramda')

const makeGetUserFields = ({ fetch, discourseAPIUrl }) => {
  const fetchFields = () => 
          fetch(discourseAPIUrl(`/admin/customize/user_fields.json`)),
        parseAsJSON = x => x.json(),
        extractFields = R.prop('user_fields')

  return R.pipeP(
    fetchFields,
    parseAsJSON,
    extractFields
  )
}

module.exports = makeGetUserFields