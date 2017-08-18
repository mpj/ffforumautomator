function serve({ express, bodyParser }) {

  let app = express()
  
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  
  app.post('/webhook', (req, res) => {

    console.log("req.headers['x-discourse-event']", req.headers['x-discourse-event'])
    //console.log('req.body', req.body)
    res.status(200).send('ok')
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