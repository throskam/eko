const appendFile = require('util').promisify(require('fs').appendFile)
const readFile = require('util').promisify(require('fs').readFile)
const writeFile = require('util').promisify(require('fs').writeFile)
const access = require('util').promisify(require('fs').access)
const exist = async file => access(file).then(() => true, () => false)

const path = '.gitignore'

module.exports = {
  async add (directory) {
    await this.remove(directory)
    await appendFile(path, `${directory}/\n`)
  },
  async remove (directory) {
    if (!await exist(path)) {
      return
    }

    const before = await readFile(path)

    const after = before
      .toString()
      .split('\n')
      .filter(line => line !== `${directory}/`)
      .join('\n')

    await writeFile(path, after)
  }
}
