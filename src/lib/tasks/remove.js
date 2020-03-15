const debug = require('debug')('remove')
const exec = require('util').promisify(require('child_process').exec)

const cio = require('../cio')
const config = require('../config')
const gitIgnore = require('../git/ignore')

const concat = (...args) => args.join(' ')

module.exports = async (directory) => {
  await cio.wait(
    Promise.all([config.projects.remove(directory), gitIgnore.remove(directory)]),
    cio.message`remove ${directory} project`,
    cio.message`project ${directory} removed`,
    cio.message`impossible to remove ${directory} project`
  )

  const confirm = await cio.confirm('Do you want to remove the directory ?', true)

  if (confirm) {
    const command = concat('rm -rf', directory)

    debug('execute "' + command + '"')

    return cio.wait(
      exec(command),
      cio.message`removing ${directory} directory`,
      cio.message`directory ${directory} removed`,
      cio.message`impossible to remove ${directory} directory`
    )
  }
}
