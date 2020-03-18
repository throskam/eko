const init = require('../lib/tasks/init')

module.exports = {
  command: 'init',
  describe: 'Initialize a new eko project',
  handler: (argv) => {
    return init()
  }
}
