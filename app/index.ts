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
import * as koa from "koa";
import * as koaJson from "koa-json";
import * as koaBodyparser from "koa-bodyparser";
import * as koaRouter from "koa-router";
import * as socketIO from "socket.io";

const sessions          = require('koa-generic-session');
const koaPug            = require('koa-pug');
const RedisStore        = require('koa-redis');

const configuration: iConfiguration = require('../configuration.json');
const socketEvents = require('../data/socket-events.json');
//const numCPUs : number = os.cpus().length;
const numCPUs : number = 1;

// Debugging & Trace
//process.on('unhandledRejection', console.log.bind(console));
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
        if(err) {
            console.log(err.message.split('\n')[0]);
            process.exit(1);
        }

        const app = new koa();

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

        app.use( session );
        app.use( koaBodyparser() );
        app.use( koaJson() );

        const server: http.Server = http.createServer(app.callback());

        const io: SocketIO.Server = socketIO(server);
        io.on('connection', (socket: SocketIO.Socket) => {
            console.log('user connected to the socket.io server!');

            socket.on(socketEvents.getServers, async () => {
                const cursor : any = await database.table('game').run(conn);
                const data : any[] = await cursor.toArray();
                if(data.length > 0) {
                    const serversList = [];
                    data.forEach( gameData => {
                        const gameLength: number = gameData.player ? gameData.player.length : 1;
                        serversList.push({
                            id: gameData.id,
                            name: gameData.name,
                            password: gameData.lock,
                            playerCount: gameLength
                        })
                    });
                    io.emit(socketEvents.serversList,serversList);
                }
                else {
                    io.emit(socketEvents.serversList,null);
                }
            });

            database.table('game').changes().run(conn,(err,cursor) => {
                cursor.each( (_,row) => {
                    console.log(row);
                });
            });

            socket.on(socketEvents.createGame, (data) => {

            });

            socket.on(socketEvents.joinGame, (data) => {
                console.log("User requested to join the game with gameid => "+data.id);

                // TODO: Ingame or ?
                // TODO: Check if the game is complete
                // TODO: Ask for password (if present reserve slot)
                // TODO: Else join directly the game
            });

            // TODO: Password event!
        });

        app.use( function *(next: koa.Context) {
            this.db = database;
            this.conn = conn;
            this.session.username = "fraxken";
            this.io = io;
            this.gameDB = database.table('game');
            this.userDB = database.table('users');
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
