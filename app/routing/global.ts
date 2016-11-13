/// <reference path="../../typings/index.d.ts" />

import * as path from "path";

const middleware = require(path.join(__dirname,"../","core/middleware.js"));
const router = module.exports = require('koa-router')();

router.post('/creategame', function *(next) {
    const gameName: string = this.request.body.formData.gameName;
    const password: string = this.request.body.formData.password;
    if(!this.session.user.ingame) {
        const game = {
            name: gameName,
            pwd: password || "",
            lock: password ? true : false,
            player: []
        }
        game.player.push(this.session.user.login);
        const data = yield this.db.table('game').insert(game).run(this.conn);
        if(data.inserted == 1) {
            this.session.user.gamekey = data.generated_keys[0];
            this.session.user.ingame = true;
            this.body = {
                errCode: 1
            }
        }
        else {
            this.body = {
                errCode: 0,
                errorMessage: "Unknow error!"
            }
        }
    }
    else {
        this.body = {
            errCode: 0,
            errorMessage: "Already in game!"
        }
    }
});

router.get('/leavegame', middleware.inGame, function *(next) {
    this.session.user.gamekey = null;
    this.session.user.ingame = false;
    this.redirect('/main/lobby');
});

router.post('/finishgame', middleware.inGame, function *(next) {

});

router.get('/main/game', middleware.inGame, function *(next) {
    console.log(this.session.user.gamekey);
    this.render("game",{gamekey: this.session.user.gamekey });
});

router.get('/main/lobby', middleware.connected, function *(next) {
    this.io.use( (socket, next) => {
        socket.session = this.session.user;
        next();
    });
    this.render("lobby",this.session.user);
});

router.get('/main/authentification', middleware.notConnected, function *(next) {
    this.render("auth");
});

router.get('/', function *(next) {
    this.render("layout");
});
