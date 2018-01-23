'use strict';

const s3o = require('@financial-times/s3o-middleware');
var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var path = require('path');
var routeHandler = require('./src/routeHandler');
var compression = require('compression');

var PORT = process.env.PORT || 8000;

var app = express();

app.set('port', (process.env.PORT || 8000));
app.set('view engine', 'html');
app.set('trust proxy', true)
app.set('s3o-cookie-ttl', 28800000); // 8 hours

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.protocol === 'http') {
    res.redirect(301, 'https://' + req.hostname)
  }
  next()
})

app.use(s3o);

app.use('/dist', compression(), express.static('dist'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.listen(app.get('port'), function() {
  console.log('Vault UI is running on port', app.get('port'));
});

app.get('/vaultui', function(req,res) {
    routeHandler.vaultuiHello(req, res);
});

app.all('/v1/*', function(req, res) {
    routeHandler.vaultapi(req, res);
})

app.get('/');

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.web.html'));
});
