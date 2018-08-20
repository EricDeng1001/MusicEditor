const fs = require('fs');

try {
  if (!fs.statSync('files').isDirectory()) {
    fs.unlinkSync('files');
    fs.mkdirSync('files');
  }
} catch(e) {
  fs.mkdirSync('files');
}

fs.readdir('node_modules', (err, fontdirs) => {
  for (let fontdir of fontdirs) {
    fs.copyFileSync(`node_modules/${fontdir}/index.css`, `${fontdir}.less`);
    fs.readdir(`node_modules/${fontdir}/files`, (err, fonts) => {
      for (let font of fonts) {
        fs.copyFileSync(`node_modules/${fontdir}/files/${font}`, `files/${font}`);
      }
      deleteDir(`node_modules/${fontdir}`);
    })
  }
});

function deleteDir(path) {
  const files = fs.readdirSync(path);
  for (let file of files) {
    let stat = fs.statSync(`${path}/${file}`);
    if (stat.isDirectory()) {
      deleteDir(`${path}/${file}`);
    } else {
      fs.unlinkSync(`${path}/${file}`);
    }
  }
  fs.rmdirSync(path);
}
