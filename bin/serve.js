var argv = require('minimist')(process.argv.slice(2))
var opts = {webrtc: argv.webrtc}

const server = require('..')

var config = {
  feeds: [
    {
      url: argv._[0],
      refresh: 30 * 1000
    }
  ]
}

config.feeds.forEach(conf => {
  server.serve(conf.url, opts, (err, conn) => {
    if (err) throw (err)

    console.log(conn.feed.key().toString('hex'))
  })
})
