jest.mock('child_process')
jest.mock('glob')
jest.mock('./add')
jest.mock('../cio')
jest.mock('../config')

const childProcess = require('child_process')
const glob = require('glob')
const add = require('./add')
const cio = require('../cio')
const config = require('../config')

const discover = require('./discover')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should ignore excluded directories', async () => {
  expect.assertions(1)

  const option = { ignore: 'pattern' }
  const gits = ['/path/to/my-directory/.git', '/path/to/my-second-directory/.git']

  config.projects.mockResolvedValue([])
  cio.wait.mockImplementation(p => p)
  glob.mockImplementation((pattern, option, cb) => cb(null, gits))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))
  childProcess.exec.mockImplementation((cmd, option, cb) => cb(null, { stdout: '' }))

  await discover(option)

  expect(glob).toHaveBeenCalledWith(expect.any(String), { ignore: option.ignore, silent: true }, expect.any(Function))
})

it('should add select repositories', async () => {
  expect.assertions(2)

  const gits = ['/path/to/my-directory/.git', '/path/to/my-second-directory/.git']
  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const repository = 'git@github.com:user/repository'

  config.projects.mockResolvedValue([])
  cio.wait.mockImplementation(p => p)
  glob.mockImplementation((pattern, option, cb) => cb(null, gits))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))
  childProcess.exec.mockImplementation((cmd, option, cb) => cb(null, { stdout: repository }))

  await discover()

  expect(add).toHaveBeenCalledWith(repository, directories[0])
  expect(add).toHaveBeenCalledWith(repository, directories[1])
})

it('should exit when no directories are found', async () => {
  const gits = []

  config.projects.mockResolvedValue([])
  cio.wait.mockImplementation(p => p)
  glob.mockImplementation((pattern, option, cb) => cb(null, gits))

  await discover()

  expect(cio.checkbox).not.toHaveBeenCalled()
})

it('should ignore already added project', async () => {
  expect.assertions(2)

  const projects = [{ repository: 'git@github.com:user/my-second-repository', directory: '/path/to/my-second-directory' }]
  const gits = ['/path/to/my-directory/.git', '/path/to/my-second-directory/.git']
  const repository = 'git@github.com:user/my-repository'
  const directory = '/path/to/my-directory'

  config.projects.mockResolvedValue(projects)
  cio.wait.mockImplementation(p => p)
  glob.mockImplementation((pattern, option, cb) => cb(null, gits))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))
  childProcess.exec.mockImplementation((cmd, option, cb) => cb(null, { stdout: repository }))

  await discover()

  expect(add).toHaveBeenCalledTimes(1)
  expect(add).toHaveBeenCalledWith(repository, directory)
})

it('should filter by regex', async () => {
  expect.assertions(1)

  const gits = ['/path/to/my-directory/.git', '/path/to/my-second-directory/.git']
  const filteredDirectories = ['/path/to/my-second-directory']

  config.projects.mockResolvedValue([])
  cio.wait.mockImplementation(p => p)
  glob.mockImplementation((pattern, option, cb) => cb(null, gits))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))
  childProcess.exec.mockImplementation((cmd, option, cb) => cb(null, { stdout: '' }))

  await discover({ regex: new RegExp('second', 'iu') })

  expect(cio.checkbox).toHaveBeenCalledWith(expect.any(String), filteredDirectories)
})
