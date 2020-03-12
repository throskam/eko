const add = require('../lib/tasks/add')

module.exports = {
  command: 'add <repository> [directory]',
  describe: 'Add a repository to the project',
  builder: (yargs) => {
    return yargs.positional('repository', {
      describe: 'Source repository',
      type: 'string'
    }).positional('directory', {
      describe: 'Destination directory',
      type: 'string',
      normalize: true,
      coerce: val => val[val.length - 1] === '/' ? val.slice(0, -1) : val
    })
  },
  handler: (argv) => {
    return add(argv.repository, argv.directory)
  }
}
