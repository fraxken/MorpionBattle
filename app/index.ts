/// <reference path="../typings/index.d.ts" />
/// <reference path="../interfaces.d.ts" />

// Import dependencies !
import * as os from "os";
import * as cluster from "cluster";
import * as events from "events";
import * as chalk from "chalk";
import * as sync from "async";
import * as database from "rethinkdb";
import * as path from "path";
import * as loader from "./core/autoloader";

const koa               = require('koa');
const helmet            = require('koa-helmet');
const sessions          = require('koa-generic-session');
const koaPug            = require('koa-pug');
const bodyParser        = require('koa-bodyparser');
const koaJson           = require('koa-json');

const configuration: iConfiguration = require('../configuration.json');
const numCPUs : number = os.cpus().length;

// Debugging & Trace
process.on('unhandledRejection', console.log.bind(console));
/*
    Fork the process on multi-core.
*/
if (cluster.isMaster) {
    for (let i : number = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    console.info(chalk.green('Clustering OK!'));
    cluster.on('fork', worker => {
        console.log(chalk.green(`Worker n°${worker.process.pid.toString()} is now forked and available for work.`));
    });
    cluster.on('exit', (worker: cluster.Worker, code: any, signal: any) => {
        console.log(chalk.red(`Worker n°${worker.process.pid.toString()} is dead !`));
        console.log(chalk.yellow('Restarting ...'));
        cluster.fork();
    });
}
else {

    const app = koa();

    new koaPug({
        viewPath: path.join(__dirname,'../','views'),
        noCache: process.env.NODE_ENV === 'development',
        pretty: true,
        debug: process.env.NODE_ENV === 'development',
        compileDebug: false,
        app: app
    });

    // Session middleware implementation !
    app.keys = ['keys', 'keykeys'];
    const session = sessions();

    app.use(session);
    app.use( bodyParser() );
    app.use( helmet() );
    app.use( koaJson() );

    app.use( function *(next) {
        database.connect(configuration.database, (err: Error, conn: database.Connection) => {
            if(err) throw new Error(err.toString());
            this.database = database;
            this.conn = conn;
        });
    });

    // Load routing!
    loader.getModules("routing").then( (modulesArr: string[]) => {

        modulesArr.forEach( (route: string) => {
            const Router = require(route);
            app.use( Router.routes() ).use( Router.allowedMethods() );
        });
        app.server.listen( process.argv[3] || configuration.app.port , configuration.app.ip );

    }).catch( errMessage => console.log(errMessage) );


    const closeHandler : () => void = () => {
        process.exit();
    }
    process.on('exit',closeHandler);
    process.on('SIGINT',closeHandler);
    process.on('uncaughtException',closeHandler);

}
