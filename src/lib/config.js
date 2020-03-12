const access = require('util').promisify(require('fs').access)
const debug = require('debug')('config')
const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)

const exist = async file => access(file).then(() => true, () => false)

const path = '.eko'

const read = async () => {
  if (!(await exist(path))) {
    // Return empty config.
    return {
      projects: []
    }
  }

  try {
    debug('read configuration from ' + path)
    return JSON.parse(await readFile(path))
  } catch (err) {
    throw new Error('Impossible to read .eko file')
  }
}

const write = (data) => {
  try {
    debug('write configuration at ' + path)
    return writeFile(path, JSON.stringify(data, null, 2))
  } catch (err) {
    throw new Error('Impossible to write .eko file')
  }
}

module.exports = {
  async projects () {
    const config = await read()

    return config.projects
  },
  async add (directory, repository) {
    const config = await read()

    if (config.projects.find(project => project.directory === directory)) {
      throw new Error('A project with the given directory already exists')
    }

    config.projects.push({
      directory,
      repository
    })

    return write(config)
  },
  async remove (directory) {
    const config = await read()

    config.projects = config.projects.filter(project => directory !== project.directory)

    return write(config)
  }
}
