#!/usr/bin/env node

const cio = require('./lib/cio')
const debug = require('debug')('eko')
const yargs = require('yargs')
const env = require('./lib/env')

env().then(({ root }) => {
  process.chdir(root)

  yargs
    .commandDir('commands')
    .demandCommand()
    .help()
    .strict()
    .showHelpOnFail(false)
    .fail((message, err, yargs) => {
      // yargs errors
      if (message) {
        cio.error(message)
        cio.eol()
        cio.log(yargs.help())
        process.exit(1)
      }

      cio.emergency(err.message.trim())
      debug(err)
      process.exit(1)
    })
    .completion('completion', 'Generate completion script')
    .parse()
})
