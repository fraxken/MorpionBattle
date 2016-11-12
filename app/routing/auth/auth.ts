/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../interfaces.d.ts" />

import * as path from "path";
import {toSHA256} from "../../core/utils";
const middleware    = require(path.join(__dirname,"../../","core/middleware.js"));

const router = module.exports = require('koa-router')({
    prefix : "/authentification"
});

router.post('/login', function *(next) {
    const login: string     = this.request.body.formData.login;
    const password: string  = this.request.body.formData.password;

    if(login !== "undefined" && password !== "undefined") {

        // TODO: Type check
        // TODO: Length check

        const cursor = yield this.db.table('users').filter( {login: login, password: toSHA256(password) } ).run(this.conn);
        const data : user[] = yield cursor.toArray();
        const valid : boolean = data !== undefined && data.length > 0;
        if(valid) {
            const Userdata : user = data[0];
            delete Userdata.password;
            delete Userdata.id;
            console.log(`${Userdata.login} is now connected to morpionBattle!`);
            this.session.user = Userdata;
        }
        this.body = {
            errCode: valid ? 1 : 0,
            errorMessage: valid ? "" : "User not found!"
        };
    }
    else {
        this.body = {
            errCode: 0,
            errorMessage: "Undefined login or password!"
        }
    }
});

router.post('/register', function *(next) {
    console.log(this.request.body);
    this.body = {
        errCode : 1
    }
});

router.get('/logout', middleware.connected, function *(next) {
    this.session = null;
    this.redirect("/main/authentification");
});
