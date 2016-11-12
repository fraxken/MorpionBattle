interface user {
    id?: string;
    login?: string;
    password?: string;
    win?: number;
    loose?: number;
    elo?: number;
}

interface iConfiguration {
    app: {
        port: number;
        ip: string;
        host: string;
        secretkey: string;
    };
    database: {
        port: number;
        host: string;
        db: string;
    };
    password: {
        algorithm: string;
        iteration: number;
        saltSize: number;
        hashSize: number;
    }
}

interface IOptionHash {
    algorithm ?: string;
    iteration ?: number;
    hashSize ?: number;
    salt ?: string;
}
