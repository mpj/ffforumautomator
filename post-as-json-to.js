module.exports = ({ fetch }) => uri => body => fetch(uri, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})