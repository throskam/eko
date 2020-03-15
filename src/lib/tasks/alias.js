const cio = require('../cio')
const config = require('../config')

module.exports = async (name, command, option = {}) => {
  if (!name) {
    const aliases = await config.aliases.list()

    const padding = Math.max(...aliases.map(alias => alias.name.length))

    aliases.forEach((alias) => {
      cio.log(cio.message`● ${alias.name.padEnd(padding)} $ ${alias.command}`)
    })

    return
  }

  if (option.delete) {
    return cio.wait(
      config.aliases.remove(name),
      cio.message`removing ${name} alias`,
      cio.message`alias ${name} removed`,
      cio.message`impossible to remove ${name} project`
    )
  }

  if (!command) {
    cio.error('No command given')
    return
  }

  return cio.wait(
    config.aliases.add({ name, command }, option.force),
    cio.message`adding ${name} alias`,
    cio.message`alias ${name} added`,
    cio.message`impossible to add ${name} project`
  )
}
