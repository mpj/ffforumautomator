let crypto = require('crypto')

let express = require('express')
let cors = require('cors')
let bodyParser = require('body-parser')
let wrap = require('express-async-wrap')
let queryString = require('query-string')

let fetch = require('node-fetch')
let baseUrl = 'https://www.funfunforum.com'
let apiKey = process.env.DISCOURSE_API_KEY
let webhookSecret = process.env.DISCOURSE_WEBHOOK_SECRET

let postAsJSONTo = require('./post-as-json-to')({ fetch })

let isRequestValid = require('./isrequestvalid').bind(null, {
  crypto,
  webhookSecret
})

let getFrom = require('./get-from')({ fetch })


let discourseAPIUrl = require('./discourse-api-url').bind(null, {
  baseUrl,
  apiKey,
  queryString
})

let assignBadge = require('./assignbadge')({
  postAsJSONTo,
  discourseAPIUrl
})

let handlePostCreated = require('./handle-post-created')({
  assignBadge
})

let getAllUsernames = require('./getallusernames')({
  fetch,
  discourseAPIUrl
})

let getUserByUsername = require('./getuserbyusername').bind(null, {
  fetch,
  discourseAPIUrl
})

let getUserFields = require('./get-user-fields')({
  getFrom,
  discourseAPIUrl
})

let serve = require('./serve').bind(null, {
  process,
  express,
  cors,
  bodyParser,
  wrap,
  assignBadge,
  isRequestValid,
  getAllUsernames,
  getUserByUsername,
  getUserFields,
  handlePostCreated
})

serve()
