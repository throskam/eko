const debug = require('debug')('exec')
const pretty = require('pretty-time')
const { spawn } = require('child_process')

const cio = require('../cio')
const config = require('../config')

module.exports = async (command, option = {}) => {
  const projects = await config.projects.list()

  let directories = projects
    .map(project => project.directory)
    .filter(directory => !option.regex || option.regex.test(directory))

  if (option.interactive && directories.length) {
    directories = await cio.checkbox('Choose the directories you want to target', directories)
  }

  if (!directories.length) {
    cio.log('nothing to be done')
    return
  }

  const next = () => {
    const directory = directories.shift()

    if (!directory) {
      return
    }

    let error = null
    const buffers = []
    const hrstart = process.hrtime()

    debug('execute "' + command + '" in ' + directory)

    const proc = spawn(command, {
      cwd: directory,
      shell: true
    })

    proc.stderr.on('data', (data) => {
      buffers.push(data)
    })

    proc.stdout.on('data', (data) => {
      buffers.push(data)
    })

    proc.on('close', (code) => {
      const pieces = []
      const hrend = process.hrtime(hrstart)
      const time = pretty(hrend)

      pieces.push(cio.message`▶ run ${command} in ${directory} took ${time}`)

      if (error) {
        pieces.push(cio.message` stopped ${error.message}`)
        cio.log(pieces.join(''))
        cio.eol()

        next()

        return
      }

      cio.log(pieces.join(''))
      buffers.map(buffer => process.stdout.write(buffer))
      cio.eol()

      next()
    })

    proc.on('error', (err) => {
      error = err
    })
  }

  if (!option.number) {
    option.number = directories.length
  }

  option.number = Math.min(option.number, directories.length)

  for (let i = 0; i < option.number; i++) {
    next()
  }
}
