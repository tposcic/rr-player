class App {
    constructor() {
        this.options = reader.settings.options;
        this.currentTrack = null;
        this.currentTrackPath = null;
        this.player = null;
        this.seeker = null;
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.timerDisplay = null;
        this.currentTrackMetadata = {};

        document.addEventListener("DOMContentLoaded", () => {
            this.initPlayer();
            this.generateFavoritesList();
        });

        document.addEventListener("metadataChange", () => {
            this.showMetadata();
            this.favoriteStatusDisplay();
            if (this.options.notifications) {
                this.showNotification(a);
            }
        });
    }
    /**
     * Initialize the player
     */
    initPlayer() {
        let a = this;
        a.player = document.getElementById('player');
        a.setDefaults();
        a.seeker = document.getElementById('seeker');
        a.timerDisplay = document.getElementById('timerDisplay');

        a.player.addEventListener('ended', function () {
            if (a.options.autoplay) {
                if (a.options.replay) {
                    a.play(a.currentTrack);
                } else {
                    a.playRandom();
                }
            }
        }, true);

        a.player.ontimeupdate = function () {
            if (!isNaN(a.player.currentTime) && !isNaN(a.player.duration)) {
                a.seeker.value = a.player.currentTime / a.player.duration;
                a.timerDisplay.innerHTML = a.toHHMMSS(a.player.currentTime) + ' / ' + a.toHHMMSS(a.player.duration);
                //win.setProgressBar(a.seeker.value);
            } else {
                a.seeker.value = 0;
                a.timerDisplay.innerHTML = '00:00 / 00:00';
                //win.setProgressBar(0);
            }
        }
        a.seeker.onclick = function (e) {
            a.player.currentTime = ((e.pageX - this.offsetLeft) * this.max / this.offsetWidth) * a.player.duration;
        }
    }

    setDefaults() {
        this.options.autoplay = JSON.parse(localStorage.getItem('autoplay')) || true;//not working yet, fix pls
        document.getElementById('autoplayToggle').checked = this.options.autoplay;//not working yet, fix pls
        //this.replay = input.checked;
        this.player.volume = localStorage.getItem('volume') || '0.5';
        document.getElementById('volumeRange').value = this.player.volume;

    }

    /**
     * Request a track by path
     * @param {String} track 
     */
    request(track) {
        let a = this;
        this.currentTrackPath = track;

        fetch(track).then(res => res.blob()).then(blob => {
            window.jsmediatags.read(blob, {
                onSuccess: function (tag) {
                    let event = new Event('metadataChange');
                    a.currentTrackMetadata = tag;
                    document.dispatchEvent(event);
                },
                onError: function (error) {
                    let event = new Event('metadataChange');
                    a.currentTrackMetadata = { tags: { title: 'Not found', album: 'Dunno', artist: 'Mr. Unknown' } };
                    document.dispatchEvent(event);
                    console.warn(error);
                }
            });
            a.currentTrack = blob;
            a.play(blob);
        });
    }

    /**
     * Show current track metadata
     */
    showMetadata() {
        document.getElementById('trackInfo').innerHTML =
            '<h3 class="trackMetaSnippet artistTitle"><span>' + this.currentTrackMetadata.tags.artist + '</span></h3>' +
            '<h3 class="trackMetaSnippet trackTitle"><span>' + this.currentTrackMetadata.tags.title + '</span></h3>' +
            '<h3 class="trackMetaSnippet albumTitle"><span>' + this.currentTrackMetadata.tags.album + '</span></h3>';
    }

    favoriteStatusDisplay() {
        if(this.checkIfFavorite()){
            document.getElementById('favoriteControl').classList.add('active');
        } else {
            document.getElementById('favoriteControl').classList.remove('active');
        }
    }

    /**
     * Show notification of the current track playing
     * @param {App} a 
     */
    showNotification(a) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        } else {
            let notification = new Notification('Now playing', {
                icon: './assets/img/notification_button.png',
                body: a.currentTrackMetadata.tags.artist + ' - ' + a.currentTrackMetadata.tags.title,
                requireInteraction: false
            });

            notification.onclick = function (event) {
                event.preventDefault();
                a.playRandom();
                notification.close();
            }

            setTimeout(function () {
                notification.close();
            }, 5000);
        }
    }

    /**
     * Startup the random player
     */
    playRandom() {
        let track = reader.random();
        this.request(track);
    }

    /**
     * Play a preselected track
     */
    playSelected(track) {
        this.request(track);
    }

    /**
     * Play a track
     * @param {*} track 
     */
    play(track) {
        let player = document.getElementById('player');
        player.src = window.URL.createObjectURL(track);
        player.play();
    }

    /**
     * Console log a message
     * @param {*} message 
     */
    log(message) {
        console.log(message);
    }

    /**
     * Toggle autoplaying
     * @param {HTMLElement} input 
     */
    toggleAutoplay(input) {
        this.options.autoplay = input.checked;
        localStorage.setItem('autoplay', input.checked);
    }
    /**
     * Toggle replaying of the current track
     * @param {HTMLElement} input 
     */
    toggleReplay(input) {
        this.options.replay = input.checked;
        localStorage.setItem('replay', input.checked);
    }

    /**
     * Toggle a favorite track from the favorite list
     */
    toggleFavorite(){
        let track = {
            path: this.currentTrackPath,
            artist: this.currentTrackMetadata.tags.artist,
            title: this.currentTrackMetadata.tags.title,
            album: this.currentTrackMetadata.tags.album
        }

        let existingIndex = this.checkIfFavorite();

        if(existingIndex){
            this.favorites.splice(existingIndex, 1);
        } else {
            this.favorites.push(track);
        }

        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.favoriteStatusDisplay();
        this.generateFavoritesList();
    }

    /**
     * Toggle a list of favorite tracks
     */
    toggleFavoriteList() {
        let favoritesList = document.getElementById('favoritesList');
        favoritesList.classList.toggle('active');
    }

    /**
     * Generate the list of favorite tracks
     */
    generateFavoritesList(element = false){
        element = !element ? document.getElementById('favoritesList') : element;

        let favoritesElements = element.getElementsByClassName('favoriteElement');

        //we have to remove the previous click handlers
        for(let i = 0; i<favoritesElements.length; i++){
            favoritesElements[i].onclick = '';
        }

        let html = '<ul>';

        this.favorites.forEach(element => {
            html += "<li data-path='"+element.path+"' class='favoriteElement'>"+element.title+"</li>";
        });

        html += '</ul>';

        element.innerHTML = html;
        favoritesElements = element.getElementsByClassName('favoriteElement');

        //add the new click handlers
        for(let i = 0; i<favoritesElements.length; i++){
            favoritesElements[i].onclick = () => {
                this.playSelected(favoritesElements[i].dataset.path);
                element.classList.remove('active');
            };
        }
    }

    /**
     * Check if a track exists in the favorites list
     * if yes returns index
     * if no returns false
     * @param {Array} track 
     */
    checkIfFavorite(track = null){
        let currentTrack;
        if(track === null){
            currentTrack = {
                path: this.currentTrackPath,
                artist: this.currentTrackMetadata.tags.artist,
                title: this.currentTrackMetadata.tags.title,
                album: this.currentTrackMetadata.tags.album
            }
        } else {
            currentTrack = track;
        }

        var index = this.favorites.findIndex(fav => {
            return fav.artist === currentTrack.artist && fav.title == currentTrack.title && fav.album == currentTrack.album ? true : false;
        });
        
        return index === -1 ? false : index;
    }

    /**
     * Change the volume of the player
     * @param {HTMLElement} input 
     */
    changeVolume(input) {
        let player = document.getElementById('player');
        player.volume = input.value;
        localStorage.setItem('volume', input.value);
    }
    /**
     * toggle player
     * @param {HTMLElement} element 
     */
    togglePlay(element) {
        let player = document.getElementById('player');
        if (player.paused) {
            player.play();
            element.innerHTML = '<i class="flaticon-pause"></i>';
        } else {
            player.pause();
            element.innerHTML = '<i class="flaticon-music-player-play"></i>';
        }
    }
    /**
     * Format seconds string to HHMMSS
     * @param {String} time 
     */
    toHHMMSS(time) {
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours > 0) {
            if (hours < 10) { hours = "0" + hours + ':'; }
        } else {
            hours = '';
        }

        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return hours + minutes + ':' + seconds;
    }
}

const a = new App;
const remote = require('electron').remote
//const win = remote.BrowserWindow;

const startText = [
    "My body is ready", "Just click it!", "Are you oiled up properly?", "Just do it!",
    "Clickity click", "The hills are alive with the sound of...", "Why do i have to click this?"
];

document.addEventListener("DOMContentLoaded", function () {
    // this whole start button thing needs to go
    // add this to main process -> app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required')
    // remove the entire start button thing after
    // let startButton = document.getElementById('start');
    // startButton.onclick = function () {
    //     a.playRandom();
    //     //remove the start button once clicked
    //     let wrapper = this.parentNode;
    //     wrapper.parentNode.removeChild(wrapper);
    // };
    // set random text on the start button
    //startButton.innerHTML = startText[Math.floor(Math.random() * startText.length)];

    document.getElementById('random').onclick = function () {
        a.playRandom();
    };
    document.getElementById('closeAppButton').onclick = function () {
        let w = remote.getCurrentWindow()
        w.close()
    };
    document.getElementById('minimizeAppButton').onclick = function () {
        let w = remote.getCurrentWindow()
        w.minimize()
    };
    document.getElementById('playToggle').onclick = function () {
        a.togglePlay(this);
    };
    document.getElementById('favoriteControl').onclick = function () {
        a.toggleFavorite(this);
    };
    document.getElementById('favoriteControl').oncontextmenu = function () {
        a.toggleFavoriteList(this);
    };
    document.getElementById('autoplayToggle').onchange = function () {
        a.toggleAutoplay(this);
    };
    document.getElementById('replayToggle').onchange = function () {
        a.toggleReplay(this);
    };
    document.getElementById('volumeRange').onchange = function () {
        a.changeVolume(this);
    };
});
