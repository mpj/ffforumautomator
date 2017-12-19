function getUserByUsername({ fetch, bus }, username) {

  return bus.call('discourse-api-url', { path: `/users/${username}.json` })
    .then(url => bus.call('fetch', { url }))
    .then(({ status, id }) => {
      if (status !== 200) {
        throw new Error(`list endpoint returned non-200 status: ${status}`)
      }
      return bus.call('fetch-response-json', { id })
    })
}

module.exports = getUserByUsername