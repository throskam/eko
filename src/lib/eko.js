const path = require('path')
const access = require('util').promisify(require('fs').access)
const exec = require('util').promisify(require('child_process').exec)
const { spawn } = require('child_process')
const pretty = require('pretty-time')
const inquirer = require('inquirer')
const glob = require('util').promisify(require('glob'))

const format = require('./format')
const spinner = require('./spinner')
const rc = require('./rc')
const gitignore = require('./gitignore')

const exist = async file => access(file).then(() => true, () => false)

const concat = (...args) => args.join(' ')

const clone = (repository, directory) => {
  /**
   * Output:
   * cloning <repo> in <dir> ...
   * repository <repo> cloned in <dir>
   * impossible to clone <repo> in <dir>
   */
  return spinner(
    exec(concat('git clone', repository, directory)),
    concat(format.info('cloning'), repository, format.info('in'), directory, format.info('...')),
    concat(format.info('repository'), repository, format.info('cloned in'), directory),
    concat(format.info('impossible to clone'), repository, format.info('in'), directory)
  )
}

const alpha = (key) => (a, b) => {
  if (a[key] === b[key]) {
    return 0
  }

  return a[key] > b[key] ? 1 : -1
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
      await spinner(
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
    await spinner(
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
          await spinner(
            Promise.resolve(),
            concat(format.info('skipping'), project.directory, format.info('project')),
            concat(format.info('project'), project.directory, format.info('skipped'))
          )
          return
        }

        try {
          await clone(project.repository, project.directory)
        } catch (err) {
          // Ignore and continue
        }

        if (await exist(path.join(project.repository, '.eko'))) {
          const cwd = process.cwd()

          process.chdir(project.directory)
          await this.sync()
          process.chdir(cwd)
        }
      })
    }, Promise.resolve())
  },
  async discover (option) {
    const projects = await rc.projects()

    /**
     * Output:
     * collecting data
     * data collected
     * impossible to collect data
     */
    const gits = await spinner(
      glob('**/.git', { ignore: option.ignore, silent: true }),
      format.info('collecting data...'),
      format.info('data collected'),
      format.info('impossible to collect data')
    )

    let directories = gits
      .map(git => path.dirname(git))
      .filter(directory => directory !== '.')
      .filter(directory => !projects.find(project => project.directory === directory))
      .filter(directory => !option.regex || option.regex.test(directory))

    if (!directories.length) {
      console.log('Nothing found')
      return
    }

    const answer = await inquirer.prompt({
      type: 'checkbox',
      name: 'directories',
      message: 'Choose the directories you want to add to your project',
      choices: directories
    })

    directories = answer.directories

    return directories.reduce(async (acc, directory) => {
      return acc.then(async () => {
        const stream = await exec('git config --get remote.origin.url', { cwd: directory })
        const repository = stream.stdout.trim()

        return this.add(repository, directory)
      })
    }, Promise.resolve())
  },
  async status () {
    const projects = await rc.projects()
    const status = {}

    /**
     * Output:
     * collection data
     * data collected
     * impossible to collect data
     */
    await spinner(
      Promise.all(projects.map(async (project) => {
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
      })),
      format.info('collecting data...'),
      format.info('data collected'),
      format.info('impossible to collect data')
    )

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

    console.log()

    statuses.sort(alpha('directory')).forEach(({ error, directory, branch, changes }) => {
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
            format.error(error.message)
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
    await spinner(
      Promise.all([rc.add(directory, repository), gitignore.add(directory)]),
      concat(format.info('adding'), directory, format.info('project')),
      concat(format.info('project'), directory, format.info('added')),
      concat(format.info('impossible to add'), directory, format.info('project'))
    )

    // Ignore if already cloned.
    if (await exist(path.join(directory, '.git'))) {
      return
    }

    return clone(repository, directory)
  },
  async remove (directory) {
    /**
     * Output:
     * removing <dir> project
     * project <dir> removed
     * impossible to remove <dir> project
     */
    await spinner(
      Promise.all([rc.remove(directory), gitignore.remove(directory)]),
      concat(format.info('removing'), directory, format.info('project')),
      concat(format.info('project'), directory, format.info('removed')),
      concat(format.info('impossible to remove'), directory, format.info('project'))
    )

    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to remove the directory ?',
      default: true
    })

    if (answer.confirm) {
      /**
       * Output:
       * removing <dir> directory
       * directory <dir> removed
       * impossible to remove <dir> directory
       */
      return spinner(
        exec(concat('rm -rf', directory)),
        concat(format.info('removing'), directory, format.info('directory')),
        concat(format.info('directory'), directory, format.info('removed')),
        concat(format.info('impossible to remove'), directory, format.info('directory'))
      )
    }
  },
  async exec (command, option) {
    const projects = await rc.projects()

    let directories = projects
      .map(project => project.directory)
      .filter(directory => !option.regex || option.regex.test(directory))

    if (option.interactive && directories.length) {
      const answer = await inquirer.prompt({
        type: 'checkbox',
        name: 'directories',
        message: 'Choose the directories you want to target',
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
            format.error(error.message)
          ] : [])
        )

        if (!error) {
          buffers.map(buffer => process.stdout.write(buffer))
        }

        console.log()

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
