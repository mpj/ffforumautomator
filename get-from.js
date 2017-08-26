const R = require('ramda')
module.exports = ({ fetch }) => uri => () => fetch(uri)