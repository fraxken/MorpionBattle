/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../interfaces.d.ts" />

import * as database from "rethinkdb";
import * as async from "async";

export class RethinkDB_Manager {

    private conn: database.Connection;
    private db: database.RDb;

    constructor(dbName: string,conn: database.Connection) {
        this.conn = conn;
        this.db = database.db(dbName);
    }

    public async tableDeleteBulk(tablesNames: string[]) : Promise<void> {
        const tablesList: string[] = await this.db.tableList().run(this.conn);
        await new Promise( (resolve,reject) => {
            async.each(tablesNames,(tableName: string,callback: () => any) => {
                tablesList.forEach( (v:string) => {
                    if(v === tableName) {
                        this.tableDelete(tableName);
                    }
                } );
                callback();
            },(err:Error) => {
                if(err) reject(err);
                resolve();
            });
        });
    }

    public async tableCreateBulk(tablesNames: string[]) : Promise<void> {
        await new Promise( (resolve,reject) => {
            async.each(tablesNames,(tableName: string,callback: () => any) => {
                this.tableCreate(tableName)
                callback();
            },(err:Error) => {
                if(err) reject(err);
                resolve();
            });
        });
    }

    public async tableCreate(tableName: string) : Promise<void>  {
        await this.db.tableCreate(tableName).run(this.conn);
    }

    public async tableDelete(tableName: string)  : Promise<void>  {
        await this.db.tableDrop(tableName).run(this.conn);
    }

    public async tableHydrate<T>(tableName: string,data: T[]) : Promise<void> {
        data.forEach( async (document: T) => {
            await this.db.table(tableName).insert(document).run(this.conn);
        });
    }

}
