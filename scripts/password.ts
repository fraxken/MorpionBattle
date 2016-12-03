import {Password} from "../app/core/utils";

let lastPassword : string  = '';
for (let i : number = 0; i < 10; i++) {
    const start : number = Date.now();
    const password : string = `test ${i}`;
    const hash : string = Password.hash(password);
    const middle : number = Date.now();
    const isOK : boolean = Password.verify(password, hash);
    const end : number = Date.now();
    const isBad : boolean = Password.verify(lastPassword, hash);
    lastPassword = password;
    console.log(`password : ${password}`);
    console.log(`hash : ${hash}`);
    console.log(`isOK : ${isOK}`);
    console.log(`isBad : ${isBad}`);
    console.log(`time : ${end - start}ms, hashtime : ${middle - start}ms, verifytime: ${end - middle}ms\n`);
}
