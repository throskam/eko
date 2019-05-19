const chalk = require('chalk')

module.exports = {
  info (...args) {
    return chalk.cyan(...args)
  },
  error (...args) {
    return chalk.red(...args)
  },
  fatal (...args) {
    return chalk.bold.red(...args)
  }
}
