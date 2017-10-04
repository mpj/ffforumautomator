let errorUnlessOK = require('../error-unless-ok')

module.exports = bus =>
  bus.onCall('assign-badge', ({ username, badgeId, reason }) => ({
    $setState: { username, badgeId, reason },
    $call: ['discourse-api-url', { path: '/user_badges.json' }]
  }))
  .onCallback('discourse-api-url', (url, { username, badgeId, reason }) => ({
    $call: ['post-json', {
      url,
      body: {
        username,
        badge_id: badgeId,
        reason
      }
    }]
  }))
  .onCallback('post-json', errorUnlessOK('assignBadge'))