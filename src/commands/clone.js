const eko = require('../lib/eko')

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
  handler: argv => eko.clone(argv.repository, argv.directory)
}
