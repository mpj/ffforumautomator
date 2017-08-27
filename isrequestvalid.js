function isRequestValid({ crypto, webhookSecret }, request) {
  console.log('rawBody is', rawBody)
  let hmac = crypto.createHmac('sha256', webhookSecret)
  let hash = `sha256=${hmac.update(request.rawBody).digest('hex')}`
  return hash === request.headers['x-discourse-event-signature']
}

module.exports = isRequestValid