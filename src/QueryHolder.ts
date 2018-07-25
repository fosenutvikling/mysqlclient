import { OkPacket,PoolConnection } from 'mysql2/promise';
import { Data, Query } from './types';

export class QueryHolder {
    protected connection: PoolConnection;

    public constructor(connection: PoolConnection) {
        this.connection = connection;
    }

    protected async executeQuery<T extends Query = OkPacket>(sql: string, data?: Data) {
        const [result] = await this.connection.execute(sql, data);

        return result as T;
    }

    public release() {
        this.connection.release();
    }

    public async execute<T extends Query = OkPacket>(sql: string, data?: Data) {
        const result = await this.executeQuery<T>(sql, data);

        return result;
    }
}
