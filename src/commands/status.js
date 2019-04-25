const eko = require('../lib/eko')

module.exports = {
  command: 'status',
  describe: 'Show the project status',
  handler: argv => eko.status()
}
