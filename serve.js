function serve({ express, bodyParser }) {

  let app = express()
  
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  
  app.get('/webhook', (req, res) => {
    console.log('req.body', req.body)
  })
  
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
  })
}

module.exports = serve