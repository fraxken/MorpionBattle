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
import * as http from "http";

const koa               = require('koa');
const helmet            = require('koa-helmet');
const sessions          = require('koa-generic-session');
const koaPug            = require('koa-pug');
const bodyParser        = require('koa-bodyparser');
const koaJson           = require('koa-json');
const koaRouter         = require('koa-router');
const socketIO          = require('socket.io');
const RedisStore        = require('koa-redis');
const redis             = require('socket.io-redis');
const cookie            = require('cookie');
const koaSocketSession  = require('koa-socket-session');
const koaSocket         = require('koa-socket.io');

const configuration: iConfiguration = require('../configuration.json');
const socketEvents = require('../data/socket-events.json');
//const numCPUs : number = os.cpus().length;
const numCPUs : number = 1;

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

    database.connect(configuration.database, (err: Error, conn: database.Connection) => {
        if(err) throw new Error(err.toString());

        const app = koa();

        new koaPug({
            viewPath: path.join(__dirname,'../views'),
            noCache: true,
            pretty: true,
            debug: true,
            compileDebug: false,
            app: app
        });

        // Session middleware implementation !
        app.keys = ['keys', 'keykeys'];
        const session = sessions({
            store: new RedisStore(configuration.redis),
            saveUninitialized: true,
            resave: true
        });

        app.use(session);
        app.use( bodyParser() );
        //app.use( helmet() );
        app.use( koaJson() );

        //io.use(koaSocketSession(app, session));

        const server = http.createServer(app.callback());
        const io = socketIO(server);

        io.on('connection', (socket) => {
            const cookie_id = cookie.parse(socket.request.headers.cookie);
            console.log(cookie_id);
            console.log('user connected to the socket.io server!');

            socket.on(socketEvents.getServers, async () => {
                const cursor : any = await database.table('game').run(conn);
                const data : any[] = await cursor.toArray();
                if(data.length > 0) {
                    const serversList = [];
                    data.forEach( v => serversList.push({name: v.name,password: v.password ? true : false}) );
                    io.emit(socketEvents.serversList,serversList);
                }
                else {
                    io.emit(socketEvents.serversList,null);
                }
            });

            socket.on(socketEvents.createGame, (data) => {

            });

            socket.on(socketEvents.joinGame, (data) => {

            });
        });

        app.use( function *(next) {
            this.db = database;
            this.conn = conn;
            this.session.username = "fraxken";
            yield next;
        });

        // Load routing!
        loader.getModules("routing").then( (modulesArr: string[]) => {

            modulesArr.forEach( (route: string) => {
                const Router = require(route);
                app.use( Router.routes() ).use( Router.allowedMethods() );
            });

            server.listen( configuration.app.port );

        }).catch( errMessage => console.log(errMessage) );

        const closeHandler : () => void = () => {
            process.exit();
        }
        process.on('exit',closeHandler);
        process.on('SIGINT',closeHandler);
        process.on('uncaughtException',closeHandler);
    });

}
