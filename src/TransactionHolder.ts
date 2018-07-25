import { OkPacket, PoolConnection } from 'mysql2/promise';
import { QueryHolder } from './QueryHolder';
import { Data, Query } from './types';

export class TransactionHolder extends QueryHolder {
    private hasStarted: boolean;

    public constructor(connection: PoolConnection) {
        super(connection);
        this.hasStarted = false;
    }

    private async begin() {
        await this.connection.beginTransaction();
        this.hasStarted = true;
    }

    public async rollback() {
        try {
            await this.connection.rollback();
            this.release();
        } catch (ex) {
            console.error('Not able to rollback queries', ex);
            this.release();
            throw ex;
        }
    }

    public async commit() {
        try {
            await this.connection.commit();
        } catch (ex) {
            console.error('Not able to commit queries, trying to rollback');
            await this.rollback();
        }
        this.release();
    }

    public async execute<T extends Query = OkPacket>(sql: string, data?: Data) {
        try {
            if (!this.hasStarted) this.begin();

            const result = await this.executeQuery(sql, data);

            return result as T;
        } catch (ex) {
            this.release();
            throw ex;
        }
    }
}
