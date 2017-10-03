let queryString = require('query-string')

module.exports = bus => {
  bus.onCall('querystring/parse', str => queryString.parse(str))
  bus.onCall('querystring/stringify', str => queryString.stringify(str))
}