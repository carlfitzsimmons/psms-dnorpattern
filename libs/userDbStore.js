// Create an array of objects to represent our DB of users
// Later we can extract this to an actual RDBMS and we won't
// have to change much if we're returning the same stuff
const userDb = [
  { numericId: '12345', userId: 'marty' },
  { numericId: '23456', userId: 'carlfitzsimmons' }
]

// This function takes a numericId and returns a user object or false
function findUserByNumericId(numericId) {
  return userDb.find(user => {
    return user.numericId == numericId
  })
}

// Export the function so we can use it in app.js
module.exports.findUserByNumericId = findUserByNumericId
