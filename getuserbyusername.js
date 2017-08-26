function getUserByUsername({ fetch, discourseAPIUrl }, username) {
  return fetch(discourseAPIUrl(`/users/${username}.json`), {
    method: 'GET',
  }).then(response => {
    return response.json()
  })
}

module.exports = getUserByUsername