module.exports = bus => {
  bus.onCall('base-url', () => 'https://www.funfunforum.com')
  bus.impure.onCall('api-key', () => process.env.DISCOURSE_API_KEY)
}
