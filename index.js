let crypto = require('crypto')

let express = require('express')
let bodyParser = require('body-parser')
let wrap = require('express-async-wrap')
let queryString = require('query-string')

let fetch = require('node-fetch')
let baseUrl = 'https://www.funfunforum.com'
let apiKey = process.env.DISCOURSE_API_KEY
let webhookSecret = process.env.DISCOURSE_WEBHOOK_SECRET

let isRequestValid = require('./isrequestvalid').bind(null, {
  crypto,
  webhookSecret
})

let assignBadge = require('./assignbadge').bind(null, {
  fetch,
  baseUrl,
  apiKey
})

let discourseAPIUrl = require('./discourse-api-url').bind(null, {
  baseUrl,
  apiKey,
  queryString
})

let getAllUsernames = require('./getallusernames').bind(null, {
  fetch,
  discourseAPIUrl
})

let getUserByUsername = require('./getuserbyusername').bind(null, {
  fetch,
  discourseAPIUrl
})

let getUserFields = require('./get-user-fields')({
  fetch,
  discourseAPIUrl
})

let serve = require('./serve').bind(null, {
  process,
  express,
  bodyParser,
  wrap,
  assignBadge,
  isRequestValid,
  getAllUsernames,
  getUserByUsername,
  getUserFields
})

serve()
