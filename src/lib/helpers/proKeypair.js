const path = require('path')
const childProcess = require('child_process')

const guessPrivateKeyName = require('./guessPrivateKeyName')
const guessPublicKeyName = require('./guessPublicKeyName')

class ProKeypair {
  constructor (envFilepath) {
    this.envFilepath = envFilepath
  }

  run () {
    let result = {}

    try {
      // if installed as sibling module
      const projectRoot = path.resolve(process.cwd())
      // eslint-disable-next-line no-eval
      const dotenvxProPath = eval('require').resolve('@dotenvx/dotenvx-pro', { paths: [projectRoot] }) // necessary for webpack builds
      // eslint-disable-next-line no-eval
      const { keypair } = eval('require')(dotenvxProPath) // necessary for webpack builds
      result = keypair(this.envFilepath)
    } catch (_e) {
      try {
        // if installed as binary cli
        const output = childProcess.execSync(`dotenvx-pro keypair -f ${this.envFilepath}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()

        result = JSON.parse(output)
      } catch (_e) {
        const privateKeyName = guessPrivateKeyName(this.envFilepath)
        const publicKeyName = guessPublicKeyName(this.envFilepath)

        // match format of dotenvx-pro
        result[privateKeyName] = null
        result[publicKeyName] = null
      }
    }

    return result
  }
}

module.exports = ProKeypair
