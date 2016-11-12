/// <reference path="../typings/index.d.ts" />
/// <reference path="../interfaces.d.ts" />

// Import dependencies !
import * as os from "os";
import * as cluster from "cluster";
import * as events from "events";
import * as chalk from "chalk";
import * as sync from "async";
import * as database from "rethinkdb";

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

    /*database.connect(configuration.database, (err: Error, conn: database.Connection) => {
        if(err) throw new Error(err.toString());

    });*/

    const closeHandler : () => void = () => {
        process.exit();
    }
    process.on('exit',closeHandler);
    process.on('SIGINT',closeHandler);
    process.on('uncaughtException',closeHandler);

}
