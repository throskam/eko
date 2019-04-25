const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)
const access = require('util').promisify(require('fs').access)
const exist = async file => access(file).then(() => true, () => false)

const path = '.eko'
let cache

const read = async () => {
  if (cache) {
    return cache
  }

  cache = JSON.parse(await readFile(path))

  return cache
}

const write = (data) => {
  return writeFile(path, JSON.stringify(data, null, 2))
}

module.exports = {
  async initialize () {
    if (await exist(path)) {
      throw new Error('Already initialized')
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
      throw new Error('Already added')
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
