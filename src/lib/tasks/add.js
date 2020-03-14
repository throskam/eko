const access = require('util').promisify(require('fs').access)
const path = require('path')

const cio = require('../cio')
const gitClone = require('../git/clone')
const config = require('../config')
const gitIgnore = require('../git/ignore')

const exist = async file => access(file).then(() => true, () => false)

module.exports = async (repository, directory) => {
  if (!directory) {
    directory = path.basename(repository).replace(/\.git$/, '')
  }

  await cio.wait(
    Promise.all([config.projects.add({ directory, repository }), gitIgnore.add(directory)]),
    cio.message`adding ${directory} project`,
    cio.message`project ${directory} added`,
    cio.message`impossible to add ${directory} project`
  )

  // Ignore if already cloned.
  if (await exist(path.join(directory, '.git'))) {
    return
  }

  return cio.wait(
    gitClone(repository, directory),
    cio.message`cloning ${repository} in ${directory}...`,
    cio.message`repository ${repository} cloned in ${directory}`,
    cio.message`impossible to clone ${repository} in ${directory}`
  )
}
