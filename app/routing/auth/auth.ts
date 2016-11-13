/// <reference path="../../../typings/index.d.ts" />
/// <reference path="../../../interfaces.d.ts" />

import * as path from "path";
import {toSHA256} from "../../core/utils";

const middleware    = require(path.join(__dirname,"../../","core/middleware.js"));
const errors        = require('../../../data/errors.json').auth;

const router = module.exports = require('koa-router')({
    prefix : "/authentification"
});

router.post('/login', function *(next) {
    const login: string     = this.request.body.formData.login;
    const password: string  = this.request.body.formData.password;

    if(login !== "undefined" && password !== "undefined") {

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
            errorMessage: valid ? "" : errors.notfound
        };
    }
    else {
        this.body = {
            errCode: 0,
            errorMessage: errors.undefined
        }
    }
});

router.post('/register', function *(next) {
    const login: string             = this.request.body.formData.login;
    const password: string          = this.request.body.formData.password;
    const passwordRepeat: string    = this.request.body.formData.passwordRepeat;

    if(login !== "undefined" && password !== "undefined" && passwordRepeat !== "undefined") {

        if(password !== passwordRepeat) {
            this.body = {
                errCode: 0,
                errorMessage: errors.repeat
            }
        }

        // TODO: Password Regex check!
        let err: boolean = false;
        if((login.length < 2 || login.length > 12)) {
            err = true;
        }

        if(err) {
            this.body = {
                errCode: 0,
                errorMessage: errors.format
            }
        }
        else {
            const cursor = yield this.db.table('users').filter( {login: login, password: toSHA256(password) } ).run(this.conn);
            const data : user[] = yield cursor.toArray();
            if(data.length === 0) {
                const user : user = {
                    login: login,
                    password: toSHA256(password),
                    elo: 0,
                    win: 0,
                    loose: 0
                };
                const rc = yield this.db.table('users').insert(user).run(this.conn);
                delete user.password;
                this.session.user = user;
                this.body = {
                    errCode: 1
                }
            }
            else {
                this.body = {
                    errCode: 0,
                    errorMessage: errors.taken
                }
            }
        }
    }
    else {
        this.body = {
            errCode: 0,
            errorMessage: errors.undefined
        }
    }
});

router.get('/logout', middleware.connected, function *(next) {
    this.session = null;
    this.redirect("/main/authentification");
});
