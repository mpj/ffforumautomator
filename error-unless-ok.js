module.exports = operationName => response => {
  
  if (response.status !== 200) {
    console.log('response is', response)
    throw new Error(`Operation "${operationName}" failed with status code ${response.status}`)
  }
    
  return Promise.resolve(response)
}