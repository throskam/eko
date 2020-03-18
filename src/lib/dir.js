const access = require('util').promisify(require('fs').access)
const path = require('path')

const exist = async file => access(file).then(() => true, () => false)

const cwd = process.cwd()

const recur = async (directory, filename) => {
  const file = path.join(directory, filename)

  if (await exist(file)) {
    return file
  }

  const parent = path.dirname(directory)

  if (parent === '/') {
    return null
  }

  return recur(parent, filename)
}

const closest = async (from, filename) => {
  const file = await recur(from, filename)

  return file || path.join(from, filename)
}

const relative = async (from, to) => {
  return path.relative(from, to)
}

module.exports = {
  closest,
  relative,
  cwd
}
