function getAllUsernames({ fetch, apiKey, baseUrl }) {
  return fetch(`${baseUrl}/admin/users/list/active.json?api_key=${apiKey}&api_username=system`, {
    method: 'GET',
  }).then(response => {
    return response.json()
  }).then(users => users.map(x => x.username))
}

module.exports = getAllUsernames