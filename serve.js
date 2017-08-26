let R = require('ramda')

function serve({ 
  process, 
  express, 
  bodyParser, 
  wrap, 
  assignBadge, 
  isRequestValid,
  getAllUsernames,
  getUserByUsername,
  getUserFields
}) {

  let app = express()
  
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  
  app.post('/webhook', wrap(async function(req, res) {
    if (!isRequestValid)
      req.status(403).send('invalid signature')

    if(req.headers['x-discourse-event'] === 'user_created') {
      let { username, created_at } = req.body.user
      let date = new Date(Date.parse(created_at))
      let year = date.getFullYear()
      let month = date.getMonth()
      // only assign this badge for ppl in aug
      if (!(month === 7 && year === 2017)){
        res.status(200).send('carry on')
        return
      }
      let SPECIAL_FOREVER_BADGE_ID = 102
      try {
        await assignBadge({ username, badgeId: SPECIAL_FOREVER_BADGE_ID })
        console.log(`Assigned special forever badge to ${username}`)
        res.status(200).send('ok')
      } catch(error) {
        console.error(error)
        res.status(500)
      }
    } else {
      res.status(200).send('carry on')
    }
    
  }))

  app.get('/', (req,res) => {
    res.send('k')
  })

  const nowInMs = () => Number(new Date())
  
  const userNamesCacheMaxAge = 1000 * 60 * 10
  let userNamesCache = {
    data: null,
    expires: -1
  }
  const resultCacheMaxAge = 1000 * 10
  let resultCache = {
    data: null,
    expires: -1
  }
  app.get('/hackable-data', wrap(async function(req, res) {

    if (resultCache.expires > nowInMs()) {
      return res.json(resultCache.data)
    }
      
    let userFields = await getUserFields()

    let jsonField = userFields.find(x => x.name === 'Hackable JSON')
    let fieldId = jsonField.id
    
    let usernames 
    if (userNamesCache.expires < nowInMs()) {
      usernames = await getAllUsernames()
      userNamesCache = {
        data: usernames, 
        expires: nowInMs() + userNamesCacheMaxAge
      }
    } else {
      usernames = userNamesCache.data
    }

    let userDatas = []
    for (let username of usernames) {
      if (username !== 'mpj') continue
      let userData = await getUserByUsername(username)
      userDatas.push(userData)
    }

    let result = R.pipe(
      R.filter(x => x.user.user_fields && x.user.user_fields['' + fieldId]),
      R.uniqBy(R.prop('username')),
      R.map(userData => ({
        username: userData.user.username,
        hackable_json: userData.user.user_fields['' + fieldId]
      }))
    )(userDatas)

    resultCache = {
      data: result, 
      expires: nowInMs() + resultCacheMaxAge
    }
  
    return res.json(result)
  }))

  process.on('unhandledRejection', function(reason){
    console.error('Unhandled rejection', reason)
    process.exit(1)
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception', err)
    process.exit(1)
  });
  
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
  })
}

module.exports = serve