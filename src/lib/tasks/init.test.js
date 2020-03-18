jest.mock('../cio')
jest.mock('../config')
jest.mock('../env')

const config = require('../config')
const env = require('../env')

const chdir = jest.spyOn(process, 'chdir')
process.chdir.mockImplementation(() => {})

const init = require('./init')

beforeEach(() => {
  jest.resetAllMocks()
})

it('should change directory to the working one', async () => {
  const cwd = 'my-directory'

  env.mockResolvedValue({
    workdir: cwd
  })

  await init()

  expect(chdir).toHaveBeenCalledWith(cwd)
})

it('should initialize the configuration file', async () => {
  const cwd = 'my-directory'

  env.mockResolvedValue({
    workdir: cwd
  })

  await init()

  expect(config.initialize).toHaveBeenCalled()
})
