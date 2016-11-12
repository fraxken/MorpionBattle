/// <reference path="../../typings/index.d.ts" />
/// <reference path="../../interfaces.d.ts" />

// Import packages
import * as crypto from "crypto";

const configuration: iConfiguration = require('../../configuration.json');

export function toSHA256(str: string) : string {
    return crypto.createHash('sha256').update(JSON.stringify(str)).digest('hex');
}

export class Password {
    static hash(password: string, options ?: IOptionHash) : string {
        options = options || {};
        const algorithm : string    = options.algorithm || configuration.password.algorithm || 'sha256';
        const iteration : number    = options.iteration || configuration.password.iteration || 15000;
        const hashSize : number     = options.hashSize  || configuration.password.hashSize  || 512;
        const salt : string = options.salt || crypto.randomBytes(configuration.password.saltSize || 512).toString('hex');
        const hash : string = crypto.pbkdf2Sync(password, salt, iteration, hashSize, algorithm).toString('hex');
        return `${algorithm}$${iteration}$${salt}$${hashSize}$${hash}`;
    }
    static verify(password : string, fullhash : string) : boolean {
        const [algorithm, _iteration, salt, _hashSize] = fullhash.split('$');
        const [iteration, hashSize] = [parseInt(_iteration, 10), parseInt(_hashSize, 10)];
        const testhash : string = Password.hash(password, {algorithm, iteration, salt, hashSize});
        return testhash === fullhash;
    }
}
