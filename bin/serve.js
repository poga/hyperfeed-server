const fs = require('fs')
const async = require('async')
const level = require('level')

var argv = require('minimist')(process.argv.slice(2))
var opts = {webrtc: argv.webrtc, storage: level('./feeds')}

const server = require('..')

var config = JSON.parse(fs.readFileSync(argv._[0]))
var keystore = {}
try {
  keystore = JSON.parse(fs.readFileSync(`${argv._[0]}.manifest`))
} catch (e) {

}

var servers = []
config.feeds.forEach(conf => {
  opts.key = keystore[conf.url]

  servers.push((cb) => {
    server.serve(conf.url, opts, cb)
  })
})

async.series(servers, (err, connections) => {
  if (err) throw (err)
  connections.forEach(conn => {
    console.log(conn.feed.key().toString('hex'))
    if (!keystore[conn.url]) keystore[conn.url] = conn.feed.key().toString('hex')
  })

  fs.writeFileSync(`${argv._[0]}.manifest`, JSON.stringify(keystore))
})
