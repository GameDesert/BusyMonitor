const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 500,
    height: 450,
    autoHideMenuBar: true
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})