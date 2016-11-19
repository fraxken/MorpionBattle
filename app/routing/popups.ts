/// <reference path="../../typings/index.d.ts" />

import * as path from "path";
import * as koaRouter from "koa-router";

const router: koaRouter = new koaRouter({
    prefix : "/popups"
});

router.get('/creategame', function *(next: koaRouter.IRouterContext) {
    this.render('popups/creategame');
});

router.get('/password', function *(next: koaRouter.IRouterContext) {
    this.render('popups/password');
});

export = router;
