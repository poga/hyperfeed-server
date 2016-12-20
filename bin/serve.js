#! /usr/bin/env node
const fs = require('fs')
const async = require('async')
const level = require('level')
const hyperfeed = require('hyperfeed')
const hyperdrive = require('hyperdrive')
const server = require('..')

var argv = require('minimist')(process.argv.slice(2))

var config = JSON.parse(fs.readFileSync(argv._[0]))
var keystore = {}
try {
  keystore = JSON.parse(fs.readFileSync(`${argv._[0]}.manifest`))
} catch (e) {
  // ignore if keystore file is not found
}
var hf = hyperfeed(hyperdrive(level(`${argv._[0]}.db`)))

var servers = []
config.feeds.forEach(conf => {
  servers.push(serve(conf))
})

async.series(servers, (err, connections) => {
  if (err) throw (err)
  connections.forEach(conn => {
    console.log('serving', conn.url, 'at', conn.feed.key().toString('hex'))
    debug(conn.feed, conn.sw)
    if (!keystore[conn.url]) keystore[conn.url] = conn.feed.key().toString('hex')
  })

  if (argv.merge) {
    var out = hf.createFeed(keystore['merge'], {own: true})
    var ins = connections.map(c => c.feed)
    require('hyperfeed-merge')(ins, out)
    debug(out, server.swarm(out))

    keystore['merge'] = out.key().toString('hex')
    console.log('merged feed key:', out.key().toString('hex'))
  }

  fs.writeFileSync(`${argv._[0]}.manifest`, JSON.stringify(keystore, undefined, 2))
})

function serve (conf) {
  return (cb) => {
    var feed = hf.createFeed(keystore[conf.url], {own: true, scrap: conf.scrap})
    server.serve(feed, conf.url, {live: argv.live, interval: 300 * 1000}, cb)
  }
}

function debug (feed, sw) {
  sw.on('connection', function (peer, type) {
    console.log(`[${feed.key().toString('hex')}]`, 'got', type) // type is 'webrtc-swarm' or 'discovery-swarm'
    console.log(`[${feed.key().toString('hex')}]`, 'connected to', sw.connections, 'peers')
    peer.on('close', function () {
      console.log(`[${feed.key().toString('hex')}]`, 'peer disconnected')
    })
  })
}

