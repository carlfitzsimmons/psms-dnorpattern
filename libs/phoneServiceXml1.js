const builder = require('xmlbuilder') // xmlbuilder takes a JS object and creates XML

// Build the XML for the initial menu
function initialMenu() {
  const menu = {
    CiscoIPPhoneInput: {
      Title: {
        '#text': 'PSMS Phone Alert'
      },
      Prompt: {
        '#text': 'Please enter'
      },
      URL: {
        '#text': `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/auth`,
        '@method': 'GET'
      },
      InputItem: [
        {
          DisplayName: {
            '#text': 'User ID'
          },
          QueryStringParam: {
            '#text': 'numericId'
          },
          DefaultValue: {
            '#text': ''
          },
          InputFlags: {
            '#text': 'N'
          }
        },
        {
          DisplayName: {
            '#text': 'Pin'
          },
          QueryStringParam: {
            '#text': 'pin'
          },
          DefaultValue: {
            '#text': ''
          },
          InputFlags: {
            '#text': 'NP'
          }
        }
      ]
    }
  }
  return builder.create(menu).end({ pretty: true })
}

// Build the XML to select the target area
// This builds the Phone Display
function selectAreaMessage() {
  const menu = {
    CiscoIPPhoneMenu: {
      Title: {
        '#text': 'Impact Area'
      },
      Prompt: {
        '#text': 'Please select the impacted area'
      },
      MenuItem: [
         {
          Name: {
            '#text': 'Request Security - This Room'
          },
          URL: {
            '#text': encodeURI(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/location?location=Reset_This_Room&device=#DEVICENAME#`
            )
          }
        },
        {
          Name: {
            '#text': 'Fight - This Room'
          },
          URL: {
            '#text': encodeURI(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/location?location=Fight_This_Room&device=#DEVICENAME#`
            )
          }
        },
        {
          Name: {
            '#text': 'Shooter'
          },
          URL: {
            '#text': encodeURI(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/location?location=Shooter&device=#DEVICENAME#`
            )
          }
        },
      {
            Name: {
            '#text': 'Cafeteria'
          },
          URL: {
            '#text': encodeURI(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/location?location=Cafeteria&device=#DEVICENAME#`
            )
          }
        },
        {
          Name: {
            '#text': 'Gym'
          },
          URL: {
            '#text': encodeURI(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/location?location=Gym&device=#DEVICENAME#`
            )
          }
        },
        {
          Name: {
            '#text': 'Football Field'
          },
          URL: {
            '#text': encodeURI(
              `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms/location?location=Footbal_Field&device=#DEVICENAME#`
            )
          }
        }
      ]
    }
  }
  return builder.create(menu).end({ pretty: true })
}

// Build the XML for a failed login message
function loginFailedMessage() {
  const menu = {
    CiscoIPPhoneText: {
      Title: {
        '#text': 'Login Failed'
      },
      Prompt: {
        '#text': 'Please try again'
      },
      Text: {
        '#text': 'Authentication Unsuccessful'
      }
    }
  }
  return builder.create(menu).end({ pretty: true })
}

// Build the XML for a failed login message
function deviceLookupFailedMessage(location) {
  const menu = {
    CiscoIPPhoneText: {
      Title: {
        '#text': `Alert Created for the ${location}`
      },
      Prompt: {
        '#text': 'We were not able to locate your extension'
      },
      Text: {
        '#text': 'You will NOT receive an automated call'
      }
    }
  }
  return builder.create(menu).end({ pretty: true })
}

// Export the functions so we can use them in app.js
module.exports.initialMenu = initialMenu
module.exports.selectAreaMessage = selectAreaMessage
module.exports.loginFailedMessage = loginFailedMessage
module.exports.deviceLookupFailedMessage = deviceLookupFailedMessage
console.log(`Leaving phoneServiceXML1`)
