function discourseAPIUrl({ fetch, queryString, apiKey, baseUrl }, path, query) {
  if (path.includes('?')) {
    throw new Error('path must no include query')
  }

  const queryObject = query ? queryString.parse(query) : {}
  queryObject.api_key = apiKey
  queryObject.api_username = 'system'

  return `${baseUrl}${path}?${queryString.stringify(queryObject)}`
}

module.exports = discourseAPIUrl