#!/usr/bin/env node

const yargs = require('yargs')

yargs
  .commandDir('commands')
  .demandCommand()
  .help()
  .strict()
  .showHelpOnFail(true)
  .completion('completion', 'Generate completion script')
  .parse()
