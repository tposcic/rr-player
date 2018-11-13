// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      width: 400, 
      height: 600, 
      frame: false,
      minHeight: 600,
      minWidth: 400
    }
  )

  // and load the index.html of the app.
  mainWindow.loadFile('app/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Setup the menu
  // var menu = Menu.buildFromTemplate([
  //   {
  //     label: 'Menu',
  //     submenu: [
  //         {
  //           label:'Options',
  //           click() { 
  //             let settings = new BrowserWindow({width: 500, height: 600, parent: mainWindow, modal: true, show: false })
  //             settings.setMenu(null);
  //             settings.loadFile('app/settings.html')
  //             settings.once('ready-to-show', () => {
  //               settings.show()
  //             })
  //           } 
  //         },
  //         {
  //           label:'Open magic tools',
  //           click() { 
  //             mainWindow.webContents.openDevTools()
  //           } 
  //         },
  //         {
  //           label:'Exit',
  //           click() { 
  //             app.quit() 
  //           } 
  //         }
  //     ]
  //   }
  // ])

  // Menu.setApplicationMenu(menu); 
  //mainWindow.setMenu(null);

  // Emitted when the window is closed.
  //mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
