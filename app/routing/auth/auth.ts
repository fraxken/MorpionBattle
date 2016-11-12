/// <reference path="../../../typings/index.d.ts" />

import * as path from "path";
import {toSHA256} from "../../core/utils";
const middleware    = require(path.join(__dirname,"../../","core/middleware.js"));

const router = module.exports = require('koa-router')({
    prefix : "/authentification"
});

router.post('/login', function *(next) {
    console.log(this.request.body);
});

router.post('/register', function *(next) {
    console.log(this.request.body);
});

router.get('/logout', middleware.connected, function *(next) {
    this.session = null;
    this.redirect("/main/authentification");
});
