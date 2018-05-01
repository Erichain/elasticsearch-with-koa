const Koa = require('koa');
const axios = require('axios');
const fs = require('fs');
const shell = require('shelljs');
const dateFormat = require('dateformat');
const faker = require('faker');

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

function createData() {
  const requests = [];

  for (let i = 0; i < 10; i++) {
    const params = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      age: faker.random.number({
        min: 20,
        max: 50,
      }),
      jobType: faker.name.jobType(),
      jobDescriptor: faker.lorem.sentence(),
      interests: [faker.lorem.word(), faker.lorem.word()],
    };

    requests.push(axios.put(`http://localhost:9200/megacorp/employee/${i}`, params));
  }

  requests.push(
    axios.put('http://localhost:9200/megacorp/_mapping/employee', {
      employee: {
        properties: {
          jobType: {
            type: 'text',
            fielddata: true,
          },
        },
      },
    })
  );

  return Promise.all(requests);
}

function writeDataToFile() {
  const filePath = `./static/data/log-${formatDate()}.json`;
  const queryBody = {
    aggs: {
      all_job_types: {
        terms: {
          field: 'jobType'
        }
      },
    },
  };

  axios.get('http://localhost:9200/megacorp/employee/_search', {
    params: {
      source: JSON.stringify(queryBody),
      source_content_type: 'application/json',
    },
  }).then((data) => {
    console.log(JSON.stringify(data.data, null, 2))

    fs.writeFile(filePath, JSON.stringify(data.data, null, 2), null, () => {
      console.log('File writing success!');
    });
  });
}

// if there isn't any data, this function should be called once
// createData();

beginLog();

app.listen(8881);
console.log('Server is listening at localhost:8881');
