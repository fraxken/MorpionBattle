/// <reference path="../typings/index.d.ts" />
/// <reference path="../interfaces.d.ts" />
// Import dependencies
import * as chalk from "chalk";
import * as sync from "async";
import * as database from "rethinkdb";
// Load JSON files
const configuration : iConfiguration = require('../configuration.json');
/*
    Connect to the database
*/
database.connect(configuration.database, function (err: Error, conn: database.Connection) {
    if(err) {
        const error = err.message.split('\n');
        console.log(chalk.red(error[0]));
        return;
    }

    // Require data
    const users : user[] = require('../data/users.json').users;

    const doTasks : () => Promise<{}> = () => {
        return new Promise( (resolve : (value: {} | PromiseLike<{}>) => void,reject: any) : void => {
            type fallAction = (fall: any) => void;
            const tasks : fallAction[] = [createTableUsers,createTableGame, insertUsers];

            // Check if table users already exists
            database.db(configuration.database.db).tableList().run(conn, (err: Error, list: string[]) : void => {
                if(err) throw err;
                list.forEach( (tablename: string,index: number,array: string[]) : void => {
                    if (tablename === 'users') {
                        tasks.unshift(dropTableUsers);
                    }
                    else if(tablename === 'game') {
                        tasks.unshift(dropTableGame);
                    }
                });
            }).then( () => {
                sync.waterfall(tasks, (err: Error) : void => {
                    if(err) reject(err);
                    resolve('All actions are done !');
                });
            });
            function dropTableUsers(fall) {
                database.db(configuration.database.db).tableDrop('users').run(conn, (err: Error) => {
                    if(err) console.log(err);
                    console.log(chalk.green('Drop of table users sucessfull.'));
                    fall();
                });
            }
            function createTableUsers(fall) {
                database.db(configuration.database.db).tableCreate('users').run(conn, (err: Error)  => {
                    if(err) console.log(err);
                    console.log(chalk.green('Creation of table users sucessfull.'));
                    fall();
                });
            }
            function dropTableGame(fall) {
                database.db(configuration.database.db).tableDrop('game').run(conn, (err: Error) => {
                    if(err) console.log(err);
                    console.log(chalk.green('Drop of table game sucessfull.'));
                    fall();
                });
            }
            function createTableGame(fall) {
                database.db(configuration.database.db).tableCreate('game').run(conn, (err: Error)  => {
                    if(err) console.log(err);
                    console.log(chalk.green('Creation of table game sucessfull.'));
                    fall();
                });
            }

            function insertUsers(fall) {
                sync.each(users,(user: user,next: any) : void => {
                    database.table('users').insert(user).run(conn, (err: Error) => {
                        if(err) console.log(err);
                        console.log(`User => ${chalk.yellow(user.login)} inserted into the users table!`);
                        next();
                    });
                }, (err: any) => {
                    if(err) reject(err);
                    console.log(chalk.green('All users have been inserted'));
                    fall();
                });
            }
        });
    }

    // Execute the promise
    doTasks()
    .then( (finalMsg: string) : void => {
        console.log(chalk.green(finalMsg));
        process.exit();
    })
    .catch( (errMessage: string) : void  => {
        throw new Error(errMessage);
    });
    const closeHandler : () => void = () => {
        conn.close();
    };
    process.on('exit',closeHandler);
    process.on('SIGINT',closeHandler);
    process.on('uncaughtException',closeHandler);
});
