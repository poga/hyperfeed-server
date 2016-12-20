const request = require('request')
const hyperdiscovery = require('hyperdiscovery')

module.exports = {serve: serve, swarm: swarm}

function serve (feed, url, opts, cb) {
  request(url, (err, resp, body) => {
    if (err) return done(err)

    feed.update(body).then(() => { done() })
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

function swarm (feed) {
  return hyperdiscovery(feed)
}
