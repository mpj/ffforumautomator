let errorUnlessOK = require('./error-unless-ok')

const makeAssignBadge =
  ({ postAsJSONTo, bus }) =>
  ({ username, badgeId, reason }) => {
    return bus.call('discourse-api-url', { path: '/user_badges.json' })
      .then(url => postAsJSONTo(url)({
        username,
        badge_id: badgeId,
        reason
      }))
      .then(errorUnlessOK('assignBadge'))
    }

module.exports = makeAssignBadge
