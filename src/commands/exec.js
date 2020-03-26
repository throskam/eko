const exec = require('../lib/tasks/exec')

module.exports = {
  command: 'exec [alias]',
  describe: 'Execute a command in given directories',
  builder: (yargs) => {
    return yargs.positional('alias', {
      describe: 'Target alias',
      type: 'string'
    }).option('regex', {
      alias: 'e',
      describe: 'Filter directories by regex',
      type: 'string'
    }).option('interactive', {
      alias: 'i',
      describe: 'Interactively choose directories',
      type: 'boolean'
    }).option('number', {
      alias: 'n',
      default: 0,
      describe: 'The number of concurrent processes',
      type: 'number'
    }).option('workdir', {
      alias: 'w',
      describe: 'Target workdir',
      type: 'boolean'
    })
  },
  handler: (argv) => {
    const command = argv._.slice(1).join(' ')

    return exec(command, {
      alias: argv.alias,
      regex: argv.regex ? new RegExp(argv.regex, 'iu') : null,
      interactive: argv.interactive,
      number: argv.number,
      workdir: argv.workdir
    })
  }
}
