let R = require('ramda')

const makeAssignBadge = ({ fetch, discourseAPIUrl }) => {
  const 
    makeBody = ({ username, badgeId }) => ({
      username,
      badge_id: badgeId
    }),
    postAsJSONTo = uri => body => fetch(uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }),
    checkStatus = response => {
      if (response.status !== 200) 
        throw new Error('assign badge failed with status code' + response.status)
      return true
    }

  return R.pipeP(
    makeBody,
    postAsJSONTo(discourseAPIUrl('/user_badges.json')),
    checkStatus
  )
}

module.exports = makeAssignBadge
