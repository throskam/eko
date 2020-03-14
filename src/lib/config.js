const access = require('util').promisify(require('fs').access)
const debug = require('debug')('config')
const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)

const exist = async file => access(file).then(() => true, () => false)

const path = '.eko'

const read = async () => {
  const defaults = {
    projects: []
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

      return write(config)
    },
    async remove (key) {
      const config = await read()

      config[name] = config[name].filter(item => item[primary] !== key)

      return write(config)
    }
  }
}

module.exports = {
  projects: collection('projects', 'directory')
}
