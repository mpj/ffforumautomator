function serve({ express, bodyParser, assignBadge }) {

  let app = express()
  
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  
  app.post('/webhook', (req, res) => {
    if(req.headers['x-discourse-event'] === 'user_created') {
      let { username } = req.body.user
      let SPECIAL_FOREVER_BADGE_ID = 102
      assignBadge({ username, badgeId: SPECIAL_FOREVER_BADGE_ID }).then(x => {
        console.log(`Assigned special forever badge to ${username}`)
        res.status(200).send('ok')
      }).catch(error => {
        console.error(error)
        res.status(500)
      })
    } else {
      res.status(200).send('carry on')
    }
    
    //console.log('req.body', req.body)
    
  })

  app.get('/', (req,res) => {
    res.send('k')
  })
  
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
  })
}

module.exports = serve