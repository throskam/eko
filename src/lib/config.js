const access = require('util').promisify(require('fs').access)
const debug = require('debug')('config')
const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)

const exist = async file => access(file).then(() => true, () => false)

// Note: the equals case isn't possible with directory name.
const alpha = (key) => (a, b) => {
  return a[key] > b[key] ? 1 : -1
}

const path = '.eko'

const read = async () => {
  const defaults = {
    projects: [],
    aliases: []
  }

  if (!(await exist(path))) {
    return defaults
  }

  try {
    debug('read configuration from ' + path)
    return {
      ...defaults,
      ...JSON.parse(await readFile(path))
    }
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

const collection = (name, primary) => {
  return {
    async list () {
      const config = await read()

      return config[name]
    },
    async add (value, force = false) {
      const config = await read()

      if (!force && config[name].find(item => item[primary] === value[primary])) {
        throw new Error('The given ' + primary + ' already exists in ' + name)
      }

      config[name] = config[name].filter(item => item[primary] !== value[primary])
      config[name].push(value)
      config[name].sort(alpha(primary))

      return write(config)
    },
    async remove (key) {
      const config = await read()

      config[name] = config[name].filter(item => item[primary] !== key)
      config[name].sort(alpha(primary))

      return write(config)
    }
  }
}

const initialize = async () => {
  if (await exist(path)) {
    throw new Error('The current directory is already an eko project')
  }

  return write({})
}

module.exports = {
  initialize,
  projects: collection('projects', 'directory'),
  aliases: collection('aliases', 'name')
}
