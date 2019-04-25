const eko = require('../lib/eko')

module.exports = {
  command: 'sync',
  describe: 'Synchronize the eko project',
  handler: argv => eko.sync()
}
