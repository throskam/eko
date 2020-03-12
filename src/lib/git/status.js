const debug = require('debug')('git-status')
const exec = require('util').promisify(require('child_process').exec)

const concat = (...args) => args.join(' ')

module.exports = async (directory) => {
  try {
    const cmd = {
      branch: concat('git', 'rev-parse', '--abbrev-ref', 'HEAD'),
      changes: concat('git', 'status', '--porcelain'),
      state: concat('git', 'status', '-sb')
    }

    debug('execute "' + cmd.branch + '" in ' + directory)
    debug('execute "' + cmd.changes + '" in ' + directory)
    debug('execute "' + cmd.state + '" in ' + directory)

    const [branch, changes, state] = await Promise.all([
      exec(cmd.branch, { cwd: directory }),
      exec(cmd.changes, { cwd: directory }),
      exec(cmd.state, { cwd: directory })
    ])

    return {
      directory,
      branch: branch.stdout.trim(),
      state: (/\[.*\]/g.exec(state.stdout.trim()) || []).shift() || '',
      changes: changes.stdout.trim() ? changes.stdout.trim().split('\n').length : 0
    }
  } catch (err) {
    return {
      directory,
      error: err
    }
  }
}
