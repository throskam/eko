const boxen = require('boxen')
const chalk = require('chalk')
const inquirer = require('inquirer')
const ora = require('ora')

module.exports = {
  async wait (task, loading, success, error) {
    const spinner = ora(loading)

    try {
      spinner.start()

      const value = await task

      spinner.succeed(success)

      return value
    } catch (err) {
      spinner.fail(error)
      throw err
    }
  },
  async confirm (message, defaultValue) {
    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message,
      default: defaultValue
    })

    return answer.confirm
  },
  async checkbox (message, items) {
    const answer = await inquirer.prompt({
      type: 'checkbox',
      name: 'choices',
      message,
      choices: items
    })

    return answer.choices
  },
  message (strings, ...vars) {
    const coloredStrings = strings.map(s => chalk.cyan(s))
    const pieces = []

    for (let i = 0; i < coloredStrings.length; ++i) {
      pieces.push(coloredStrings[i])
      pieces.push(vars[i])
    }

    return pieces.join('')
  },
  log (message) {
    if (typeof message === 'undefined') {
      console.log()
      return
    }

    console.log(message)
  },
  info (message) {
    this.log(chalk.cyan(message))
  },
  notice () {
    throw new Error('Not implemented')
  },
  warning () {
    throw new Error('Not implemented')
  },
  error (message) {
    this.log(chalk.red(message))
  },
  alert () {
    throw new Error('Not implemented')
  },
  emergency (message) {
    this.log(boxen(chalk.red(message), { padding: 1, margin: 1 }))
  },
  eol () {
    this.log()
  }
}
