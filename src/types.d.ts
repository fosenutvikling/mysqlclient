import { OkPacket, RowDataPacket } from 'mysql2/promise';

type Data = Array<string | object | number | boolean>;
type Query = OkPacket | OkPacket[] | RowDataPacket[] | RowDataPacket[][] | {};
