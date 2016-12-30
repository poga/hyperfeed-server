#! /usr/bin/env node
const fs = require('fs')
const async = require('async')
const level = require('level')
const hyperfeed = require('hyperfeed')
const hyperdrive = require('hyperdrive')
const Hyperify = require('feed-hyperify')
const hyperdiscovery = require('hyperdiscovery')
const WSS = require('hyperfeed-ws')

const argv = require('minimist')(process.argv.slice(2))
const configPath = argv._[0]
const manifestPath = `${configPath}.manifest`
const dbPath = `${configPath}.db`

var config = JSON.parse(fs.readFileSync(configPath))
var keystore = safeLoad(manifestPath)
var hf = hyperfeed(hyperdrive(level(dbPath)))

var servers = []
config.feeds.forEach(conf => {
  servers.push(serve(conf))
})

// start crawler for each feed sequentially
async.series(servers, (err, connections) => {
  if (err) throw (err)

  if (argv.merge) {
    var out = hf.createFeed(keystore['merge'], {own: true})
    var ins = connections.map(c => c.feed)
    require('hyperfeed-merge')(ins, out)
    debug(out, hyperdiscovery(out))

    keystore['merge'] = out.key.toString('hex')
    console.log('merged feed key:', out.key.toString('hex'))
    var wss = new WSS(out, {port: 9090, filter: x => x.ctime >= Date.now() - 1000 * 60 * 60 * 24 * 7}) // no older than 7 days
    wss._server.on('connection', () => { console.log('connected') })
  }

  fs.writeFileSync(manifestPath, JSON.stringify(keystore, undefined, 2))
})

function serve (conf) {
  return (cb) => {
    var feed = hf.createFeed(keystore[conf.url], {own: true, scrap: conf.scrap})
    var crawler = new Hyperify(feed, conf.url, 300 * 1000)
    var sw = hyperdiscovery(feed)
    debug(feed, sw)
    if (!keystore[conf.url]) keystore[conf.url] = feed.key.toString('hex')
    console.log('serving', conf.url, 'at', feed.key.toString('hex'))
    cb(null, {crawler, sw, feed})
  }
}

function debug (feed, sw) {
  sw.on('connection', function (peer, type) {
    console.log(`[${feed.key.toString('hex')}]`, 'got', type) // type is 'webrtc-swarm' or 'discovery-swarm'
    console.log(`[${feed.key.toString('hex')}]`, 'connected to', sw.connections, 'peers')
    peer.on('close', function () {
      console.log(`[${feed.key.toString('hex')}]`, 'peer disconnected')
    })
  })
}

function safeLoad (path) {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (e) {
    // ignore if keystore file is not found
    return {}
  }
}
