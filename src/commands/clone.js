const clone = require('../lib/tasks/clone')

module.exports = {
  command: 'clone <repository> [directory]',
  describe: 'Clone an existing eko project',
  builder: (yargs) => {
    return yargs.positional('repository', {
      describe: 'Source repository',
      type: 'string'
    }).positional('directory', {
      describe: 'Destination directory',
      type: 'string',
      default: '.'
    })
  },
  handler: (argv) => {
    return clone(argv.repository, argv.directory)
  }
}
