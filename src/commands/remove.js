const eko = require('../lib/eko')

module.exports = {
  command: 'remove <directory>',
  describe: 'Remove repository from the project',
  builder: (yargs) => {
    return yargs.positional('directory', {
      describe: 'Target directory',
      type: 'string',
      normalize: true,
      coerce: val => val[val.length - 1] === '/' ? val.slice(0, -1) : val
    })
  },
  handler: argv => eko.remove(argv.directory)
}
