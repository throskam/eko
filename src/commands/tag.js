const tag = require('../lib/tasks/tag')

module.exports = {
  command: 'tag [name]',
  describe: 'Manage tags',
  builder: (yargs) => {
    return yargs.positional('name', {
      describe: 'Target tag',
      type: 'string'
    }).option('regex', {
      alias: 'e',
      describe: 'Filter directories by regex',
      type: 'string'
    }).option('interactive', {
      alias: 'i',
      describe: 'Interactively choose directories',
      type: 'boolean'
    }).option('delete', {
      alias: 'd',
      describe: 'Remove tag',
      type: 'boolean'
    })
  },
  handler: (argv) => {
    return tag(argv.name, {
      regex: argv.regex ? new RegExp(argv.regex, 'iu') : null,
      interactive: argv.interactive,
      delete: argv.delete
    })
  }
}
