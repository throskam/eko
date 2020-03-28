jest.mock('../cio')
jest.mock('../config')

const cio = require('../cio')
const config = require('../config')

// Keep real implementation of message.
cio.message = jest.requireActual('../cio').message

const tag = require('./tag')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should list tags', async () => {
  expect.assertions(1)

  const messages = []

  const projects = [{
    directory: '/path/to/my-first-directory',
    tags: ['first-tag']
  }, {
    directory: '/path/to/my-second-directory'
  }]

  config.projects.list.mockResolvedValue(projects)
  cio.log.mockImplementation(message => messages.push(message))

  await tag()

  expect(messages).toMatchSnapshot()
})

it('should tag projects', async () => {
  expect.assertions(2)

  const name = 'my-tag'

  const projects = [{
    directory: '/path/to/my-first-directory',
    tags: ['first-tag']
  }, {
    directory: '/path/to/my-second-directory'
  }]

  config.projects.list.mockResolvedValue(projects)

  await tag(name)

  expect(config.projects.add).toHaveBeenNthCalledWith(1, expect.objectContaining({
    ...projects[0],
    tags: [...projects[0].tags, name]
  }), true)

  expect(config.projects.add).toHaveBeenNthCalledWith(2, expect.objectContaining({
    ...projects[1],
    tags: [name]
  }), true)
})

it('should untag projects', async () => {
  expect.assertions(2)

  const name = 'my-tag'

  const projects = [{
    directory: '/path/to/my-first-directory',
    tags: ['first-tag', name]
  }, {
    directory: '/path/to/my-second-directory'
  }]

  config.projects.list.mockResolvedValue(projects)

  await tag(name, { delete: true })

  expect(config.projects.add).toHaveBeenNthCalledWith(1, expect.objectContaining({
    ...projects[0],
    tags: projects[0].tags.slice(0, -1)
  }), true)

  expect(config.projects.add).toHaveBeenNthCalledWith(2, expect.objectContaining({
    ...projects[1],
    tags: []
  }), true)
})

it('should sort tag alphabetically', async () => {
  expect.assertions(2)

  const name = 'b-tag'

  const projects = [{
    directory: '/path/to/my-first-directory',
    tags: ['a-tag']
  }, {
    directory: '/path/to/my-second-directory',
    tags: ['c-tag']
  }]

  config.projects.list.mockResolvedValue(projects)

  await tag(name)

  expect(config.projects.add).toHaveBeenNthCalledWith(1, expect.objectContaining({
    ...projects[0],
    tags: [...projects[0].tags, name]
  }), true)

  expect(config.projects.add).toHaveBeenNthCalledWith(2, expect.objectContaining({
    ...projects[1],
    tags: [name, ...projects[1].tags]
  }), true)
})

it('should return when there is no project', async () => {
  expect.assertions(1)

  const name = 'my-tag'

  config.projects.list.mockResolvedValue([])

  await tag(name)

  expect(config.projects.add).not.toHaveBeenCalled()
})

it('should filter the project directories with the given regexp', async () => {
  expect.assertions(2)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const filteredDirectories = ['/path/to/my-second-directory']
  const name = 'my-tag'
  const regex = new RegExp('second', 'iu')

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))

  await tag(name, { regex })

  expect(config.projects.add).toHaveBeenCalledTimes(1)

  expect(config.projects.add).toHaveBeenNthCalledWith(1, expect.objectContaining({
    directory: filteredDirectories[0]
  }), true)
})

it('should interactively ask for the project directories', async () => {
  expect.assertions(1)

  const directories = ['/path/to/my-directory', '/path/to/my-second-directory']
  const name = 'my-tag'

  config.projects.list.mockResolvedValue(directories.map(directory => ({ directory })))
  cio.checkbox.mockImplementation((message, items) => Promise.resolve(items))

  await tag(name, { interactive: true })

  expect(cio.checkbox).toHaveBeenCalledTimes(1)
})
