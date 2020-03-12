jest.mock('fs')
jest.mock('../cio')
jest.mock('../config')
jest.mock('../git/clone')

const fs = require('fs')
const config = require('../config')
const gitClone = require('../git/clone')

const sync = require('./sync')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should clone missing project', async () => {
  expect.assertions(1)

  const projects = [{
    directory: 'path/to/my-directory',
    repository: 'git@github.com:my-repository.git'
  }]

  config.projects.mockResolvedValue(projects)
  fs.access.mockImplementation((file, cb) => cb(new Error()))

  await sync()

  expect(gitClone).toHaveBeenCalledTimes(1)
})

it('should skip project with existing directory', async () => {
  expect.assertions(1)

  const projects = [{
    directory: 'path/to/my-directory',
    repository: 'git@github.com:my-repository.git'
  }]

  config.projects.mockResolvedValue(projects)
  fs.access.mockImplementation((file, cb) => cb(null))

  await sync()

  expect(gitClone).not.toHaveBeenCalled()
})
