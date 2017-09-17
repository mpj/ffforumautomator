let errorUnlessOK = require('./error-unless-ok')

const makeAssignBadge =
  ({ postAsJSONTo, discourseAPIUrl }) =>
  ({ username, badgeId, reason }) =>
    Promise.resolve({
      username,
      badge_id: badgeId,
      reason
    })
    .then(postAsJSONTo(discourseAPIUrl('/user_badges.json')))
    .then(errorUnlessOK('assignBadge'))

module.exports = makeAssignBadge
