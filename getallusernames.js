const R = require('ramda')
const parseAsJSON = require('./parse-as-json')
const errorUnlessOK = require('./error-unless-ok')

module.exports = ({ fetch, bus }) => {
  const
    getPage = R.pipeP(
      page => bus.call('discourse-api-url', { path: '/admin/users/list/active.json', query: `page=${page}` }),
      fetch,
      errorUnlessOK('getPage'),
      parseAsJSON
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