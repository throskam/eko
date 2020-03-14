jest.mock('child_process')
jest.mock('pretty-time')
jest.mock('../cio')
jest.mock('../config')

const events = require('events')
const childProcess = require('child_process')
const pretty = require('pretty-time')
const cio = require('../cio')
const config = require('../config')

const exec = require('./exec')

// Keep real implementation of message.
cio.message = jest.requireActual('../cio').message

beforeEach(() => {
  jest.resetAllMocks()
})

it('should execute the given command', async () => {
  expect.assertions(4)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const cmd = 'my-cmd'

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

  await exec(cmd)

  ee1.stdout.emit('data', 'Output')
  ee1.stderr.emit('data', 'Error')
  ee1.emit('close')

  ee2.emit('error', new Error('Some error message'))
  ee2.emit('close')

  expect(childProcess.spawn).toHaveBeenCalledTimes(2)
  expect(childProcess.spawn).toHaveBeenNthCalledWith(1, cmd, { cwd: directories[0], shell: true })
  expect(childProcess.spawn).toHaveBeenNthCalledWith(2, cmd, { cwd: directories[1], shell: true })
  expect(messages).toMatchSnapshot()
})

it('should return when there is no project', async () => {
  expect.assertions(1)

  const cmd = 'my-cmd'

  config.projects.list.mockResolvedValue([])

  await exec(cmd)

  expect(childProcess.spawn).not.toHaveBeenCalled()
})

it('should filter the project directories with the given regexp', async () => {
  expect.assertions(2)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const filteredDirectories = ['/path/to/my-second-directory']
  const cmd = 'my-cmd'
  const regex = new RegExp('second', 'iu')

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  childProcess.spawn.mockReturnValue(ee)

  await exec(cmd, { regex })

  expect(childProcess.spawn).toHaveBeenCalledTimes(1)
  expect(childProcess.spawn).toHaveBeenNthCalledWith(1, cmd, { cwd: filteredDirectories[0], shell: true })
})

it('should interactively ask for the project directories', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const cmd = 'my-cmd'

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))
  childProcess.spawn.mockReturnValue(ee)

  await exec(cmd, { interactive: true })

  expect(cio.checkbox).toHaveBeenCalledTimes(1)
})

it('should respect the maximum concurrency option', async () => {
  expect.assertions(2)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory', '/path/to/my-third-directory']
  const cmd = 'my-cmd'
  const number = 2

  const ee = new events.EventEmitter()
  ee.stderr = new events.EventEmitter()
  ee.stdout = new events.EventEmitter()

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  childProcess.spawn.mockReturnValue(ee)

  await exec(cmd, { number })

  expect(childProcess.spawn).toHaveBeenCalledTimes(2)

  ee.emit('close')

  expect(childProcess.spawn).toHaveBeenCalledTimes(3)
})
