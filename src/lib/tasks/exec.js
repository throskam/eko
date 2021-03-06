const debug = require('debug')('exec')
const pretty = require('pretty-time')
const { spawn } = require('child_process')

const cio = require('../cio')
const config = require('../config')
const env = require('../env')

module.exports = async (command, option = {}) => {
  const projects = await config.projects.list()

  let directories = projects
    .filter(project => !option.tags || (project.tags || []).some(tag => option.tags.includes(tag)))
    .map(project => project.directory)
    .filter(directory => !option.regex || option.regex.test(directory))

  if (option.interactive && directories.length) {
    directories = await cio.checkbox('Choose the directories you want to target', directories)
  }

  if (option.workdir) {
    directories = [(await env()).workdir]
  }

  if (!directories.length) {
    cio.log('nothing to be done')
    return
  }

  if (option.alias) {
    const aliases = await config.aliases.list()
    const alias = aliases.find(alias => alias.name === option.alias)

    if (!alias) {
      cio.error('Unkown alias ' + option.alias)
      return
    }

    debug('expand alias ' + alias.name + ' to "' + alias.command + '"')

    command = alias.command + (command ? ' ' + command : '')
  }

  if (!command) {
    cio.error('No command given')
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
