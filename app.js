var express = require('express')
var config = require('./config')
var async = require('async')
var gpio = require('rpi-gpio')
var app = express()

function delayPinWrite (pin, value, callback) {
  setTimeout(function () {
    if (value === config.RELAY_ON) {
      turnOnPin(pin, callback)
    } else {
      turnOffPin(pin, callback)
    }
  }, config.RELAY_TIMEOUT)
}

function turnOnPin (pin, callback) {
  gpio.write(pin, config.RELAY_ON, callback)
}

function turnOffPin (pin, callback) {
  gpio.write(pin, config.RELAY_OFF, callback)
}

async.parallel([
  function (callback) {
    gpio.setup(config.LEFT_GARAGE_PIN, gpio.DIR_OUT, callback)
  },
  function (callback) {
    gpio.setup(config.RIGHT_GARAGE_PIN, gpio.DIR_OUT, callback)
  }
], function (err) {
  if (err) {
    console.error(err)

    process.exit(2)
  }

  console.log('Pins setup. Ready to roll.')
})

app.set('port', process.env.PORT || 3000)

app.use('/', express.static(__dirname + '/public'))

app.get('/api/ping', function (req, res) {
  res.json('pong')
})

app.post('/api/garage/left', function (req, res) {
  async.series([
    function (callback) {
      // Turn the relay on
      turnOnPin(config.LEFT_GARAGE_PIN, callback)
    },
    function (callback) {
      // Turn the relay off after delay to simulate button press
      delayPinWrite(config.LEFT_GARAGE_PIN, config.RELAY_OFF, callback)
    },
    function (err, results) {
      if (err) {
        console.error(err)
      }
    }
  ])
})

app.post('/api/garage/right', function (req, res) {
  async.series([
    function (callback) {
      // Turn the relay on
      turnOnPin(config.RIGHT_GARAGE_PIN, callback)
    },
    function (callback) {
      // Turn the relay off after delay to simulate button press
      delayPinWrite(config.RIGHT_GARAGE_PIN, config.RELAY_OFF, callback)
    },
    function (err, results) {
      if (err) {
        console.error(err)
      }
    }
  ])
})

app.listen(app.get('port'))

process.on('exit', () => {
  gpio.destroy()
})
