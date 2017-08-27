let R = require('ramda')
let errorUnlessOK = require('./error-unless-ok')

const makeAssignBadge = ({ postAsJSONTo, discourseAPIUrl }) => {
  const 
    makeBody = ({ username, badgeId }) => Promise.resolve({
      username,
      badge_id: badgeId
    })

  return R.pipeP(
    makeBody,
    postAsJSONTo(discourseAPIUrl('/user_badges.json')),
    errorUnlessOK('assignBadge')
  )
}

module.exports = makeAssignBadge
