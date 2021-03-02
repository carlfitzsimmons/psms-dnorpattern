var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sundance1',
  database: 'psms'
})

connection.connect()

let entry = { foo: 'marty' }
connection.query('INSERT INTO isecure SET ?', entry, function(
  error,
  results,
  fields
) {
  if (error) throw error
  console.log(results)
})

connection.end()
