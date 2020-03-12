jest.mock('process')
jest.mock('../cio')
jest.mock('../git/clone')
jest.mock('./sync')

const chdir = jest.spyOn(process, 'chdir')
process.chdir.mockImplementation(() => {})

const gitClone = require('../git/clone')
const sync = require('./sync')

const clone = require('./clone')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should clone the repository', async () => {
  expect.assertions(1)

  const repository = 'git@example.com:owner/my-repository.git'
  const directory = 'my-repository-directory'

  gitClone.mockResolvedValue()
  sync.mockResolvedValue()

  await clone(repository, directory)

  expect(gitClone).toHaveBeenCalledWith(repository, directory)
})

it('should sync the project', async () => {
  expect.assertions(2)

  const repository = 'git@example.com:owner/my-repository.git'
  const directory = 'my-repository-directory'

  gitClone.mockResolvedValue()
  sync.mockResolvedValue()

  await clone(repository, directory)

  expect(chdir).toHaveBeenCalledWith(directory)
  expect(sync).toHaveBeenCalled()
})
