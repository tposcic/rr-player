# rr-player

![Player screenshot](https://raw.githubusercontent.com/tposcic/rr-player/master/app/assets/img/rr-player.jpg)

**Audio player based on Electron**

Features:
* Random track playing from a preset folder (shuffle)

Will feature:
* Favorites
* Playlists
* Music library explorer
* Visualizer
* Song and author info from Wikipedia and other sources

**PHP script version**

The old abandoned version can be found [here](https://github.com/tposcic/randy_random) 

**Windows binaries**

Built Windows binaries are coming soon...

**Configuration**

base_folder in conf.json currently has to be set to an existing folder for the app to work

## To Use
```bash
# Clone this repository
git clone https://github.com/tposcic/rr-player.git
# Go into the repository
cd rr-player
# Install dependencies
npm install
# Run the app
npm start
## You can build the app for windows (requires electron-packager npm package)
electron-packager .