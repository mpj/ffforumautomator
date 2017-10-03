let crypto = require('crypto')
let R = require('ramda')

let { createBus } = require('./snurra')
let express = require('express')
let cors = require('cors')
let bodyParser = require('body-parser')
let wrap = require('express-async-wrap')

let bus = createBus({ process })

require('./routines/config')(bus)
require('./routines/discourse-api-url')(bus)
require('./routines/get-user-fields')(bus)
require('./routines/querystring')(bus)
require('./routines/fetch')(bus)

let fetch = require('node-fetch')

let webhookSecret = process.env.DISCOURSE_WEBHOOK_SECRET

let postAsJSONTo = require('./post-as-json-to')({ fetch })

let isRequestValid = require('./isrequestvalid').bind(null, {
  crypto,
  webhookSecret
})

let getFrom = require('./get-from')({ fetch })

let assignBadge = require('./assignbadge')({
  bus,
  postAsJSONTo
})

let handlePostCreated = require('./handle-post-created')({
  assignBadge
})

let getAllUsernames = require('./getallusernames')({
  bus,
  fetch
})

let getUserByUsername = require('./getuserbyusername').bind(null, {
  bus,
  fetch
})

let serve = require('./serve').bind(null, {
  bus,
  process,
  express,
  cors,
  bodyParser,
  wrap,
  assignBadge,
  isRequestValid,
  getAllUsernames,
  getUserByUsername,
  handlePostCreated
})

serve()
