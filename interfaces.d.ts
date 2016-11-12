interface user {
    login: string;
    password: string;
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
