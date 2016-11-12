/// <reference path="../../typings/index.d.ts" />

import * as path from "path";

const middleware = require(path.join(__dirname,"../","core/middleware.js"));
const router = module.exports = require('koa-router')();

router.get('/main/lobby', function *(next) {
    this.render("lobby");
});

router.get('/main/authentification', middleware.notConnected, function *(next) {
    this.render("auth");
});

router.get('/', function *(next) {
    this.render("layout");
});
