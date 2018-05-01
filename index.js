const Koa = require('koa');
const axios = require('axios');
const fs = require('fs');
const shell = require('shelljs');
const dateFormat = require('dateformat');

const app = new Koa();

function formatDate() {
  return dateFormat(new Date(), 'yyyy-mm-dd_HH-MM-ss');
}

function beginLog() {
  fs.open('./static/data', 'wx', (error) => {
    if (error.code === 'EEXIST') {
      console.log('Directory already exists');
    } else {
      shell.mkdir('-p', './static/data');
    }

    writeDataToFile();
  });
}

function putDataToDB() {
  axios.put('http://localhost:9200/megacorp/employee/1', {
    "first_name" : "John",
    "last_name" :  "Smith",
    "age" :        25,
    "about" :      "I love to go rock climbing",
    "interests": [ "sports", "music" ]
  });
}

function writeDataToFile() {
  const filePath = `./static/data/log-${formatDate()}.json`;

  axios.get('http://localhost:9200/_search').then((data) => {
    fs.writeFile(filePath, JSON.stringify(data.data, null, 2), null, () => {
      console.log('File writing success!');
    });
  });
}

putDataToDB();
beginLog();

app.listen(8881);
console.log('Server is listening at localhost:8881');
