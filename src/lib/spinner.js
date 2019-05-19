const ora = require('ora')

module.exports = async (task, loading, success, error) => {
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
}
