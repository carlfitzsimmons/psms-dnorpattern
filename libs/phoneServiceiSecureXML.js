const builder = require('xmlbuilder') // xmlbuilder takes a JS object and creates XML

console.log(`in phoneServiceiSecureXML`)

// Build the XML for the initial menu
function iSecureMenu() {
  const menu = {
    CiscoIPPhoneInput: {
      Title: {
        '#text': 'iSecure Selection'
      },
      Prompt: {
        '#text': 'Please select'
      },
      URL: {
        '#text': `http://${process.env.IP_ADDRESS}:${process.env.PORT}/api/psms-dnsorpattern/alert?device=#DEVICENAME#`,
        '@method': 'GET'
      },
      InputItem: [
        {
          DisplayName: {
            '#text': 'Security'
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
            '#text': 'SHOOTER'
          },
          QueryStringParam: {
            '#text': 'pin'
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
            '#text': 'FIGHT'
          },
          QueryStringParam: {
            '#text': 'pin'
          },
          DefaultValue: {
            '#text': ''
          },
          InputFlags: {
            '#text': 'N'
          }
        }
      ]
    }
  }
  console.log(`in phoneServiceiSecureXML-1`)
  return builder.create(menu).end({ pretty: true })
}

console.log(`in phoneServiceiSecureXML-2`)
// Build the XML for a failed iSecure selection
function iSecureMenuFailedMessage() {
  const menu = {
    CiscoIPPhoneText: {
      Title: {
        '#text': 'Selection Failed'
      },
      Prompt: {
        '#text': 'Please try again'
      },
      Text: {
        '#text': 'Selection Unsuccessful'
      }
    }
  }
  return builder.create(menu).end({ pretty: true })
}
console.log(`in phoneServiceiSecureXML-3`)

// Build the XML for a failed iSecure selection
function iSecureMenuFailedMessage() {
  const menu = {
    CiscoIPPhoneText: {
      Title: {
        '#text': 'Alert Sent'
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
console.log(`in phoneServiceiSecureXML-4`)

// Export the functions so we can use them in app.js
module.exports.iSecureMenu = iSecureMenu
module.exports.iSecureMenuFailedMessage = iSecureMenuFailedMessage
