#!/usr/bin/env node

const yargs = require('yargs')
const format = require('./lib/format')
const boxen = require('boxen')

yargs
  .commandDir('commands')
  .demandCommand()
  .help()
  .strict()
  .showHelpOnFail(false)
  .fail((message, err, yargs) => {
    // yargs errors
    if (message) {
      console.log(format.fatal(message))
      console.log()
      console.log(yargs.help())
      process.exit(1)
    }

    console.log(boxen(format.fatal(err.message.trim()), { padding: 1, margin: 1 }))
    console.log(err)
    process.exit(1)
  })
  .completion('completion', 'Generate completion script')
  .parse()
