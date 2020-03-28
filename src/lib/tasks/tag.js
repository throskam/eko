const cio = require('../cio')
const config = require('../config')

module.exports = async (name, option = {}) => {
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

  const targets = projects.filter(project => directories.includes(project.directory))

  if (!name) {
    const padding = Math.max(...targets.map(project => project.directory.length))

    targets.forEach((project) => {
      cio.log(cio.message`● ${project.directory.padEnd(padding)} # ${(project.tags || []).join(', ')}`)
    })

    return
  }

  if (option.delete) {
    return targets.reduce((promise, project) => {
      return promise.then(() => {
        return cio.wait(
          config.projects.add({
            ...project,
            tags: (project.tags || []).filter(tag => tag !== name)
          }, true),
          cio.message`removing ${name} tag from ${project.directory}`,
          cio.message`tag ${name} removed from ${project.directory}`,
          cio.message`impossible to remove ${name} tag from ${project.directory}`
        )
      })
    }, Promise.resolve())
  }

  return targets.reduce((promise, project) => {
    return promise.then(() => {
      return cio.wait(
        config.projects.add({
          ...project,
          tags: [...(project.tags || []).filter(tag => tag !== name), name].sort()
        }, true),
        cio.message`adding ${name} tag to ${project.directory}`,
        cio.message`tag ${name} added to ${project.directory}`,
        cio.message`impossible to add ${name} tag to ${project.directory}`
      )
    })
  }, Promise.resolve())
}
