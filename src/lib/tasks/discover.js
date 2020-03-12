const debug = require('debug')('discover')
const exec = require('util').promisify(require('child_process').exec)
const glob = require('util').promisify(require('glob'))
const path = require('path')

const add = require('./add')
const cio = require('../cio')
const config = require('../config')

module.exports = async (option = {}) => {
  const projects = await config.projects()

  debug('glob "**/.git**"')

  const gits = await cio.wait(
    glob('**/.git', { ignore: option.ignore, silent: true }),
    cio.message`collecting data...`,
    cio.message`data collected`,
    cio.message`impossible to collect data`
  )

  let directories = gits
    .map(git => path.dirname(git))
    .filter(directory => directory !== '.')
    .filter(directory => !projects.find(project => project.directory === directory))
    .filter(directory => !option.regex || option.regex.test(directory))

  if (!directories.length) {
    cio.log('nothing to be done')
    return
  }

  directories = await cio.checkbox('Choose the directories you want to add to your project', directories)

  return directories.reduce(async (acc, directory) => {
    return acc.then(async () => {
      const cmd = 'git config --get remote.origin.url'

      debug('execute "' + cmd + '" in ' + directory)

      const stream = await exec(cmd, { cwd: directory })
      const repository = stream.stdout.trim()

      return add(repository, directory)
    })
  }, Promise.resolve())
}
