# Getting Started

It is a guide to how to setup a development environment for this project.

## Development Stack
This project is built using Electron, ReactJS and a bunch of shell scripts.

So, to work with this project, you have to have minimum knowledge about:
- Electron
- ReactJS
- Webpack and related plugins
- Shell Scripting (Currently using Bash shell)
- AppleScript (Optional)

## Setting up Environment

It requires **Node** and **npm** intially to develop this project. If it is not already installed in your machine, go ahead and install it first.


Clone or download the repo into your local machine. `cd` into the repo folder.

```sh
git clone https://github.com/SkrewEverything/Command-Cache.git
cd <repo_folder>
```

Install all the required packages for the project.

```sh
npm install
```

(Optional) To compile multi-platform binaries, install the packages according to the machine you are compiling:

[Multi Platform Build Packages List to Install](https://www.electron.build/multi-platform-build#macos)

## Development

This project supports **Hot Reloading** for developemnt.

### To start the server(Hot Reloading)



```sh
npm run start:server
```

### To start Electron app

```sh
npm run start
```

This should be enough to make the app working.

---

## To compile React files

If you don't prefer Hot Reloading, then the files can be compiled/transpiled and saved in `react_bin`

```sh
npm run build
```

Then you can start the electron app.

## To compile project to binary
Instead of HotReloading, if you want to build the app
```sh
npm run build && npm run pack
```

The compiled binary is placed in `dist`.

## Project Structure

`electron_src`: Has all the source files related to Electron.
`react_src`: Has all the source files related to ReactJS.
`dev`: HTML files required for Hot Reloading.
`react_bin`: Webpack compiled `react_src` files.

## Known Issues

`file-loader`doesn't work when the app is compiled/packaged. There is some issue with the URL it adds to the source files. Instead use `url-loader` as it directly embedes the images into the source files. Make sure the limit is high. (`file-loader`
works perfectly fine while using Hot Reloading). - [#712 in electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/712) repo.

---

While starting the app, you will probably get this warning. 
```
Electron *** WARNING: Textured window <AtomNSWindow: 0x7fe3687673e0> is getting an implicitly transparent titlebar. This will break when linking against newer SDKs. Use NSWindow's -titlebarAppearsTransparent=YES instead.
```
It is still not solved by the Electron Team - [#12814](https://github.com/electron/electron/issues/12814), [#11150](https://github.com/electron/electron/issues/11150)

---

Unlike macOS, Linux(at least on Ubuntu) doesn't support opening window when clicked on Tray Icon in the status bar. The user has to click on the app name in the drop-down list.

It is mentioned in [Electron Platform Limitations](https://electronjs.org/docs/api/tray)

*If any one tested with other Linux Distributions, update me. Also if anyone found a workaround on Ubuntu, let me know.*

---

Linux binaries(`.deb`, `.rpm`, etc) is not showing icons in the **Ubuntu Software** while installing and uninstalling. And also the name it shows there is without spaces.

*If any one found how to make `.deb` show icon and desired name in the **Ubuntu Software**, let me know.*

---

This is not an issue but just a remainder.

`child_process.spawn()` can't execute external scripts. So, whatever we want to execute, we have to provide it as a command. This is required to execute the commands by openeing new Terminal window.

More explanation about the issue in [Limitations of the Node API](https://electronjs.org/docs/tutorial/application-packaging#limitations-of-the-node-api)

---

## Disclaimer

Don't burn your house if the instructions are unclear. Open an [issue](https://github.com/SkrewEverything/Command-Cache/issues) to clarify.