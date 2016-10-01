var argv = require('minimist')(process.argv.slice(2))
var opts = {webrtc: argv.webrtc}

const server = require('..')

server.serve({feeds: [{url: argv._[0]}]}, opts, (err, conns) => {
  if (err) throw (err)

  console.log(conns)
})
