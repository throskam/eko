const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)
const access = require('util').promisify(require('fs').access)
const exist = async file => access(file).then(() => true, () => false)

const path = '.eko'

const read = async () => {
  if (!(await exist(path))) {
    throw new Error('This directory is not an eko project, use "create" first')
  }

  try {
    return JSON.parse(await readFile(path))
  } catch (err) {
    throw new Error('Impossible to read .eko file')
  }
}

const write = (data) => {
  try {
    return writeFile(path, JSON.stringify(data, null, 2))
  } catch (err) {
    throw new Error('Impossible to write .eko file')
  }
}

module.exports = {
  async initialize () {
    if (await exist(path)) {
      throw new Error('The current directory is already an eko project')
    }

    return write({ projects: [] })
  },
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

    await write(config)
  },
  async remove (directory) {
    const config = await read()

    config.projects = config.projects.filter(project => directory !== project.directory)

    await write(config)
  }
}
