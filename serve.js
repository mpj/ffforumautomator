function serve({ express, bodyParser, wrap, assignBadge, isRequestValid }) {

  let app = express()
  
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  
  app.post('/webhook', wrap(async (req, res) => {
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