const path = require('path')
const access = require('util').promisify(require('fs').access)
const exec = require('util').promisify(require('child_process').exec)
const { spawn } = require('child_process')
const pretty = require('pretty-time')
const ora = require('ora')

const format = require('./format')
const rc = require('./rc')
const gitignore = require('./gitignore')

const exist = async file => access(file).then(() => true, () => false)

const concat = (...args) => args.join(' ')

const run = async (task, loading, success, error) => {
  const spinner = ora(loading)

  try {
    spinner.start()
    await task
    spinner.succeed(success)
  } catch (err) {
    spinner.fail(error)
    throw err
  }
}

const clone = (repository, directory) => {
  /**
   * Output:
   * cloning <repo> in <dir> ...
   * repository <repo> cloned in <dir>
   * impossible to clone <repo> in <dir>
   */
  return run(
    exec(concat('git clone', repository, directory)),
    concat(format.info('cloning'), repository, format.info('in'), directory, format.info('...')),
    concat(format.info('repository'), repository, format.info('cloned in'), directory),
    concat(format.info('impossible to clone'), repository, format.info('in'), directory)
  )
}

module.exports = {
  async create (directory) {
    if (directory !== '.') {
      /**
       * Output:
       * creating <dir>...
       * directory <dir> created
       * impossible to create <dir>
       */
      await run(
        exec(concat('mkdir -p', directory)),
        concat(format.info('creating'), directory, format.info('...')),
        concat(format.info('directory'), directory, format.info('created')),
        concat(format.info('impossible to create'), directory)
      )
      process.chdir(directory)
    }

    /**
     * Output:
     * writting .eko ...
     * .eko written
     * impossible to write .eko
     */
    await run(
      rc.initialize(),
      concat(format.info('writting'), '.eko', format.info('...')),
      concat('.eko', format.info(' written')),
      concat(format.info('impossible to write'), '.eko')
    )
  },
  async clone (repository, directory) {
    await clone(repository, directory)
    process.chdir(directory)
    this.sync()
  },
  async sync () {
    const projects = await rc.projects()

    return projects.reduce((acc, project) => {
      return acc.then(async () => {
        if (await exist(project.directory)) {
          /**
           * Output:
           * skipping <dir> project
           * project <dir> skipped
           */
          await run(
            Promise.resolve(),
            concat(format.info('skipping'), project.directory, format.info('project')),
            concat(format.info('project'), project.directory, format.info('skipped'))
          )
          return
        }

        await clone(project.repository, project.directory).catch(err => console.log(format.error(err)))

        if (await exist(path.join(project.repository, '.eko'))) {
          const cwd = process.cwd()

          process.chdir(project.directory)
          await this.sync()
          process.chdir(cwd)
        }
      })
    }, Promise.resolve())
  },
  async status () {
    const projects = await rc.projects()
    const status = {}

    const spinner = ora(format.info('collecting data...'))

    spinner.start()

    return projects.reduce((acc, project) => {
      return acc.then(async () => {
        try {
          const branch = await exec(concat('git', 'rev-parse', '--abbrev-ref', 'HEAD'), { cwd: project.directory })
          const changes = await exec(concat('git', 'status', '--porcelain'), { cwd: project.directory })
          const state = await exec(concat('git', 'status', '-sb'), { cwd: project.directory })

          status[project.directory] = {
            branch: branch.stdout.trim() + ' ' + ((/\[.*\]/g.exec(state.stdout.trim()) || []).shift() || ''),
            changes: changes.stdout.trim() ? changes.stdout.trim().split('\n').length : 0
          }
        } catch (err) {
          status[project.directory] = {
            error: err
          }
        }
      })
    }, Promise.resolve()).then(() => {
      const statuses = Object.keys(status).map(directory => ({ ...status[directory], directory }))

      const padding = statuses.reduce((maxes, { directory, branch, error }) => {
        if (error) {
          return maxes
        }

        return {
          directory: Math.max(directory.length, maxes.directory),
          branch: Math.max(branch.length, maxes.branch)
        }
      }, {
        directory: 0,
        branch: 0
      })

      spinner.succeed(format.info('data collected'))
      console.log()

      statuses.forEach(({ error, directory, branch, changes }) => {
        /**
         * Output:
         * project <dir> on <branch>
         * project <dir> on <branch> (<changes> changes)
         * project <dir> stopped <err> + error
         */
        console.log(
          format.info('▶'),
          directory.padEnd(padding.directory),
          ...(error
            ? [
              format.info('stopped'),
              format.fatal(error.message)
            ] : [
              format.info('on'),
              branch.padEnd(padding.branch),
              ...(changes
                ? [
                  format.info('with'),
                  changes,
                  format.info('change' + (changes > 1 ? 's' : ''))
                ] : [])
            ]
          )
        )

        if (error) {
          console.log(format.error(
            require('util').inspect(error, { showHidden: false, depth: null })
          ), '\n')
        }
      })
    }).catch((err) => {
      spinner.fail(format.info('impossible to collect data'))
      throw err
    })
  },
  async add (repository, directory) {
    if (!directory) {
      directory = path.basename(repository).replace(/\.git$/, '')
    }

    /**
     * Output:
     * adding <dir> project
     * project <dir> added
     * impossible to add <dir> project
     */
    await run(
      Promise.all([rc.add(directory, repository), gitignore.add(directory)]),
      concat(format.info('adding'), directory, format.info('project')),
      concat(format.info('project'), directory, format.info('added')),
      concat(format.info('impossible to add'), directory, format.info('project'))
    )

    return clone(repository, directory)
  },
  async remove (directory) {
    /**
     * Output:
     * removing <dir> project
     * project <dir> removed
     * impossible to remove <dir> project
     */
    await run(
      Promise.all([rc.remove(directory), gitignore.remove(directory)]),
      concat(format.info('removing'), directory, format.info('project')),
      concat(format.info('project'), directory, format.info('removed')),
      concat(format.info('impossible to remove'), directory, format.info('project'))
    )

    /**
     * Output:
     * removing <dir> directory
     * directory <dir> removed
     * impossible to remove <dir> directory
     */
    return run(
      exec(concat('rm -rf', directory)),
      concat(format.info('removing'), directory, format.info('directory')),
      concat(format.info('directory'), directory, format.info('removed')),
      concat(format.info('impossible to remove'), directory, format.info('directory'))
    )
  },
  async exec (command, option) {
    const projects = await rc.projects()

    let directories = projects
      .map(project => project.directory)
      .filter(directory => !option.regex || option.regex.test(directory))

    if (option.interactive && directories.length) {
      const inquirer = require('inquirer')

      const answer = await inquirer.prompt({
        type: 'checkbox',
        name: 'directories',
        message: 'Pick some directories',
        choices: directories
      })

      directories = answer.directories
    }

    const next = () => {
      const directory = directories.shift()

      if (!directory) {
        return
      }

      let error = null
      const buffers = []
      const hrstart = process.hrtime()

      const proc = spawn(command, {
        cwd: directory,
        shell: true
      })

      proc.stderr.on('data', (data) => {
        buffers.push(data)
      })

      proc.stdout.on('data', (data) => {
        buffers.push(data)
      })

      proc.on('close', (code) => {
        const hrend = process.hrtime(hrstart)

        /**
         * Output:
         * run <cmd> in <dir> took <time>
         * run <cmd> in <dir> took <time> stopped <err> + error
         */
        console.log(
          format.info('▶'),
          format.info('run'),
          command,
          format.info('in'),
          directory,
          format.info('took'),
          pretty(hrend),
          ...(error ? [
            format.info('stopped'),
            format.fatal(error.message)
          ] : [])
        )

        if (error) {
          console.log(format.error(
            require('util').inspect(error, { showHidden: false, depth: null })
          ), '\n')
        } else {
          buffers.map(buffer => process.stdout.write(buffer))
          console.log()
        }

        next()
      })

      proc.on('error', (err) => {
        error = err
      })
    }

    if (!option.number) {
      option.number = directories.length
    }

    option.number = Math.min(option.number, directories.length)

    for (let i = 0; i < option.number; i++) {
      next()
    }
  }
}
