# @fosenu/mysqlclient

MYSQL client, wrapper for [mysql2](https://github.com/sidorares/node-mysql2). The library creates a pool connection to a MYSQL-server, and exports common functions for querying and running transactions.

## Installation

Install the client by running:

    npm install @fosenu/mysqlclient

## Usage

### Connection
Connect to a MYSQL-server:

```ts
import {Client} from '@fosenu/mysqlclient';

const mysqlClient = new Client({
    host: 'localhost',
    user: 'root',
    password: 'root_password',
    database: 'my_db'
});
```

The constructor also takes other connection arguments, listed here [here](https://github.com/sidorares/node-mysql2/blob/master/lib/connection_config.js#L12). `host`, `user`, `password` and `database` are all required connection arguments.

### Run queries

Running queries from a single connection:

```ts
const mysqlClient = ... // From previous example
const query = await mysqlClient.query();
const myResult = await query.execute<{id: number, name: string}>('SELECT id, name from myTable');
query.release(); // NOTE: Important to relase connection after use!

/**
 * Example result
 * myResult: {id: 1, name: 'hello world'}
 */
```

Instead of just running a single query, a connection can be used to run multiple queries as well, before releasing the connection:

```ts
const result1 = await query.execute<{id: number, name: string}>('SELECT id, name from myTable');
const resultN = await query.execute<{id: number, name: string}>('SELECT id, name from myTable');
query.release();
```

__If a connection won't be released, the number of max connections may eventually be reached, and you're not able to create new connections against the database.__

When you only want to run a single query, and not reuse an existing connection, use the `.execute()` method instead, which releases a connection automatically:

```ts
const result = await mysqlClient.execute<{id: number, name: string}>('SELECT id, name from myTable');
```

### Pass arguments

When user-provided arguments needs to be passed to a sql-query, it is important to escape the user-input to prevent sql-injection:

```ts
await mysqlClient.execute<{id: number, name: string}>('SELECT id, name from myTable WHERE id = ?', [myArgument]);
```

```ts
await mysqlClient.execute<{id: number, name: string}>(`SELECT id, name from myTable WHERE id = ${Client.escape(myArgument)}`);
```

### Transaction

Sometimes we need to run queries in a transaction, to make sure changes are only submitted, if all changes succeeds:

```ts
const transaction = await mysqlClient.transaction();
transaction.execute(sqlQuery, args);
...
transaction.execute(sqlQueryN, argsN);
transaction.commit();
```

To write changes to database, end a transaction using `.commit()`. If a commit fails somehow, or you don't want to write changes to the database, use the `.rollback()` function:

```ts
const transaction = await mysqlClient.transaction();
transaction.execute(sqlQuery, args);
...
transaction.execute(sqlQueryN, argsN);
transaction.rollback();
```

The sql-queries passed to the transaction will then be reverted, and the database will be in a state as before acquiring the transaction object.

__Forgetting to use either `commit()` or `rollback()` will keep the connection in an open state.__

## License

© Fosen Utvikling AS, 2018. Licensed under a MIT license