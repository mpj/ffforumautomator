function assignBadge({ fetch, baseUrl, apiKey }, { username, badgeId }) {
  return fetch(`${baseUrl}/user_badges.json?api_key=${apiKey}&api_username=system`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      badge_id: badgeId
    })
  }).then(response => {
    if (response.status !== 200) throw new Error('assign badge failed with status code' + response.status)
    return true
  })
}

module.exports = assignBadge
