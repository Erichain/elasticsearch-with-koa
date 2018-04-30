const Koa = require('koa');
const axios = require('axios');
const fs = require('fs');
const shell = require('shelljs');

const app = new Koa();

fs.open('./static/data', 'wx', (error, fd) => {
  if (error.code === 'EEXIST') {
    console.log('Directory already exists');
  } else {
    shell.mkdir('-p', './static/data');
  }

  writeDataToFile(fd);
});

function writeDataToFile(fd) {
  axios.get('http://localhost:9200').then((data) => {
    console.log(data.data);

    fs.writeFile(`./static/data/data-${new Date()}.json`, JSON.stringify(data.data, null, 2), null, () => {
      console.log('success');
    });
  });
}

app.listen(8881);
