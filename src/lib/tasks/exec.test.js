jest.mock('child_process')
jest.mock('pretty-time')
jest.mock('../cio')
jest.mock('../config')
jest.mock('../env')

const events = require('events')
const childProcess = require('child_process')
const pretty = require('pretty-time')
const cio = require('../cio')
const config = require('../config')
const env = require('../env')

const exec = require('./exec')

// Keep real implementation of message.
cio.message = jest.requireActual('../cio').message

beforeEach(() => {
  jest.resetAllMocks()
})

it('should execute the given command', async () => {
  expect.assertions(4)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const command = 'my-command'

  const messages = []

  const ee1 = new events.EventEmitter()
  ee1.stderr = new events.EventEmitter()
  ee1.stdout = new events.EventEmitter()

  const ee2 = new events.EventEmitter()
  ee2.stderr = new events.EventEmitter()
  ee2.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  childProcess.spawn.mockReturnValueOnce(ee1)
  childProcess.spawn.mockReturnValueOnce(ee2)
  cio.log.mockImplementation(message => messages.push(message))
  pretty.mockReturnValueOnce(1234)
  pretty.mockReturnValueOnce(4567)

  await exec(command)

  ee1.stdout.emit('data', 'Output')
  ee1.stderr.emit('data', 'Error')
  ee1.emit('close')

  ee2.emit('error', new Error('Some error message'))
  ee2.emit('close')

  expect(childProcess.spawn).toHaveBeenCalledTimes(2)
  expect(childProcess.spawn).toHaveBeenNthCalledWith(1, command, { cwd: directories[0], shell: true })
  expect(childProcess.spawn).toHaveBeenNthCalledWith(2, command, { cwd: directories[1], shell: true })
  expect(messages).toMatchSnapshot()
})

it('should return when there is no project', async () => {
  expect.assertions(1)

  const command = 'my-command'

  config.projects.list.mockResolvedValue([])

  await exec(command)

  expect(childProcess.spawn).not.toHaveBeenCalled()
})

it('should return when there is no command', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))

  await exec()

  expect(childProcess.spawn).not.toHaveBeenCalled()
})

it('should filter the project directories with the given regexp', async () => {
  expect.assertions(2)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const filteredDirectories = ['/path/to/my-second-directory']
  const command = 'my-command'
  const regex = new RegExp('second', 'iu')

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  childProcess.spawn.mockReturnValue(ee)

  await exec(command, { regex })

  expect(childProcess.spawn).toHaveBeenCalledTimes(1)
  expect(childProcess.spawn).toHaveBeenNthCalledWith(1, command, { cwd: filteredDirectories[0], shell: true })
})

it('should interactively ask for the project directories', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const command = 'my-command'

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))
  childProcess.spawn.mockReturnValue(ee)

  await exec(command, { interactive: true })

  expect(cio.checkbox).toHaveBeenCalledTimes(1)
})

it('should run in the working directory when asked', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const workdir = '/path/to/my-working-directory'
  const command = 'my-command'

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  env.mockResolvedValue({ workdir })
  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  childProcess.spawn.mockReturnValue(ee)

  await exec(command, { workdir: true })

  expect(childProcess.spawn).toHaveBeenCalledWith(command, expect.objectContaining({ cwd: workdir }))
})

it('should respect the maximum concurrency option', async () => {
  expect.assertions(2)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory', '/path/to/my-third-directory']
  const command = 'my-command'
  const number = 2

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  childProcess.spawn.mockReturnValue(ee)

  await exec(command, { number })

  expect(childProcess.spawn).toHaveBeenCalledTimes(2)

  ee.emit('close')

  expect(childProcess.spawn).toHaveBeenCalledTimes(3)
})

it('should expand alias', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const alias = {
    name: 'my-alias',
    command: 'my-command'
  }

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  config.aliases.list.mockResolvedValue([alias])
  childProcess.spawn.mockReturnValue(ee)

  await exec('', { alias: alias.name })

  expect(childProcess.spawn).toHaveBeenCalledWith(alias.command, expect.any(Object))
})

it('should append parameter to alias', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const alias = {
    name: 'my-alias',
    command: 'my-command'
  }
  const command = 'some additional parameters'

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  config.aliases.list.mockResolvedValue([alias])
  childProcess.spawn.mockReturnValue(ee)

  await exec(command, { alias: alias.name })

  expect(childProcess.spawn).toHaveBeenCalledWith(alias.command + ' ' + command, expect.any(Object))
})

it('should return when the alias is unknow', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  config.aliases.list.mockResolvedValue([])
  childProcess.spawn.mockReturnValue(ee)

  await exec('', { alias: 'unkown-alias' })

  expect(childProcess.spawn).not.toHaveBeenCalled()
})
