jest.mock('../cio')
jest.mock('../config')
jest.mock('../git/status')

const cio = require('../cio')
const config = require('../config')
const gitStatus = require('../git/status')

const status = require('./status')

// Keep real implementation of message.
cio.message = jest.requireActual('../cio').message

beforeEach(() => {
  jest.resetAllMocks()
})

it('should display the project status', async () => {
  expect.assertions(1)

  const projects = [{
    directory: 'path/to/my-first-directory',
    repository: 'git@github.com:my-first-repository.git'
  }, {
    directory: 'path/to/my-second-directory',
    repository: 'git@github.com:my-second-repository.git'
  }, {
    directory: 'path/to/my-third-directory',
    repository: 'git@github.com:my-third-repository.git'
  }, {
    directory: 'path/to/my-fourth-directory',
    repository: 'git@github.com:my-fourth-repository.git'
  }]

  const messages = []

  config.projects.mockResolvedValue(projects)
  cio.wait.mockImplementation(p => p)

  gitStatus.mockResolvedValueOnce({
    directory: projects[0].directory,
    branch: 'short-name',
    state: '[ahead 1]',
    changes: 0
  })

  gitStatus.mockResolvedValueOnce({
    directory: projects[1].directory,
    branch: 'a-very-long-name-of-branch-that-is-awesome',
    state: '[behind 15]',
    changes: 1
  })

  gitStatus.mockResolvedValueOnce({
    directory: projects[2].directory,
    branch: 'some-other-branch',
    state: '',
    changes: 100
  })

  gitStatus.mockResolvedValueOnce({
    directory: projects[3].directory,
    error: new Error('Some error')
  })

  cio.log.mockImplementation(message => messages.push(message))

  await status()

  expect(messages).toMatchSnapshot()
})

it('should return when there is no projects', async () => {
  expect.assertions(1)

  config.projects.mockResolvedValue([])

  await status()

  expect(cio.wait).not.toHaveBeenCalled()
})
