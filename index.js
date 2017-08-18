let crypto = require('crypto')

let express = require('express')
let bodyParser = require('body-parser')
let wrap = require('express-async-wrap')

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

let getAllUsernames = require('./getallusernames').bind(null, {
  fetch,
  baseUrl,
  apiKey
})

let serve = require('./serve').bind(null, {
  process,
  express,
  bodyParser,
  wrap,
  assignBadge,
  isRequestValid
})

serve()
