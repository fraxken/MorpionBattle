/// <reference path="../../typings/index.d.ts"/>

import * as fs from "fs";
import * as path from "path";
import * as async from "async";

export function getModules(focusDirectory: string) {
    return new Promise( (resolve,reject) => {
        const routingArr = [];
        const trackPath = (rootPath,root) => {
            return new Promise( (resolve_sub,reject_sub) => {
                const currentPath = root ? path.join(__dirname,"../",rootPath) : rootPath;
                const routingFiles = fs.readdirSync( currentPath );
                async.each( routingFiles, (fileName,callback) => {
                    const filePath = `${currentPath}\\${fileName}`;
                    const isDirectory = fs.statSync(filePath).isDirectory();
                    if(isDirectory) {
                        trackPath(filePath,false).then( () => callback() ).catch( errMessage => reject_sub(errMessage) );
                    }
                    else {
                        const file_ext : string = path.extname(filePath);
                        if(file_ext === '.js') {
                            routingArr.push(filePath);
                            callback();
                        }
                        else {
                            callback();
                        }
                    }
                }, err => {
                    if(err) reject_sub(err);
                    resolve_sub(true);
                });
            });
        }
        trackPath(focusDirectory,true).then( () => resolve(routingArr) ).catch( errMessage => reject(errMessage));
    });
}

export function getJson(focusDirectory: string) {
    return new Promise( (resolve,reject) => {
        let json = {};
        const rootPath = path.join(__dirname,"../",focusDirectory);
        fs.readdir( rootPath , (err,files) => {
            if(err) throw new Error(err.toString());
            async.each(files, (fileName,callback) => {
                const filePath = `${rootPath}\\${fileName}`;
                fs.stat(filePath,(err,stats) => {
                    if(err) console.log(err);
                    if(!stats.isDirectory()) {
                        json[fileName.replace(/\.[^/.]+$/, "")] = require(filePath);
                    }
                    callback();
                });
            },err => {
                if(err) reject(err);
                resolve(json);
            });
        });
    });
}
