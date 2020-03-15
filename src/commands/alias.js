const alias = require('../lib/tasks/alias')

module.exports = {
  command: 'alias [name]',
  describe: 'Manage aliases',
  builder: (yargs) => {
    return yargs.positional('name', {
      describe: 'Target alias',
      type: 'string'
    }).option('force', {
      alias: 'f',
      describe: 'Allow overwritting existing alias',
      type: 'boolean'
    }).option('delete', {
      alias: 'd',
      describe: 'Delete an alias',
      type: 'boolean'
    })
  },
  handler: (argv) => {
    const command = argv._.slice(1).join(' ')

    return alias(argv.name, command, {
      delete: argv.delete,
      force: argv.force
    })
  }
}
