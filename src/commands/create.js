const eko = require('../lib/eko')

module.exports = {
  command: 'create [directory]',
  describe: 'Create a new eko project',
  builder: (yargs) => {
    return yargs.positional('directory', {
      describe: 'Destination directory',
      type: 'string',
      default: '.'
    })
  },
  handler: argv => eko.create(argv.directory)
}
