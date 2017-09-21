const express = require('express');
const app = express();
const axios = require('axios');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const config = require('./config.js');

const getDataAndEmail = () => {
  axios.get('http://api.sportradar.us/nascar-ot3/mc/2017/standings/drivers.json?api_key=' + config.sportradarKey)
    .then(function (response) {
      const data = response.data;

      const topDrivers = data.drivers.filter(driver => {
        return driver.rank <= 15;
      })
        .sort((a, b) => {
          return a.avg_finish_position - b.avg_finish_position;
        })
        .map((driver, index) => {
          return 'Pick #' + (index + 1) + ':      ' + driver.full_name;
        })
        .join('\n');

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.fromEmail,
          pass: config.emailPass
        }
      });

      const mailOptions = {
        from: config.fromEmail,
        to: config.toEmail,
        subject: "This Weeks Racing Picks",
        text: topDrivers
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
      });

    })
    .catch(function (error) {
      console.log(error);
    });
};

getDataAndEmail();
// schedule.scheduleJob('49 * * * * *', getDataAndEmail);
// schedule.scheduleJob('* * 12 * * 5', getDataAndEmail);

app.listen('3333', () => {
  console.log('Listening on port 3000');
});