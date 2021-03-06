require('dotenv').config() // dotenv manages environment vars
const express = require('express') // Express is the webserver
const app = express() // Create the Express webserver
const axlClient = require('./libs/axl/axlClient') // Bring in the UCM AXL client module
const phoneServiceXml = require('./libs/phoneServiceXml1') // Bring in the phone service XML module(s)
//const phoneServiceXml = require('./libs/phoneServiceiSecureXML') // Bring in the phone service XML module(s)
//const mySQL_DNorPattern = require('./libs/mySQL_DNorPattern') // Test Mysql query return
const userDbStore = require('./libs/userDbStore') // Bring in the UserDb store to find users by numeric ID
const mysql = require('mysql')

// Connect to the MySQL database
const db = mysql.createConnection({
  host: process.env.DB_ADDRESS,
  user: process.env.DB_UN,
  password: process.env.DB_UP,
  database: process.env.DB_SCHEMA,
})
db.connect()

const esl = require('modesl')
const moment = require('moment')
const { result } = require('lodash')

// Set the required Express server setttings
const requiredEnvVars = [
  'PORT',
  'IP_ADDRESS',
  'UCM_ADDRESS',
  'UCM_USERNAME',
  'UCM_PASSWORD',
  'UCM_VERSION',
  'FS_ADDRESS',
]

// Make sure all the .env vars are set
requiredEnvVars.forEach((el) => {
  if (!process.env[el]) {
    console.log(`Sorry, you need to set ${el} in the .env file :-)`)
    process.exit()
  }
})

// Express web route to /api/psms (GET)
// This gets called when the phone first loads the service
app.get('/api/psms-snorpattern', (req, res) => {
  // Return the initial login menu
  res.set('Content-Type', 'text/xml')
  res.send(phoneServiceXml.initialMenu())
})

// Express web route to /api/psms/alert (GET)
// This gets called when the phone submits the form
app.get('/api/psms/auth', (req, res) => {
  console.log(`Check for numericId `)

  // Extract the numericId and pin from the request
  let { numericId, pin } = req.query

  console.log(`numericId `, numericId)
  console.log(`pin `, pin)

  // Look for a user in the userDbStore based on numericId
  let user = userDbStore.findUserByNumericId(numericId)

  // If we can't locate the user by numericId
  if (!user) {
    res.set('Content-Type', 'text/xml')
    return res.send(phoneServiceXml.loginFailedMessage())
  }

  console.log(`Check axlClient UCM username`, user.userId)

  // Attempt to authenticate the user to UCM
  axlClient
    .doAuthenticateUser(user.userId, pin)
    .then((response) => {
      res.set('Content-Type', 'text/xml')
      res.send(phoneServiceXml.selectAreaMessage())
    })
    // .catch() is executed if authentication was not successful
    .catch((err) => {
      res.set('Content-Type', 'text/xml')
      res.send(phoneServiceXml.loginFailedMessage())
    })
})

// Express web route to /api/psms/location (GET)
app.get('/api/psms/location', (req, res) => {
  let { location, device } = req.query
  console.log(`Express web route`)
   
  axlClient
    .fetchDN(device) 
    //.getDevicePrimaryLine(device)
    .then((dnorpattern) => {
      console.log(`device = `, dnorpattern)
      console.log(`.fetchDN(device) device.dnorpattern = `, dnorpattern)
      // Send SQL to Queue Manager 
      //insertIntoDb(directoryNumber, device)
      //mysql(device)

      // Place a call
      //placeCallToEndpoint(directoryNumber)

      return res.send(
        `Alert Created for the ${location}!  You will now receive an automated phone call.  Please stand by.`
      )
    })
    .catch((err) => {
      console.log(err)
      res.set('Content-Type', 'text/xml')
      res.send(phoneServiceXml.deviceLookupFailedMessage(location))
    })
})

// Launch the Express Webserver
app.listen(process.env.PORT, process.env.IP_ADDRESS, () => {
  console.log(`Launch Express web route`)
  console.log(
    `Running web server on http://${process.env.IP_ADDRESS}:${process.env.PORT}`
  )
})

/**
 * Helper Functions
 */

// Insert new entry into iSecure Database
//function insertIntoDb(dnorpattern, device) {
  function insertIntoDb(directoryNumber, device) {
    //console.log(`Insert new entry in iSecure Database DN = `, directoryNumber, ` | Device = `, device)
  console.log(`Insert new entry in iSecure Database DN = `, directoryNumber, ` | Device = `, device)
  let entry = {
    Room_PLAR: '704LIGHT',
    Processed: 99,
    Phone: directoryNumber,
    Note: device,
  }
  db.query(
    `INSERT INTO ${process.env.DB_TABLE} SET ?`,
    entry,
    function (error, results, fields) {
      if (error) throw error
      console.log(results)
    }
  )
  db.end()
}

// We received a directory number (primary line) for the device
// Create a connection to FreeSWITCH and place a recorded call
function placeCallToEndpoint(directoryNumber) {
  console.log(`We received a directory number`)
  conn = new esl.Connection(
    process.env.FS_ADDRESS,
    8021,
    'ClueCon',
    function () {
      // Create a new call UUID
      let command = 'create_uuid'
      conn.api(command, function (res) {
        const uuid = res.getBody()
        const now = moment().format('YYYY-MM-DD-HH-mm-ss')
        const destination = directoryNumber
        const caller = '202805054'
        const fileName = `${now}_${destination}_${caller}`

        // This places a call to UCM and records
        let callString =
          `originate {` +
          `origination_uuid=${uuid},` +
          `origination_caller_id_number=${caller},` +
          `api_on_answer='uuid_record ${uuid} start ` +
          `/var/lib/freeswitch/recordings/${fileName}.wav'` +
          `}` +
          `sofia/gateway/karmatek-hq-sme-pub/${destination} &park()`
        conn.api(callString, function (res) {
          console.log('Call Sent', res.serialize())
          // conn.disconnect()
        })
      })
    }
  )
}
