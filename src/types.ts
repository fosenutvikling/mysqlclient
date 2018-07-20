import { OkPacket, RowDataPacket } from 'mysql2/promise';

export type Data = Array<string | object | number | boolean>;
export type Query = OkPacket | OkPacket[] | RowDataPacket[] | RowDataPacket[][] | {};
