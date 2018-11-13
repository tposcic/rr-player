class App{
    constructor(){
        let a = this;
        this.options = reader.settings.options;
        this.currentTrack = null;
        this.player = null;
        this.seeker = null;
        this.timerDisplay = null;
        this.currentTrackMetadata = {};

        document.addEventListener("DOMContentLoaded", function(){
            a.initPlayer();
        });

        document.addEventListener("metadataChange", function(){
            a.showMetadata();
            if(a.options.notifications){
                a.showNotification(a);
            }
        });
    }
    /**
     * Initialize the player
     */
    initPlayer(){
        let a = this;
        a.player = document.getElementById('player');
        a.setDefaults();
        a.seeker = document.getElementById('seeker');
        a.timerDisplay = document.getElementById('timerDisplay');

        a.player.addEventListener('ended', function() {
            if(a.options.autoplay){
                if(a.options.replay){
                    a.play(a.currentTrack);
                } else {
                    a.playRandom();
                }
            }
        }, true);

        a.player.ontimeupdate = function(){
            if(!isNaN(a.player.currentTime) && !isNaN(a.player.duration)){
                a.seeker.value = a.player.currentTime/a.player.duration;
                a.timerDisplay.innerHTML = a.toHHMMSS(a.player.currentTime)+' / '+a.toHHMMSS(a.player.duration);
                // win.setProgressBar(a.seeker.value);
            } else {
                a.seeker.value = 0;
                a.timerDisplay.innerHTML = '00:00 / 00:00';
                // win.setProgressBar(0);
            }
        }
        a.seeker.onclick = function(e){
            a.player.currentTime = ((e.pageX - this.offsetLeft) * this.max / this.offsetWidth) * a.player.duration;
        }
    }
    setDefaults(){
        this.options.autoplay = JSON.parse(localStorage.getItem('autoplay')) || true;//not working yet, fix pls
        document.getElementById('autoplayToggle').checked = this.options.autoplay;//not working yet, fix pls
        //this.replay = input.checked;
        this.player.volume = localStorage.getItem('volume') || '0.5';
        document.getElementById('volumeRange').value = this.player.volume;

    }
    /**
     * Request a track
     * @param {*} sourceCallback 
     */
    request(){
        let a = this;

        let track = reader.random();

        fetch(track).then(res => res.blob()).then(blob => {
            window.jsmediatags.read(blob, {
                onSuccess: function(tag) {
                    let event = new Event('metadataChange');
                    a.currentTrackMetadata = tag;
                    document.dispatchEvent(event);
                },
                onError: function(error) {
                    let event = new Event('metadataChange');
                    a.currentTrackMetadata = {tags:{title:'Not found',album:'Dunno',artist:'Mr. Unknown'}};
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
    showMetadata(){
        document.getElementById('trackInfo').innerHTML = 
        '<h3 class="trackMetaSnippet artistTitle">'+this.currentTrackMetadata.tags.artist+'</h3>'+
        '<h3 class="trackMetaSnippet trackTitle">'+this.currentTrackMetadata.tags.title +'</h3>'+
        '<h3 class="trackMetaSnippet albumTitle">'+this.currentTrackMetadata.tags.album+'</h3>';
    }
    /**
     * Show notification of the current track playing
     * @param {App} a 
     */
    showNotification(a){
        if (Notification.permission !== "granted"){
            Notification.requestPermission();
        } else {
            let notification = new Notification('Now playing', {
                icon: './assets/img/notification_button.png',
                body: a.currentTrackMetadata.tags.artist+' - '+a.currentTrackMetadata.tags.title,
                requireInteraction: false
            });

            notification.onclick = function(event) {
                event.preventDefault();
                a.playRandom();
                notification.close();
            }

            setTimeout(function() {
                notification.close();
            }, 5000);
        }
    }
    /**
     * Startup the random player
     */
    playRandom(){
        this.request();
    }
    /**
     * Play a track
     * @param {*} track 
     */
    play(track){
        let player = document.getElementById('player');
        player.src = window.URL.createObjectURL(track);
        player.play();
    }
    /**
     * Console log a message
     * @param {*} message 
     */
    log(message){
        console.log(message);
    }
    /**
     * Toggle autoplaying
     * @param {HTMLElement} input 
     */
    toggleAutoplay(input){
        this.options.autoplay = input.checked;
        localStorage.setItem('autoplay', input.checked);
    }
    /**
     * Toggle replaying of the current track
     * @param {HTMLElement} input 
     */
    toggleReplay(input){
        this.options.replay = input.checked;
        localStorage.setItem('replay', input.checked);
    }
    /**
     * Change the volume of the player
     * @param {HTMLElement} input 
     */
    changeVolume(input){
        let player = document.getElementById('player');
        player.volume = input.value;
        localStorage.setItem('volume', input.value);
    }
    /**
     * toggle player
     * @param {HTMLElement} element 
     */
    togglePlay(element){
        let player = document.getElementById('player');
        if (player.paused){
            player.play();
            element.innerHTML = '&#10074;&#10074;';
        } else {
            player.pause();
            element.innerHTML = '&#9658;';
        }
    }
    /**
     * Format seconds string to HHMMSS
     * @param {String} time 
     */
    toHHMMSS(time) {
        var sec_num = parseInt(time, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if(hours > 0){
            if (hours   < 10) {hours   = "0"+hours+':';}
        } else {
            hours = '';
        }
        
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return hours+minutes+':'+seconds;
    }
}

const a = new App;
const remote = require('electron').remote
// const { BrowserWindow } = require('electron');
// const win = new BrowserWindow()

const startText = ["My body is ready", "Just click it!", "Are you oiled up properly?", "Just do it!", "Clickity click", "The hills are alive with the sound of..."];

// Bind click and change events
document.addEventListener("DOMContentLoaded", function(){
    let startButton = document.getElementById('start');

    startButton.onclick = function() {
        a.playRandom();
        //remove the start button once clicked
        let wrapper = this.parentNode;
        wrapper.parentNode.removeChild(wrapper);
    };
    // set random text on the start button
    startButton.innerHTML = startText[Math.floor(Math.random() * startText.length)];

    document.getElementById('random').onclick = function() {
        a.playRandom();
    };
    document.getElementById('closeAppButton').onclick = function() {
        let w = remote.getCurrentWindow()
        w.close()
    };
    document.getElementById('minimizeAppButton').onclick = function() {
        let w = remote.getCurrentWindow()
        w.minimize()
    };
    document.getElementById('playToggle').onclick = function() {
        a.togglePlay(this);
    };
    document.getElementById('autoplayToggle').onchange = function() {
        a.toggleAutoplay(this);
    }
    document.getElementById('replayToggle').onchange = function() {
        a.toggleReplay(this);
    }
    document.getElementById('volumeRange').onchange = function(){
        a.changeVolume(this);
    }
});
