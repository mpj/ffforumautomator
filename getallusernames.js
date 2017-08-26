async function getAllUsernames({ fetch, discourseAPIUrl }) {
  let allUsers = []
  let page = -1
  while(true) {
    page++
    let apiUrl = discourseAPIUrl(`/admin/users/list/active.json`, `page=${page}`)
    console.log('apiUrl', apiUrl)
    let users = await fetch(apiUrl).then(x => x.json())
      
    console.log('fetches some users page', page)
    if (users.length === 0) break
    allUsers = allUsers.concat(users)
  }
  return allUsers.map(x => x.username)
}

module.exports = getAllUsernames