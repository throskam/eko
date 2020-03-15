const debug = require('debug')('git-clone')
const exec = require('util').promisify(require('child_process').exec)

const concat = (...args) => args.join(' ')

module.exports = (repository, directory) => {
  const command = concat('git clone', repository, directory)

  debug('execute "' + command + '"')

  return exec(command)
}
