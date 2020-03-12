const exec = require('../lib/tasks/exec')

module.exports = {
  command: 'exec',
  describe: 'Execute a command in given directories',
  builder: (yargs) => {
    return yargs.option('regex', {
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
    })
  },
  handler: (argv) => {
    const command = argv._.slice(1).join(' ')

    return exec(command, {
      regex: argv.regex ? new RegExp(argv.regex, 'iu') : null,
      interactive: argv.interactive,
      number: argv.number
    })
  }
}
