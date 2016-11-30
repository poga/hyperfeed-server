# hyperfeed-server

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Hosting a [Hyperfeed](https://github.com/poga/hyperfeed) from command line.

`npm i hyperfeed-server`

## Usage

`$ hyperfeed-server <CONFIG_PATH> [--webrtc] [--merge] [--live]`

options:

* webrtc: enable webrtc connection (use [electron-webrtc](https://github.com/mappum/electron-webrtc)) *experimental, not always work*
* merge: create a new feed which contains all items from source feeds
* live: automatically re-fetch source url

## Linux

If you need to run on linux with webrtc enabled, try these steps (only tested on ubuntu 16.04)

Install electron deps:
```
sudo apt-get install build-essential clang libdbus-1-dev libgtk2.0-dev libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib curl gperf bison
```

Install electron-prebuilt deps: [source](https://github.com/electron-userland/electron-prebuilt/issues/92#issuecomment-181895095)
```
sudo apt-get install build-essential clang libdbus-1-dev libgtk2.0-dev libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib curl gperf bison
```

Install xvfb:
```
sudo apt-get install -y libgtk2.0-0 libnotify-bin libgconf-2-4 libnss3 xvfb
```

then `HEADLESS=true hyperfeed-server <CONFIG> --webrtc`

## License

The MIT License.
