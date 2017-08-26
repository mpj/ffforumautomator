const R = require('ramda')
const parseAsJSON = require('./parse-as-json')
const errorUnlessOK = require('./error-unless-ok')

module.exports = ({ fetch, discourseAPIUrl }) => {
  const 
    getPage = R.pipe(
      page => discourseAPIUrl(`/admin/users/list/active.json`, `page=${page}`),
      R.pipeP(
        fetch,
        errorUnlessOK('getPage'),
        parseAsJSON
      )
    ),
    collectNextPageUntilEnd = (collected = [], page = 0) => result => {
      return !result || result.length > 0
        ? getPage(page).then(collectNextPageUntilEnd(collected.concat(result), page + 1))
        : Promise.resolve(collected)
    },
    extractUsernames = R.map(user => user.username)
  
  return R.pipeP(
    () => getPage(0),
    collectNextPageUntilEnd(),
    extractUsernames
  )
}