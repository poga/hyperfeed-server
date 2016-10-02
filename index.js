const Hyperfeed = require('hyperfeed')
const request = require('request')

module.exports = {serve: serve, update: update}

function serve (url, opts, cb) {
  var feed
  if (opts.key) {
    console.log('reopening', opts.key)
    feed = new Hyperfeed(opts.key, {storage: opts.storage, own: opts.own})
  } else {
    feed = new Hyperfeed({storage: opts.storage})
  }

  update(url, feed, done)

  function done (err) {
    if (err) return cb(err)
    var sw = swarm(feed, opts.webrtc)
    console.log('serving', feed.key().toString('hex'))
    sw.on('connection', function (peer, type) {
      console.log(`[${feed.key().toString('hex')}]`, 'got', type) // type is 'webrtc-swarm' or 'discovery-swarm'
      console.log(`[${feed.key().toString('hex')}]`, 'connected to', sw.connections, 'peers')
      peer.on('close', function () {
        console.log(`[${feed.key().toString('hex')}]`, 'peer disconnected')
      })
    })
    cb(null, {url: url, feed: feed, sw: sw})
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
