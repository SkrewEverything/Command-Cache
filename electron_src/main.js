const { app, BrowserWindow, Tray, ipcMain, shell } = require('electron')
const { execFileSync } = require('child_process');
const path = require('path');
const appEnv = require('./env.json');
require('./ipcMethods');
const os = require('os');
const fs = require('fs');


/*
trayWindow: startupFuntion() -> app.on('ready') -> createTrayWindow() -> {window is hidden}

tray: startupFunction() -> app.on('ready') -> createTray() -> {icon is placed, trayWindow is hidden}
        -> tray.on('click') -> toggleTrayWindow() -> [ trayWindow.hide() ->{window is hidden} or showTrayWindow() -> getTrayWindowPosition() -> {window is shown} ]

settingsWindow: initIPCListeners() -> ipcMain.on('settings) -> [{if window is present} -> settingsWindow.show() or createSettingsWindow() -> {window is shown}]

*/

initIPCListeners();
startupFunction();


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let trayWindow
let tray
let settingsWindow

function createTrayWindow() {
    // Create the browser window.
    trayWindow = new BrowserWindow({
        width: 500, height: 500,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        icon: __dirname + '/images/appIcon/icon.png',
    })

    // It will be available on all the desktops
    trayWindow.setVisibleOnAllWorkspaces(true);

    // If the chrome dev tools are open for trayWindow, then don't hide the window on blur
    trayWindow.on('blur', () => {
        if (!trayWindow.webContents.isDevToolsOpened()) {
            trayWindow.hide();
        }
    });

    if (appEnv.env == 'prod') {
        // and load the index.html of the app.
        trayWindow.loadFile('./react_bin/TrayView/index.html')
    }
    else {
        // Point to dev server URL
        trayWindow.loadURL('http://localhost:3000/TrayView')
        // Open chrome dev tools
        trayWindow.webContents.openDevTools()
    }

}

function createTray() {
    tray = new Tray(path.join(__dirname, '/images/trayIcon/trayicon.png'));
    tray.on('click', function (event) {
        toggleTrayWindow();
    });
}

function toggleTrayWindow() {
    trayWindow.isVisible() ? trayWindow.hide() : showTrayWindow();
}

function showTrayWindow() {
    const position = getTrayWindowPosition();
    trayWindow.setPosition(position.x, position.y, false);
    trayWindow.show();
}

const getTrayWindowPosition = () => {
    const windowBounds = trayWindow.getBounds();
    const trayBounds = tray.getBounds();

    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)
    return { x: x, y: y }
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 600,
        height: 600,
        backgroundColor: '#282828',
        fullscreenable: false,
        resizable: false,
        icon: __dirname + '/images/appIcon/icon.png',
    });


    if (appEnv.env == 'prod') {
        // and load the index.html of the app.
        settingsWindow.loadFile('./react_bin/SettingsView/index.html');
    }
    else {
        // Point to dev server URL
        settingsWindow.loadURL('http://localhost:3000/SettingsView');
        // Open chrome dev tools
        settingsWindow.webContents.openDevTools();
    }

    settingsWindow.show();

    // If external web links are clicked in settings window, the page is opened in Browser
    settingsWindow.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    })

    settingsWindow.on('close', () => settingsWindow = null);
}

function initIPCListeners() {

    // To open settings window when the button is pressed
    ipcMain.on('settings', (event, data) => {
        if (settingsWindow == null) {
            createSettingsWindow();
        }
        else {
            settingsWindow.show();
        }
    });

    // Quits the app
    ipcMain.on('quit', (event, data) => {
        app.quit();
    });


    // Whenever start up setting is changed by user in settings window, the app should update its setting
    ipcMain.on('request-startup-at-login-changed', (event, data) => {
        app.setLoginItemSettings({
            openAtLogin: data,
        });
    });

}

function startupFunction() {

    // Check if all the files, directory and .bashrc is updated
    let createFilesScript = path.join(__dirname, 'scripts/createFiles.sh');
    execFileSync(createFilesScript);


    let settingsFilePath = os.homedir + '/.command_cache/settings';
    fs.readFile(settingsFilePath, 'utf8', (error, fileData) => {
        if (error) {
            if (error.code === 'ENOENT') {
                app.setLoginItemSettings({
                    openAtLogin: true,
                });
            }
            else {
                console.log(error);
            }
        }
        else {
            app.setLoginItemSettings({
                openAtLogin: JSON.parse(fileData).startAtLogin,
            });
        }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
        createTrayWindow();
        createTray();

        if (appEnv.env == 'dev') {
            // React Dev Tools
            const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
            installExtension(REACT_DEVELOPER_TOOLS)
                .then((name) => console.log(`Added Extension:  ${name}`))
                .catch((err) => console.log('An error occurred: ', err));
        }
    });

    if (process.platform == 'darwin') {
        // Hide the icon in the doc
        app.dock.hide();
    }
    
}