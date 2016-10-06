# hyperfeed-host

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Hosting a [Hyperfeed](https://github.com/poga/hyperfeed) from command line.

`npm i hyperfeed-server`

## Usage

`$ hyperfeed-server <CONFIG_PATH> [--webrtc] [--merge] [--live]`

options:

* webrtc: enable webrtc connection (use [electron-webrtc](https://github.com/mappum/electron-webrtc))
* merge: create a new feed which contains all items from source feeds
* live: automatically re-fetch source url

## License

The MIT License.
