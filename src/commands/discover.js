const eko = require('../lib/eko')

module.exports = {
  command: 'discover',
  describe: 'Discover repositories',
  builder: (yargs) => {
    return yargs.option('regex', {
      alias: 'e',
      describe: 'Filter directories by regex',
      type: 'string'
    }).option('ignore', {
      alias: 'i',
      default: ['**/node_modules/**', '**/vendor/**'],
      describe: 'Ignore patterns',
      type: 'array'
    })
  },
  handler: argv => eko.discover({
    regex: argv.regex ? new RegExp(argv.regex, 'iu') : null,
    ignore: argv.ignore
  })
}
