jest.mock('../cio')
jest.mock('../config')

const cio = require('../cio')
const config = require('../config')

const alias = require('./alias')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should list aliases', async () => {
  expect.assertions(1)

  const aliases = [{
    name: 'my-first-alias'
  }, {
    name: 'my-second-alias'
  }]

  config.aliases.list.mockResolvedValue(aliases)

  await alias()

  expect(cio.log).toHaveBeenCalledTimes(aliases.length)
})

it('should add an alias', async () => {
  expect.assertions(1)

  const name = 'my-alias'
  const command = 'my-command'
  const option = {
    force: true
  }

  await alias(name, command, option)

  expect(config.aliases.add).toHaveBeenCalledWith({ name, command }, option.force)
})

it('should remove an alias', async () => {
  expect.assertions(1)

  const name = 'my-alias'
  const option = {
    delete: true
  }

  await alias(name, '', option)

  expect(config.aliases.remove).toHaveBeenCalledWith(name)
})

it('should return when there is no command', async () => {
  expect.assertions(1)

  const name = 'my-alias'

  await alias(name)

  expect(config.aliases.add).not.toHaveBeenCalled()
})
