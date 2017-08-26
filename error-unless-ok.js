module.exports = response => operationName => {
  if (response.status !== 200) 
    throw new Error(`Operation "${operationName}" failed with status code ${response.status}`)
  return response
}