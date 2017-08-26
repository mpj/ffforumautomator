async function getAllUsernames({ fetch, discourseAPIUrl }) {
  let allUsers = []
  let page = -1
  while(true) {
    page++
    let apiUrl = discourseAPIUrl(`/admin/users/list/active.json`, `page=${page}`)
    let users = await fetch(apiUrl)
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`list endpoint returned non-200 status: ${response.status}`)
        }
        return response.json()
      })
    if (users.length === 0) break
    allUsers = allUsers.concat(users)
  }
  return allUsers.map(x => x.username)
}

module.exports = getAllUsernames