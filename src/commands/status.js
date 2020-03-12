const status = require('../lib/tasks/status')

module.exports = {
  command: 'status',
  describe: 'Show the project status',
  handler: (argv) => {
    return status()
  }
}
