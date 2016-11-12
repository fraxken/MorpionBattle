/// <reference path="../../typings/index.d.ts" />

import * as path from "path";

const router = module.exports = require('koa-router')({
    prefix : "/popups"
});

router.get('/creategame', function *(next) {
    this.render('popups/creategame');
});

router.get('/password', function *(next) {
    this.render('popups/password');
});
