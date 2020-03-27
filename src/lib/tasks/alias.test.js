jest.mock('../cio')
jest.mock('../config')

const cio = require('../cio')
const config = require('../config')

// Keep real implementation of message.
cio.message = jest.requireActual('../cio').message

const alias = require('./alias')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should list aliases', async () => {
  expect.assertions(1)

  const messages = []

  const aliases = [{
    name: 'my-first-alias',
    command: 'my-first-command --with-params'
  }, {
    name: 'my-second-alias',
    command: 'my-second-command'
  }]

  config.aliases.list.mockResolvedValue(aliases)
  cio.log.mockImplementation(message => messages.push(message))

  await alias()

  expect(messages).toMatchSnapshot()
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
