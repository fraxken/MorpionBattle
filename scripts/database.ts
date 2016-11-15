/// <reference path="../typings/index.d.ts" />
/// <reference path="../interfaces.d.ts" />

// Import dependencies
import * as chalk from "chalk";
import * as async from "async";
import * as database from "rethinkdb";
import {RethinkDB_Manager} from "./class/RethinkDB_manager";

//process.on('unhandledRejection', console.log.bind(console));

// Load configuration file!
const configuration : iConfiguration = require('../configuration.json');

const sleep = function(timeMs: number) : Promise<void> {
    return new Promise<void>( (accept,reject) => setTimeout(accept, timeMs));
}

/*
    Connect to the database
*/
database.connect(configuration.database, async (err: Error, conn: database.Connection) => {
    if(err) {
        console.log(chalk.red(err.message.split('\n')[0]));
        return;
    }
    const closeHandler : () => void = () => conn.close();
    process.on('exit',closeHandler);
    process.on('SIGINT',closeHandler);
    process.on('uncaughtException',closeHandler);

    // Require data
    const usersArray : user[] = require('../data/users.json').users;

    // Configure default table!
    const dbTables: string[] = ['users','game'];

    const dbManager: RethinkDB_Manager = new RethinkDB_Manager(configuration.database.db,conn);

    console.log(chalk.green('Executing actions...'));
    await dbManager.tableDeleteBulk(dbTables);
    await sleep(1000);
    await dbManager.tableCreateBulk(dbTables);
    await sleep(3000);
    await dbManager.tableHydrate<user>('users',usersArray);
    console.log(chalk.green('Executing actions done!'));

    closeHandler();
    process.exit(0);
});
