const cio = require('../cio')
const config = require('../config')
const gitStatus = require('../git/status')

// Note: the equals case isn't possible with directory name.
const alpha = (key) => (a, b) => {
  return a[key] > b[key] ? 1 : -1
}

module.exports = async () => {
  const projects = await config.projects.list()

  if (!projects.length) {
    cio.log('nothing to be done')
    return
  }

  const statuses = await cio.wait(
    Promise.all(projects.map(project => gitStatus(project.directory))),
    cio.message`collecting data...`,
    cio.message`data collected`,
    cio.message`impossible to collect data`
  )

  const padding = statuses.reduce((max, { error, directory, branch, state, changes }) => {
    if (error) {
      return max
    }

    return {
      directory: Math.max(directory.length, max.directory),
      branch: Math.max(branch.length, max.branch),
      state: Math.max(state.length, max.state),
      changes: Math.max(changes.length, max.changes)
    }
  }, {
    directory: 0,
    branch: 0,
    state: 0,
    changes: 0
  })

  cio.eol()

  statuses.sort(alpha('directory')).forEach(({ error, directory, branch, state, changes }) => {
    const pieces = []

    pieces.push(cio.message`▶ ${directory.padEnd(padding.directory)}`)

    if (error) {
      pieces.push(cio.message` stopped ${error.message}`)
      cio.log(pieces.join(''))
      return
    }

    pieces.push(cio.message` on ${branch.padEnd(padding.branch)} ${state.padEnd(padding.state)}`)

    if (changes) {
      pieces.push(cio.message` with ${changes} ${'change' + (changes > 1 ? 's' : '')}`)
    }

    cio.log(pieces.join(''))
  })
}
