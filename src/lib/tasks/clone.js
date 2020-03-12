const cio = require('../cio')
const debug = require('debug')('clone')
const gitClone = require('../git/clone')
const sync = require('./sync')

module.exports = async (repository, directory) => {
  await cio.wait(
    gitClone(repository, directory),
    cio.message`cloning ${repository} in ${directory}...`,
    cio.message`repository ${repository} cloned in ${directory}`,
    cio.message`impossible to clone ${repository} in ${directory}`
  )

  debug('changed directory to ' + directory)

  process.chdir(directory)

  return sync()
}
