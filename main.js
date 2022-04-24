const { app, ipcMain, BrowserWindow } = require('electron');

let mainWindow = null;
let willQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 150,
    height: 160,
    fullscreenable: false,
    resizable: true,
    frame: false,
    transparent: true,
  });
  mainWindow.setHasShadow(false);
  mainWindow.setAlwaysOnTop(true);
  mainWindow.loadURL(`file://${__dirname}/src/index.html`);

  ipcMain.on('windowFocusEvent', (event, focused) => {
    const [width] = mainWindow.getSize();
    const newHeight = focused ? 160 : 40;
    mainWindow.setSize(width, newHeight, true);
  });
}

app.on('ready', () => {
  createWindow();

  mainWindow.on('close', (e) => {
    if (willQuit) {
      mainWindow = null;
    } else {
      e.preventDefault();
      mainWindow.hide();
    }
  });
});

app.on('activate', () => mainWindow.show());
app.on('before-quit', () => {
  willQuit = true;
});
