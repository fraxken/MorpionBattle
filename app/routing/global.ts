/// <reference path="../../typings/index.d.ts" />

import * as path from "path";

const middleware = require(path.join(__dirname,"../","core/middleware.js"));
const router = module.exports = require('koa-router')();


router.get('/main/game', function *(next) {
    this.render("game");
});

router.get('/main/lobby', middleware.connected, function *(next) {
    this.render("lobby",this.session.user);
});

router.get('/main/authentification', middleware.notConnected, function *(next) {
    this.render("auth");
});

router.get('/', function *(next) {
    this.render("layout");
});
