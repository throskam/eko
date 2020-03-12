jest.mock('fs')
jest.mock('../cio')
jest.mock('../git/clone')
jest.mock('../config')
jest.mock('../git/ignore')

const fs = require('fs')
const gitClone = require('../git/clone')
const config = require('../config')
const gitIgnore = require('../git/ignore')

const add = require('./add')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should add the project to the config file', async () => {
  expect.assertions(1)

  const repository = 'git@example.com:owner/my-repository.git'
  const directory = 'my-repository-directory'

  fs.access.mockImplementation((file, cb) => cb(new Error()))
  config.add.mockResolvedValue()
  gitIgnore.add.mockResolvedValue()
  gitClone.mockResolvedValue()

  await add(repository, directory)

  expect(config.add).toHaveBeenCalledWith(directory, repository)
})

it('should add the project to the gitignore file', async () => {
  expect.assertions(1)

  const repository = 'git@example.com:owner/my-repository.git'
  const directory = 'my-repository-directory'

  fs.access.mockImplementation((file, cb) => cb(new Error()))
  config.add.mockResolvedValue()
  gitIgnore.add.mockResolvedValue()
  gitClone.mockResolvedValue()

  await add(repository, directory)

  expect(gitIgnore.add).toHaveBeenCalledWith(directory)
})

it('shoud clone when the directory is missing', async () => {
  expect.assertions(1)

  const repository = 'git@example.com:owner/my-repository.git'
  const directory = 'my-repository-directory'

  fs.access.mockImplementation((file, cb) => cb(new Error()))
  config.add.mockResolvedValue()
  gitIgnore.add.mockResolvedValue()
  gitClone.mockResolvedValue()

  await add(repository, directory)

  expect(gitClone).toHaveBeenCalledWith(repository, directory)
})

it('shoud not clone when the directory is already there', async () => {
  expect.assertions(1)

  const repository = 'git@example.com:owner/my-repository.git'
  const directory = 'my-repository-directory'

  config.add.mockResolvedValue()
  gitIgnore.add.mockResolvedValue()
  gitClone.mockResolvedValue()

  fs.access.mockImplementation((file, cb) => cb())

  await add(repository, directory)

  expect(gitClone).not.toHaveBeenCalled()
})

it('should use the repository name as the default directory name', async () => {
  expect.assertions(1)

  const repository = 'git@example.com:owner/my-repository.git'

  fs.access.mockImplementation((file, cb) => cb(new Error()))
  config.add.mockResolvedValue()
  gitIgnore.add.mockResolvedValue()
  gitClone.mockResolvedValue()

  await add(repository)

  expect(config.add).toHaveBeenCalledWith('my-repository', repository)
})
