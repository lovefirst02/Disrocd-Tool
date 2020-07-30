export default function saveJson(data) {
  const { remote } = window.require('electron');
  const isDev = remote.require('electron-is-dev');
  const fs = remote.require('fs');
  const path = remote.require('path');
  console.log(remote.app.getAppPath());
  const source = isDev
    ? `${path.join(remote.app.getAppPath(), '/Config.json')}`
    : `${path.join(remote.app.getAppPath(), '../Config.json')}`;
  const source2 = `${(path.join(__dirname), 'Config.json')}`;
  console.log(source2);
  fs.writeFile(source, data, (err) => {
    if (err) {
      throw err;
    } else {
      return 'Sucess';
    }
  });
}
