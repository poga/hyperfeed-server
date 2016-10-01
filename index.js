const Hyperfeed = require('hyperfeed')
const request = require('request')

var argv = require('minimist')(process.argv.slice(2))
var opts = {webrtc: argv.webrtc}

host(argv._[0], opts, (err, feed, sw) => {
  if (err) throw (err)
  console.log(feed.key().toString('hex'))
  sw.on('connection', function (peer, type) {
    console.log('got', type) // type is 'webrtc-swarm' or 'discovery-swarm'
    console.log('connected to', sw.connections, 'peers')
    peer.on('close', function () {
      console.log('peer disconnected')
    })
  })
})

function host (rssURL, opts, cb) {
  var feed = new Hyperfeed()
  request(rssURL, (err, resp, body) => {
    if (err) return cb(err)
    feed.update(body).then(feed => {
      var sw
      if (opts.webrtc === true) {
        var wrtc = require('electron-webrtc')()
        // listen for errors
        wrtc.on('error', function (err, source) {
          throw (err)
        })
        sw = feed.swarm({wrtc: wrtc})
      } else {
        sw = feed.swarm()
      }
      cb(null, feed, sw)
    })
  })
}

