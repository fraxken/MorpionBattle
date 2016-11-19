"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const database = require("rethinkdb");
const async = require("async");
class RethinkDB_Manager {
    constructor(dbName, conn) {
        this.conn = conn;
        this.db = database.db(dbName);
    }
    static createDatabase(conn, baseName) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield database.dbCreate(baseName).run(conn);
            return res.dbs_created ? true : false;
        });
    }
    tableDeleteBulk(tablesNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const tablesList = yield this.db.tableList().run(this.conn);
            yield new Promise((resolve, reject) => {
                async.each(tablesNames, (tableName, callback) => {
                    tablesList.forEach((v) => {
                        if (v === tableName) {
                            this.tableDelete(tableName);
                        }
                    });
                    callback();
                }, (err) => {
                    if (err)
                        reject(err);
                    resolve();
                });
            });
        });
    }
    tableCreateBulk(tablesNames) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                async.each(tablesNames, (tableName, callback) => {
                    this.tableCreate(tableName);
                    callback();
                }, (err) => {
                    if (err)
                        reject(err);
                    resolve();
                });
            });
        });
    }
    tableCreate(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.tableCreate(tableName).run(this.conn);
        });
    }
    tableDelete(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.tableDrop(tableName).run(this.conn);
        });
    }
    tableHydrate(tableName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            data.forEach((document) => __awaiter(this, void 0, void 0, function* () {
                yield this.db.table(tableName).insert(document).run(this.conn);
            }));
        });
    }
}
exports.RethinkDB_Manager = RethinkDB_Manager;
