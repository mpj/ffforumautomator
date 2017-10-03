function getUserByUsername({ fetch, bus }, username) {

  return bus.call('discourse-api-url', { path: `/users/${username}.json` })
    .then(fetch)
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`list endpoint returned non-200 status: ${response.status}`)
      }
      return response.json()
    })
}

module.exports = getUserByUsername