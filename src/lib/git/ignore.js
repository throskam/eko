const access = require('util').promisify(require('fs').access)
const appendFile = require('util').promisify(require('fs').appendFile)
const debug = require('debug')('git-ignore')
const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)

const exist = async file => access(file).then(() => true, () => false)

const path = '.gitignore'

const read = async () => {
  try {
    debug('read git ignore from ' + path)
    return await readFile(path)
  } catch (err) {
    throw new Error('Impossible to read .gitignore')
  }
}

const write = async (data) => {
  try {
    debug('write git ignore to ' + path)
    return await writeFile(path, data)
  } catch (err) {
    throw new Error('Impossible to write .gitignore')
  }
}

const append = async (line) => {
  try {
    return await appendFile(path, `${line}\n`)
  } catch (err) {
    throw new Error('Impossible to append into .gitignore')
  }
}

module.exports = {
  async add (directory) {
    await this.remove(directory)
    await append(`${directory}/`)
  },
  async remove (directory) {
    if (!await exist(path)) {
      return
    }

    const before = await read()

    const after = before
      .toString()
      .split('\n')
      .filter(line => line !== `${directory}/`)
      .join('\n')

    await write(after)
  }
}
