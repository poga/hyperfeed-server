const Hyperfeed = require('hyperfeed')
const request = require('request')

var argv = require('minimist')(process.argv.slice(2))
var opts = {webrtc: argv.webrtc}

module.exports = {serve: serve, update: update}

function serve (url, opts, cb) {
  var feed
  if (opts.key) {
    feed = new Hyperfeed(opts.key, {storage: opts.storage})
  } else {
    feed = new Hyperfeed({storage: opts.storage})
  }

  update(url, feed, done)

  function done (err) {
    if (err) return cb(err)
    var sw = swarm(feed, opts.webrtc)
    sw.on('connection', function (peer, type) {
      console.log(`[${feed.key().toString('hex')}]`, 'got', type) // type is 'webrtc-swarm' or 'discovery-swarm'
      console.log(`[${feed.key().toString('hex')}]`, 'connected to', sw.connections, 'peers')
      peer.on('close', function () {
        console.log(`[${feed.key().toString('hex')}]`, 'peer disconnected')
      })
    })
    cb(null, {feed: feed.toString('hex'), sw: sw})
  }
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
