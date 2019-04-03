import { createPool, escape, OkPacket, Pool, PoolOptions } from 'mysql2/promise';
import { QueryHolder } from './QueryHolder';
import { TransactionHolder } from './TransactionHolder';
import { Data, Query } from './types';

interface IMySQLField {
    length: number;
    type: 'JSON' | 'TINY' | 'CHAR';
    string: () => string;
}

export class Client {
    private poolCluster: Pool;
    private readonly options: PoolOptions;

    public constructor(options: PoolOptions) {
        if (!(options.host && options.user && options.password && options.database))
            throw new Error(
                'All required options `host`, `user`, `password` and `database` not set'
            );

        options.typeCast = (field: IMySQLField, next) => {
            if (field.type === 'TINY' && field.length === 1) return field.string() === '1';
            else if (field.type === 'JSON') return JSON.parse(field.string());

            return next();
        };

        this.options = options;
    }

    public static escape(input: string | number) {
        return escape(input);
    }

    private async connection() {
        const connection = await this.poolCluster.getConnection();

        return connection;
    }

    public async init() {
        this.poolCluster = createPool(this.options);
    }

    public async transaction() {
        const connection = await this.connection();

        return new TransactionHolder(connection);
    }

    public async query() {
        const connection = await this.connection();

        return new QueryHolder(connection);
    }

    public async execute<T extends Query = OkPacket>(sql: string, data?: Data) {
        const query = await this.query();

        try {
            const result = await query.execute<T>(sql, data);
            query.release();

            return result;
        } catch (ex) {
            query.release();
            throw ex;
        }
    }
}
