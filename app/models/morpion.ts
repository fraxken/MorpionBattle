/// <reference path="../../typings/index.d.ts" />

import * as chalk from "chalk";
import * as events from "events";

type iMap = { number : { number: string }};

interface YX {
    x: number;
    y: number;
}

interface direction {
    right?: boolean;
    left?: boolean;
    top?: boolean;
    bottom?: boolean;
    ltDiag?: boolean;
    rtDiag?: boolean;
    lbDiag?: boolean;
    rbDiag?: boolean;
}

class Morpion extends events.EventEmitter  {

    public static min_length : number = 3;
    public static min_aligned : number = 3;
    public static proximity : number = 1;

    private map : iMap;
    private _size : number;
    private factorSize: number;
    private available : number;

    constructor(size: number) {
        super();
        this.factorSize = size * size;
        this.size = size < Morpion.min_length ? Morpion.min_length : size;
    }

    public get size() : number {
        return this._size;
    }

    public set size(value: number) {
        this._size = value;
        this.reset();
    }

    public reset() : void {
        this.emit("reset");
        this.available = this.size * this.size;
        this.map = <iMap>{};
        for(let y : number = 0;y < this.size;y++) {
            this.map[y] = {};
            for(let x : number = 0;x < this.size;x++) {
                this.map[y][x] = "";
            }
        }
    }

    // Get case positon with X - Y coord
    public getPosition(t: number) : YX {
        let pos : YX = { y : 0 , x : 0 };
        while(1) {
            if(t - this.size < 0) {
                pos.x = t;
                break;
            }
            pos.y++;
            t -= this.size;
        }
        return pos;
    }

    public print() : void {
        console.log( chalk.yellow(JSON.stringify(this.map,null,2)) );
    }

    public play(Case: number,by: string) : boolean {
        if(Case > this.factorSize || Case < 0) {
            this.emit('log','Case invalid');
            return false
        };
        const position : YX = this.getPosition(Case - 1);
        if(this.map[position.y][position.x] == "") {
            this.map[position.y][position.x] = by;
            this.available -= 1;

            if(this.checkForVictory(position,by)) {
                this.emit("play",by,Case);
                this.emit("victory",by);
            }
            else {
                this.emit("play",by,Case);
                if(this.available === 0) this.reset();
            }
            return true;
        }
        this.emit('log',`Case ${Case} has been already played by ${this.map[position.y][position.x]}`);
        return false;
    }

    public switch(C1: number,C2: number) : boolean {
        if(C1 > this.size - 1 || C2 > this.size - 1) return false;
        const C1_Position : YX = this.getPosition(C1 - 1);
        const C2_Position : YX = this.getPosition(C2 - 1);

        if(C1_Position !== C2_Position) {
            if( this.haveProximity( Object.assign( {},C1_Position) , Object.assign({},C2_Position) ) ) {
                const User1 : string = this.map[C1_Position.y][C1_Position.x];
                const User2 : string = this.map[C2_Position.y][C2_Position.x];
                this.map[C1_Position.y][C1_Position.x] = User2;
                this.map[C2_Position.y][C2_Position.x] = User1;
                const ret : boolean = this.checkForVictory(C2_Position,User2);
                if(!ret)
                    this.checkForVictory(C1_Position,User1);
                return true;
            }
        }
        return false;
    }

    public haveProximity(C1: YX,C2: YX) : boolean {
        let X : number,Y : number;
        for(let i : number = C1.x - Morpion.proximity;i <= C1.x + Morpion.proximity;i++) {
            if(i == C2.x) {
                X = i;
                break;
            }
        }
        for(let i : number = C1.y - Morpion.proximity;i <= C1.y + Morpion.proximity;i++) {
            if(i == C2.y) {
                Y = i;
                break;
            }
        }
        return (X !== undefined && Y !== undefined) ? true : false;
    }

    private getDirection(from: YX) : direction {
        const pattern : direction = {
            left : true,
            right: true,
            top: true,
            bottom: true,
            ltDiag: true,
            rtDiag: true,
            lbDiag: true,
            rbDiag: true
        }

        // Expressions
        const yT : boolean = from.y - 1 < 0;
        const xT : boolean = from.x - 1 < 0;
        const yB : boolean = from.y + 1 > (this.size - 1);
        const xB : boolean = from.x + 1 > (this.size - 1);

        // Check
        if(yT) {
            delete pattern.bottom;
        }
        else if(yB) {
            delete pattern.top;
        }

        if(xT) {
            delete pattern.left;
        }
        else if(xB) {
            delete pattern.right;
        }

        if(xT || yT) {
            delete pattern.ltDiag;
        }

        if(xB || yT) {
            delete pattern.rtDiag;
        }

        if(yB || xT) {
            delete pattern.lbDiag;
        }

        if(yB || xB) {
            delete pattern.rbDiag;
        }

        return pattern;
    }

    private getPositionFromDirection(defaultPosition: YX,direction: string) : YX {
        switch(direction) {
            case "left":
                defaultPosition.x--;
            break;
            case "right":
                defaultPosition.x++;
            break;
            case "top":
                defaultPosition.y++;
            break;
            case "bottom":
                defaultPosition.y--;
            break;
            case "ltDiag":
                defaultPosition.x--;
                defaultPosition.y--;
            break;
            case "rtDiag":
                defaultPosition.x++;
                defaultPosition.y--;
            break;
            case "lbDiag":
                defaultPosition.x--;
                defaultPosition.y++;
            break;
            case "rbDiag":
                defaultPosition.y++;
                defaultPosition.x++;
            break;
        }
        return defaultPosition;
    }

    private tracking(direction: string,position: YX,by:string,nombreDeCoup: number) : boolean {
        if(this.map[position.y][position.x] === by) {
            if(nombreDeCoup + 1 < Morpion.min_aligned) {
                const authorize : direction = this.getDirection(Object.assign({},position));
                if(authorize[direction]) {
                    const checkPosition : YX = this.getPositionFromDirection(Object.assign({},position),direction);
                    return this.tracking(direction,checkPosition,by,nombreDeCoup + 1);
                }
                return false;
            }
            return true;
        }
        return false;
    }

    private checkForVictory(position: YX,by: string) : boolean {
        const authorize : direction = this.getDirection(Object.assign({},position));
        const possibility : { [key:string] : YX } = {};
        for(const direction in authorize) {
            const checkPosition : YX = this.getPositionFromDirection(Object.assign({},position),direction);
            if(this.map[checkPosition.y][checkPosition.x] === by) possibility[direction] = checkPosition;
        }

        if(Object.keys(possibility).length === 0) return false;

        for(const direction in possibility)
            if(this.tracking(direction,possibility[direction],by,1)) return true;
        return false;
    }

}

export { YX , direction, Morpion };
