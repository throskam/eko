const path = require('path')

const dir = require('./dir')

let cache = null

module.exports = async () => {
  if (cache) {
    return cache
  }

  const cwd = dir.cwd
  const root = path.dirname(await dir.closest(cwd, '.eko'))

  cache = {
    root,
    workdir: cwd,
    relative (directory) {
      return dir.relative(root, directory)
    }
  }

  return cache
}
