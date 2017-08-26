function getUserByUsername({ fetch, discourseAPIUrl }, username) {
  return fetch(discourseAPIUrl(`/users/${username}.json`), {
    method: 'GET',
  }).then(response => {
    if (response.status !== 200) {
      throw new Error(`list endpoint returned non-200 status: ${response.status}`)
    }
    return response.json()
  })
}

module.exports = getUserByUsername