const Hyperfeed = require('hyperfeed')
const request = require('request')

var argv = require('minimist')(process.argv.slice(2))
var opts = {webrtc: argv.webrtc}

module.exports = {serve: serve}

function serve (config, opts, cb) {
  var conns = {}
  config.feeds.forEach(feedConfig => {
    var feed = new Hyperfeed()

    update(feedConfig.url, feed, (err) => {
      if (err) return cb(err)
      var sw = swarm(feed, opts.webrtc)
      sw.on('connection', function (peer, type) {
        console.log('got', type) // type is 'webrtc-swarm' or 'discovery-swarm'
        console.log('connected to', sw.connections, 'peers')
        peer.on('close', function () {
          console.log('peer disconnected')
        })
      })
      conns[feedConfig.url] = {key: feed.key().toString('hex'), sw: sw}
      cb(null, conns)
    })
  })
}

function update (url, feed, cb) {
  request(url, (err, resp, body) => {
    if (err) return cb(err)

    feed.update(body).then(feed => cb(null, feed))
  })
}

function swarm (feed, useWebRTC) {
  var sw
  if (useWebRTC) {
    var wrtc = require('electron-webrtc')()
    // listen for errors
    wrtc.on('error', function (err, source) {
      throw (err)
    })
    sw = feed.swarm({wrtc: wrtc})
  } else {
    sw = feed.swarm()
  }
  return sw
}
