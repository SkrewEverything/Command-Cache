const { ipcMain, clipboard } = require('electron')
const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Copies the command to clipboard
ipcMain.on('copy-to-clipboard', (event, data) => {
    //console.log('copy to clipboard: ', data);
    clipboard.writeText(data);
});
  
// Executes the command in the Terminal
ipcMain.on('execute-command', (event, data) => {

    try {
        // macOS
        if (process.platform == 'darwin') {
            let executeScriptPath = path.join(__dirname, 'scripts/executeLinux.sh');
            let dir = `\\"${data.dir}\\"`
            let command = `\\"${data.command}\\"`
            console.log(dir);
            let ch = spawn('bash', ['-c', `osascript -e 'tell application "Terminal" to do script "cd ${dir};${command}"'`], { detached: true });
            ch.unref();
        }
        // Linux
        else if (process.platform == 'linux') {
            let executeScriptPath = path.join(__dirname, '/scripts/executeLinux.sh');
            let dir = `\\"${data.dir}\\"`
            let command = `\\"${data.command}\\"`
            let ch = spawn('bash', ['-c', `x-terminal-emulator -e "cd ${dir};${command};$SHELL"`], { detached: true });
            ch.unref();
        }
        else {
            console.log("Platform is not supported!");
        }
    }
    catch (e) {
        console.log(e);
        event.sender.send('error-log', e);
    }
    

    /* // Can be used for logging
    ch.stderr.on('data', (data) => {
        console.log(`Execute: stderr: ${data}`);
    });

    ch.on('close', (code) => {
        console.log(`Execute: child process exited with code ${code}`);
    });
    */

})
  
// Request to send recent history of the history from FileSystem
ipcMain.on('request-recent-data', (event, data) => {
    let timeScript = historyScripts(path.join(__dirname,'scripts/getTime.sh'));
    let dirScript = historyScripts(path.join(__dirname,'scripts/getDir.sh'));
    let commandScript = historyScripts(path.join(__dirname,'scripts/getCommand.sh'));
    let historyResult = Promise.all([timeScript, dirScript, commandScript]);

    historyResult.then(data => {
        if (!((data[0].length == data[1].length) && (data[0].length == data[1].length))) {
            console.log('There is a serious problem! Files have different length!');
        }
        
        compareSavedData(data, 'recent').then(sendData => {
            event.sender.send('response-recent-data', sendData);
        }).catch(error => { console.log(error);  event.sender.send('error-log', error);});
        
    }).catch(error => { console.log(error);  event.sender.send('error-log', error);});
})

// Request to send history sorted and counted from FileSystem
ipcMain.on('request-most-data', (event, data) => {
    let historyResult = historyScripts(path.join(__dirname,'scripts/getMostUsed.sh'));
    historyResult.then(data => {
        compareSavedData(data, 'most').then(sendData => {
            event.sender.send('response-most-data', sendData);
        }).catch(error => { console.log(error);  event.sender.send('error-log', error);});
      
    }).catch(error => { console.log(error);  event.sender.send('error-log', error);});
})

// Request to send saved history data by user from FileSystem
ipcMain.on('request-saved-data', (event, data) => {
    let savedFilePath = os.homedir() + '/.command_cache/bash_history_saved';
    readSavedData(savedFilePath).then(data => event.sender.send('response-saved-data', data.data))
        .catch(error => { console.log(error);  event.sender.send('error-log', error);});
    
});

// Request to update the newly saved command along with other saved history data on FileSystem
ipcMain.on('update-save-data', (event, data) => {
    let savedFilePath = os.homedir() + '/.command_cache/bash_history_saved';
    let duplicate = false;
    readSavedData(savedFilePath).then(readData => {
        if (data.id) {
            for (let i = 0; i < readData.data.length; i++) {
                if (readData.data[i].id == data.id) {
                    readData.data.splice(i, 1);
                    break;
                }
            }
        }
        else {
            duplicate = false;
            for (let i = 0; i < readData.data.length; i++){
                if (data.command == readData.data[i].command && data.dir == readData.data[i].dir) {
                    duplicate = true;
                    break;
                }
            }
            if (!duplicate) {
                readData.data.push({id: readData.nextID, command: data.command, dir: data.dir});
                readData.nextID++;
                
            }
            
        }

        if (!duplicate) {
            event.sender.send('response-update-save-data', "");
            writeSavedData(savedFilePath, readData).then().catch(error => console.log(error));
        }
        
    })
            
});

// Request to send versions of electron, node, chrome
ipcMain.on('request-versions', (event, data) => {
    let versions = {};
    versions.nodejs = process.versions.node;
    versions.chrome = process.versions.chrome;
    versions.electron = process.versions.electron;
    event.sender.send('response-versions', versions);
})

// Request to send the sartup at login status saved as settings in FileSystem
ipcMain.on('request-startup-at-login-status', (event, data) => {
    let sendData = {startAtLogin: true};
    let filePath = os.homedir + '/.command_cache/settings';
    fs.readFile(filePath, 'utf8', (error, fileData) => {
        if (error) {
            if (error.code === 'ENOENT') {
                sendData = JSON.stringify(sendData)
                fs.writeFile(filePath, sendData, 'utf8', (error) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        //console.log("Settings file created!");
                    }
                });
            }
        }
        else {
            try {
                sendData = JSON.parse(fileData);
            }
            catch (e) {
                console.log("Something went wrong while reading settings file and parsing! ", fileData);
            }
        }

        event.sender.send('response-startup-at-login-status', sendData.startAtLogin);
    });
});

// Request to update the new startup at login status when changed by user
ipcMain.on('request-startup-at-login-changed', (event, data) => {
    let sendData = { startAtLogin: data };
    sendData = JSON.stringify(sendData)
    let filePath = os.homedir + '/.command_cache/settings';

    fs.writeFile(filePath, sendData, 'utf8', (error) => {
        if (error) {
            console.log(error);
            event.sender.send('response-startup-at-login-changed', !data);
        }
        else {
            //console.log("Settings file created!");
            event.sender.send('response-startup-at-login-changed', data);
        }
    });
});

// Executes scripts for recent and most data. Can execute any script. Splits output line by line and returns
function historyScripts(scriptPath) {
    return new Promise(function (resolve, reject) {
        execFile(scriptPath, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            }
            let arr = stdout.split('\n');
            resolve(arr);
        });
    });
}

// Reads saved data from file. If the file is absent, returns default json file structure
function readSavedData(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    //console.error('Saved file does not exist');
                    resolve({nextID: 1, data: []});
                }
                else {
                    reject(error);
                }
            }
            else {
                if (data.length > 2) {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (e) {
                        console.log("Something went wrong while reading save file and parsing! ", data);
                    }
                    
                }
                
                else {
                    resolve({nextID: 1, data: []});
                }

            }
        })
    });
}

// Writes saved data to file. Can write any JSON file to FileSystem
function writeSavedData(filePath, data) {
    return new Promise((resolve, reject) => {
        let json = JSON.stringify(data);
        fs.writeFile(filePath, json, 'utf8', (error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve("Saved Successfully!");
            }
        });
    });
}

// Used to compare Recent and Most data with saved commands file
function compareSavedData(data, category) {

    let savedFilePath = os.homedir() + '/.command_cache/bash_history_saved';

    if (category == 'recent') {
        let newData = [];
        return new Promise((resolve, reject) => {
            readSavedData(savedFilePath).then(savedData => {
                
                outer:for (let i = 0; i < data[0].length-1; i++){
                    for (let j = 0; j < savedData.data.length; j++){
                        if (savedData.data[j].command == data[2][i] && savedData.data[j].dir == data[1][i]) {
                            newData.push({ time: data[0][i], dir: data[1][i], command: data[2][i], id: savedData.data[j].id });
                            continue outer;
                        }
                    }
                    newData.push({ time: data[0][i], dir: data[1][i], command: data[2][i] });
                }
                resolve(newData.reverse());
                
            }).catch(error => {
                for (let i = 0; i < data[0].length-1; i++){
                    newData.push({ time: data[0][i], dir: data[1][i], command: data[2][i] });
                }
                resolve(newData.reverse());
                console.log("Error while reading saved data in request-recent-data");
            })
        });
    }

    else if (category == 'most') {
        var myRegex = /\s+(\d+)\s(.+)\s\*\$##\$\*\s(.+)/g;
        let newData = [];
        return new Promise((resolve, reject) => {
            readSavedData(savedFilePath).then(savedData => {
                
                outer: for (let i = 0; i < data.length-1; i++){
                    let match = myRegex.exec(data[i]);
                    myRegex.lastIndex = 0;
                    for (let j = 0; j < savedData.data.length; j++){
                        if (savedData.data[j].command == match[3] && savedData.data[j].dir == match[2]) {
                            newData.push({ count: match[1], dir: match[2], command: match[3], id: savedData.data[j].id });
                            continue outer;
                        }
                    }
                    newData.push({ count: match[1], dir: match[2], command: match[3] });
                }
                resolve(newData.reverse());
                
            }).catch(error => {
                for (let i = 0; i < data.length-1; i++) {
                    let match = myRegex.exec(data[i]);
                    myRegex.lastIndex = 0;

                    newData.push({ count: match[1], dir: match[2], command: match[3] });
                }

                resolve(newData.reverse());
                console.log("Error while reading saved data in request-most-data");
            })
        });
    }

}

