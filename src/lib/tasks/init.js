const cio = require('../cio')
const config = require('../config')
const env = require('../env')

module.exports = async () => {
  process.chdir((await env()).workdir)

  return cio.wait(
    config.initialize(),
    cio.message`creating ${'.eko'} configuration file`,
    cio.message`configuration file ${'.eko'} created`,
    cio.message`impossible to create ${'eko'} configuration file`
  )
}
