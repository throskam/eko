const debug = require('debug')('git-clone')
const exec = require('util').promisify(require('child_process').exec)

const concat = (...args) => args.join(' ')

module.exports = (repository, directory) => {
  const cmd = concat('git clone', repository, directory)

  debug('execute "' + cmd + '"')

  return exec(cmd)
}
