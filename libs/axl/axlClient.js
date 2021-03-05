require('dotenv').config() // dotenv manages environment vars
const soap = require('strong-soap').soap // The Soap node.js client
const _ = require('lodash') // lodash is a node.js utility lib
const path = require('path') // path helps us work with the filesystem

// Create the UCM client configs
const clientConfig = {
  auth:
    'Basic ' +
    Buffer.from(
      `${process.env.UCM_USERNAME}:${process.env.UCM_PASSWORD}`
    ).toString('base64'),
  url: path.join(__dirname, `schema/${process.env.UCM_VERSION}/AXLAPI.wsdl`)
}

/**
 * This is a 'LOCAL' (to our app) doAuthenticateUser function
 * It has no real tie to the UCM AXL method, I just kept
 * the name the same to make it easy
 */
function doAuthenticateUser(userid, pin) {
  // We're wrapping this in a Promise so we can return successfully (resolve())
  // or unsuccessfully (reject()) based on whether authentication to UCM succeeded
  // https://scotch.io/tutorials/javascript-promises-for-dummies
  return new Promise(function(resolve, reject) {
    // createClient creates our AXL SOAP interface
    soap.createClient(clientConfig.url, (err, client) => {
      // Setting security and SOAP headers
      client.setEndpoint(`https://${process.env.UCM_ADDRESS}:8443/axl/`)
      client.addHttpHeader('Authorization', clientConfig.auth)
      client.addHttpHeader('Content-Type', 'text/xml; charset=utf-8')
      client.addHttpHeader(
        'SOAPAction',
        `CUCM:DB ver=${process.env.UCM_VERSION} doAuthenticateUser`
      )

      // Tells our client to not worry about self-signed certs
      client.setSecurity(
        new soap.ClientSSLSecurity(undefined, undefined, undefined, {
          rejectUnauthorized: false
        })
      )

      // This is the acutal doAuthenticateUser AXL SOAP method
      client.doAuthenticateUser(
        // The required params for this method are userid and one of either pin or password
        {
          userid: userid,
          pin: pin
        },
        (err, result) => {
          // If there was an error calling the API, we handle it here
          if (err) {
            // Extracting some of the repsonse data for analysis
            let message
            let statusCode = _.get(err, 'response.statusCode', false)
            let faultString = _.get(
              err,
              'root.Envelope.Body.Fault.faultstring',
              false
            )

            // If there was no status code, we couldn't even connect
            if (!statusCode) {
              message = `Could not connect - Please check the IP address and try again.`
              // 401 == Unauthorized
            } else if (statusCode == '401') {
              message = `Unauthorized - Please check the AXL account information and try again.\n`
              // We don't want to check for every scenario so if there is a faultstring, we pass
              // it into the message variable here
            } else if (faultString) {
              message = faultString
              // Default handler - we don't know exactly what happened.
            } else {
              message = `An unknown error occurred - The remote system said: ${err.response.statusMessage}`
            }
            // We call the reject() method for this Promise (unsuccessful)
            console.log('AXL Error:', message, statusCode, faultString)
            return reject(message)
          }

          // If the API call didn't produce an error, but the doAuthenticateUser
          // 'userAuthenticated' response property is false, then we had bad credentials
          // and we return reject()
          if (result.return.userAuthenticated !== 'true') {
            return reject('Invalid credentials')
          }

          // Ah, everything worked like we wanted :-)
          // We resolve() this Promise (successful)
          resolve(true)
        }
      )
    })
  })
}
  
function fetchDN(device) {
  return new Promise(function(resolve, reject) {
    
    // createClient creates our AXL SOAP interface
    soap.createClient(clientConfig.url, (err, client) => {

      // Setting security and SOAP headers
      client.setEndpoint(`https://${process.env.UCM_ADDRESS}:8443/axl/`)
      client.addHttpHeader('Authorization', clientConfig.auth)
      client.addHttpHeader('Content-Type', 'text/xml; charset=utf-8')
      client.addHttpHeader(
        'SOAPAction',
        `CUCM:DB ver=${process.env.UCM_VERSION} executeSQLQuery`
      )

      // Tells our client to not worry about self-signed certs
      client.setSecurity(
        new soap.ClientSSLSecurity(undefined, undefined, undefined, {
          rejectUnauthorized: false
        })
      )

      let query =
      `SELECT FIRST 1 dnorpattern FROM devicenumplanmap ` +
      `INNER JOIN numplan on fknumplan=numplan.pkid ` +
      `JOIN device d on fkdevice = d.pkid ` +
      `WHERE d.name="${device}" `

      console.log(query)
      // The required param for this method is sql
      client.executeSQLQuery(
        {
          sql: query
        },
        (err, result) => {
          // If there was an error calling the API, we handle it here
          if (err) {
          // Extracting some of the repsonse data for analysis
          let message
          let statusCode = _.get(err, 'response.statusCode', false)
          let faultString = _.get(
            err,
            'root.Envelope.Body.Fault.faultstring',
            false
          )

          // If there was no status code, we couldn't even connect
          if (!statusCode) {
            message = `Could not connect - Please check the IP address and try again.`
            // 401 == Unauthorized
          } else if (statusCode == '401') {
            message = `Unauthorized - Please check the AXL account information and try again.\n`
            // We don't want to check for every scenario so if there is a faultstring, we pass
            // it into the message variable here
          } else if (faultString) {
            message = faultString
            // Default handler - we don't know exactly what happened.
          } else {
            message = `An unknown error occurred - The remote system said: ${err.response.statusMessage}`
          }
          // We call the reject() method for this Promise (unsuccessful)
          console.log('AXL Error:', message, statusCode, faultString)
          return reject(message)
          }
          var x = result.return.row.resolve
          console.log('x = ', x)
          console.log(`result.return = `, result.return)
          console.log(`returned devices = ${JSON.stringify(result.return.row)} `)
          console.log(`result[return][row][dnorpattern] = `, result[`return`][`row`][`dnorpattern`])
          console.log(`result.return.row.dnorpattern = `, result.return.row.dnorpattern)
    })
  })
})
}

function getDevicePrimaryLine(device) {
// We're wrapping this in a Promise so we can return successfully (resolve())
// or unsuccessfully (reject()) based on whether authentication to UCM succeeded
// https://scotch.io/tutorials/javascript-promises-for-dummies

// This link demos how to add a phone as well as update, delete, Get User
// https://collabapilab.ciscolive.com/lab/pod3/portal/cucm_axl
return new Promise(function(resolve, reject) {
  // createClient creates our AXL SOAP interface
  soap.createClient(clientConfig.url, (err, client) => {
    // Setting security and SOAP headers
    client.setEndpoint(`https://${process.env.UCM_ADDRESS}:8443/axl/`)
    client.addHttpHeader('Authorization', clientConfig.auth)
    client.addHttpHeader('Content-Type', 'text/xml; charset=utf-8')
    client.addHttpHeader(
      'SOAPAction',
      `CUCM:DB ver=${process.env.UCM_VERSION} executeSQLQuery`
    )

    // Tells our client to not worry about self-signed certs
    client.setSecurity(
      new soap.ClientSSLSecurity(undefined, undefined, undefined, {
        rejectUnauthorized: false
      })
    )
    // Setup the Query to grab Phone Info 
    // We need to get DN and return
    // This was original that did not work

    // let query =
    //`SELECT FIRST 1 n.dnorpattern FROM devicenumplanmap nm ` +
    //`JOIN device d ON d.pkid = nm.fkdevice ` +
    //`JOIN numplan n ON n.pkid = nm.fknumplan ` +
    //`JOIN typepatternusage pu ON pu.enum = n.tkpatternusage ` +
    //`WHERE d.name = "${device}" ` +
    //`AND pu.name = "Device" AND nm.numplanindex = 1`
    // In UCM CLI add run sql to the query and add a FULL MAC to ${device}
    // and the 1st DNORPATTERN is returned - so that works
    let query =
    `select dnorpattern from devicenumplanmap ` +
    `inner join numplan on fknumplan=numplan.pkid ` +
    `join device d on fkdevice = d.pkid ` +
    `where d.name="${device}" `

    console.log(query)

    // This is the executeSQLQuery AXL SOAP method
    client.executeSQLQuery(
      // The required param for this method is sql
      {
        sql: query
      },
      (err, result) => {
        // If there was an error calling the API, we handle it here
        if (err) {
          // Extracting some of the repsonse data for analysis
          let message
          let statusCode = _.get(err, 'response.statusCode', false)
          let faultString = _.get(
            err,
            'root.Envelope.Body.Fault.faultstring',
            false
          )

              // If there was no status code, we couldn't even connect
              if (!statusCode) {
                message = `Could not connect - Please check the IP address and try again.`
                // 401 == Unauthorized
              } else if (statusCode == '401') {
                message = `Unauthorized - Please check the AXL account information and try again.\n`
                // We don't want to check for every scenario so if there is a faultstring, we pass
                // it into the message variable here
              } else if (faultString) {
                message = faultString
                // Default handler - we don't know exactly what happened.
              } else {
                message = `An unknown error occurred - The remote system said: ${err.response.statusMessage}`
              }
              // We call the reject() method for this Promise (unsuccessful)
              console.log('AXL Error:', message, statusCode, faultString)
              return reject(message)
            }

            // If the API call didn't produce an error, but the doAuthenticateUser
            // 'userAuthenticated' response property is false, then we had bad credentials
            // and we return reject()
            if (!result.return.row) {
              return reject('Directory Number Not Found')
          }

          // Ah, everything worked like we wanted :-)
          // We resolve() this Promise (successful)
          //var x = result.return.row[0]
          //https://www.w3schools.com/nodejs/nodejs_mysql_select.asp
          var x = result.return.row.dnorpattern[0]
          //console.log(result.row.dnorpattern);
          console.log(`result = `, result)
          console.log(`result.return = `, result.return)
          console.log(`result.return.row = `, result.return.row)
          console.log(`${result.return.row.dnorpattern} = `, `${result.return.row.dnorpattern}`)
          console.log(`result.return.row.dnorpattern = `, result.return.row.dnorpattern)
          //console.log(`directoryNumber = `, directoryNumber)
          console.log('x = ', x)
          //console.log('RESULTS: ', result.return.row, ' | Device = ', device, ' | x = ', x, ' | fields = ', result.return.row.fields);  
          //console.log(`result = `, `${dnorpattern}`)
          //result.return.forEach((row) => {
          //console.log(`${row.dnorpattern}`)
          //})
         
          //querySelectorAll("dnorpattern")
          //document.querySelectorAll("input[device='dnorpattern']")     
          //resolve(result.return.row.dnorpattern)
          // This is the problem as dnorpattern is not a member
          resolve(result.return.row)
        }
      )
    })
  })
}

// Export the function so we can use it in app.js
module.exports.doAuthenticateUser = doAuthenticateUser
module.exports.getDevicePrimaryLine = getDevicePrimaryLine
module.exports.fetchDN = fetchDN