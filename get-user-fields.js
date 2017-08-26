function getUserFields({ fetch, discourseAPIUrl }, username) {
  return fetch(discourseAPIUrl(`/admin/customize/user_fields.json`), {
    method: 'GET',
  })
  .then(x => x.json())
  .then(x => x.user_fields)
  
}

module.exports = getUserFields