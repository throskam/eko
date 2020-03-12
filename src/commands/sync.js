const sync = require('../lib/tasks/sync')

module.exports = {
  command: 'sync',
  describe: 'Synchronize the eko project',
  handler: (argv) => {
    return sync()
  }
}
