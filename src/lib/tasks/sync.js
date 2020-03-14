const access = require('util').promisify(require('fs').access)

const cio = require('../cio')
const config = require('../config')
const gitClone = require('../git/clone')

const exist = async file => access(file).then(() => true, () => false)

module.exports = async () => {
  const projects = await config.projects.list()

  return projects.reduce((acc, project) => {
    return acc.then(async () => {
      if (await exist(project.directory)) {
        cio.log(cio.message`project ${project.directory} skipped`)
        return
      }

      try {
        await cio.wait(
          gitClone(project.repository, project.directory),
          cio.message`cloning ${project.repository} in ${project.directory}...`,
          cio.message`repository ${project.repository} cloned in ${project.directory}`,
          cio.message`impossible to clone ${project.repository} in ${project.directory}`
        )
      } catch (err) {
        // Ignore and continue
      }
    })
  }, Promise.resolve())
}
