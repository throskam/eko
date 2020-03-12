jest.mock('child_process')
jest.mock('../cio')
jest.mock('../config')
jest.mock('../git/ignore')

const childProcess = require('child_process')
const cio = require('../cio')
const config = require('../config')
const gitIgnore = require('../git/ignore')

const remove = require('./remove')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should remove the directory from the project', async () => {
  expect.assertions(1)

  const directory = 'path/to/my-directory'

  cio.confirm.mockResolvedValue(true)
  childProcess.exec.mockImplementation((cmd, cb) => cb())

  await remove(directory)

  expect(config.remove).toHaveBeenCalled()
})

it('should remove the project directory from the gitignore', async () => {
  expect.assertions(1)

  const directory = 'path/to/my-directory'

  cio.confirm.mockResolvedValue(true)
  childProcess.exec.mockImplementation((cmd, cb) => cb())

  await remove(directory)

  expect(gitIgnore.remove).toHaveBeenCalled()
})

it('should ask for confirmation before removing the directory', async () => {
  expect.assertions(1)

  const directory = 'path/to/my-directory'

  cio.confirm.mockResolvedValue(true)
  childProcess.exec.mockImplementation((cmd, cb) => cb())

  await remove(directory)

  expect(cio.confirm).toHaveBeenCalled()
})

it('should remove the directory when confirming', async () => {
  expect.assertions(1)

  const directory = 'path/to/my-directory'

  cio.confirm.mockResolvedValue(true)
  childProcess.exec.mockImplementation((cmd, cb) => cb())

  await remove(directory)

  expect(childProcess.exec).toHaveBeenCalledWith('rm -rf ' + directory, expect.any(Function))
})

it('should keep the directory when not confirming', async () => {
  expect.assertions(1)

  const directory = 'path/to/my-directory'

  cio.confirm.mockResolvedValue(false)
  childProcess.exec.mockImplementation((cmd, cb) => cb())

  await remove(directory)

  expect(childProcess.exec).not.toHaveBeenCalled()
})
