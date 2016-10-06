const request = require('request')

module.exports = {serve: serve, swarm: swarm}

function serve (feed, url, opts, cb) {
  request(url, (err, resp, body) => {
    if (err) return done(err)

    feed.update(body).then(done(null))
  })

  function done (err) {
    if (err) return cb(err)
    var sw = swarm(feed, opts.useWebRTC)
    cb(null, {url: url, feed: feed, sw: sw})
  }

  if (opts.live) {
    setInterval(() => {
      request(url, (err, resp, body) => {
        if (err) return console.log(err)

        feed.update(body).then(() => { console.log(`[${feed.key().toString('hex')}]`, 'updated') })
      })
    }, opts.interval)
  }
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
