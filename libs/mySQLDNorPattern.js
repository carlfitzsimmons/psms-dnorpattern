const builder = require('xmlbuilder') // xmlbuilder takes a JS object and creates XML

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: process.env.UCM_ADDRESS,
  user: process.env.UCM_USERNAME,
  password: process.env.UCM_PASSWORD,
  database: process.env.DB_TABLE
})

connection.connect()

let query =
`select dnorpattern from devicenumplanmap ` +
`inner join numplan on fknumplan=numplan.pkid ` +
`join device d on fkdevice = d.pkid ` +
`where d.name="${device}" `

con.query('SELECT * FROM authors', (err,rows) => {
    if(err) throw err;
  
    console.log('Data received from Db:');
    console.log(rows);
  });
  
connection.end()

// Export the function so we can use it in app.js
module.exports.mySQL_DNorPattern = mySQL_DNorPattern