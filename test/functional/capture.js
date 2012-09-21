#!/usr/bin/env casperjs
var casper = require('casper').create();

casper.start('http://localhost:8383', function() {
    console.log('loaded');
     this.captureSelector('graph.png', '#target');
});

casper.run();