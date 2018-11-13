// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.reader = {
    fs : require('fs'),
    path: require('path'),
    http: require('http'),
    settings: {},
    init: function(){
        this.settings = JSON.parse(this.fs.readFileSync('conf.json', 'utf8'));
    },
    /**
     * Loop thru directories untill you hit the bottom, then pick a random file
     */
    random: function(){
        let self = this;
        let directories = this.getDirectories(this.settings.base_folder);
        let currentDirectory, track, tracks = null;

        while(directories.length != 0){
            currentDirectory = directories[Math.floor(Math.random()*directories.length)];

            directories = this.getDirectories(currentDirectory);
        }

        tracks = this.getFiles(currentDirectory);
        track = tracks[Math.floor(Math.random()*tracks.length)];
        
        //this is a recursion -> make sure it doesn't kill something
        if(track == undefined){
            console.error('track returned as undefined');
            console.warn(tracks);
            console.warn(currentDirectory);

            return this.random();
        }

        return "file:///"+track;
    },
    /**
     * Get directories list in a directory
     * @param {*} folder 
     */
    getDirectories: function(folder) {
        let self = this;

        let directories = this.fs.readdirSync(folder).filter(function (file) {
            if(self.fs.statSync(folder+'\\'+file).isDirectory() && !self.settings.ignore_folders.includes(file)){
                return true;
            }
        });

        directories = directories.map(function(e){
            return folder + '\\' + e;
        });

        return directories;
    },
    /**
     * Get files list in a directory
     * @param {*} folder 
     */
    getFiles: function(folder){
        let self = this;

        let files = this.fs.readdirSync(folder).filter(function (file) {
            if(!self.fs.statSync(folder+'\\'+file).isDirectory() && self.settings.formats.includes(self.path.extname(file))){
                return true;
            }
        });

        files = files.map(function(e){
            return folder + '\\' + e;
        });

        return files
    },
    getRandomFile: function(folder){

    }
}

window.reader.init();