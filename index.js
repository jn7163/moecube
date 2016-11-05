'use strict';

const {ipcMain, app, BrowserWindow} = require('electron');
const {autoUpdater} = require("electron-auto-updater");
const child_process = require('child_process');
const path = require('path');

if (process.platform == 'darwin') {
    try {
        autoUpdater.setFeedURL("https://wudizhanche.mycard.moe/update");
    } catch (err) {
    }
}

autoUpdater.on('error', (event)=>console.log('error', event));
autoUpdater.on('checking-for-update', (event)=>console.log('checking-for-update'));
autoUpdater.on('update-available', (event)=>console.log('update-available'));
autoUpdater.on('update-not-available', (event)=>console.log('update-not-available'));

let updateWindow;
autoUpdater.on('update-downloaded', (event)=> {
    updateWindow = new BrowserWindow({
        width: 640,
        height: 480,
    });

    updateWindow.loadURL(`file://${__dirname}/update.html`);

    updateWindow.on('closed', function () {
        updateWindow = null
    });

    ipcMain.on('update', (event, arg) => {
        autoUpdater.quitAndInstall()
    })
});

function handleElevate() {
    if (process.argv[1] == '-e') {
        app.dock.hide();
        const os = require('os');
        const readline = require('readline');
        process.send = (message, sendHandle, options, callback)=> process.stdout.write(JSON.stringify(message) + os.EOL, callback);
        process.stdin.on('end', ()=> process.emit('disconnect'));
        readline.createInterface({input: process.stdin}).on('line', (line) => process.emit('message', JSON.parse(line)));
        require("./" + process.argv[2]);
        return true;
    }
}

if (handleElevate()) {
    return;
}

function createAria2c() {
    let aria2c_path;
    switch (process.platform) {
        case 'win32':
            aria2c_path = path.join(process.resourcesPath, 'bin', 'aria2c.exe');
            break;
        case 'darwin':
            aria2c_path = path.join(process.resourcesPath, 'bin', 'aria2c');
            break;
        default:
            throw 'unsupported platform';
    }
    return child_process.spawn(aria2c_path, ['--enable-rpc', '--rpc-allow-origin-all', "--continue", "--split=10", "--min-split-size=1M", "--max-connection-per-server=10"], {stdio: 'ignore'});
}

const aria2c = createAria2c();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 640,
        frame: process.platform == 'darwin',
        titleBarStyle: process.platform == 'darwin' ? 'hidden' : null
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
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
app.on('ready', ()=> {
    autoUpdater.checkForUpdates();
    createWindow()
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit()
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('quit', ()=> {
    // windows 在非 detach 模式下会自动退出子进程
    if (process.platform != 'win32') {
        aria2c.kill()
    }
});