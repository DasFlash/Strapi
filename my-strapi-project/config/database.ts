import { Next, Context } from "koa";
import mysql from "mysql2/promise";

export default (config, { strapi }) => {
  return async (ctx: Context, next: Next) => {
    const poolRead = mysql.createPool({
      host: process.env.DATABASE_HOST_READING,
      port: parseInt(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    });

    const poolWrite = mysql.createPool({
      host: process.env.DATABASE_HOST_WRITING,
      port: parseInt(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    });
    
    const isWriteOperation = ["POST", "PUT", "DELETE"].includes(ctx.method);

    ctx.dbConfig = isWriteOperation ? poolWrite : poolRead;

    await next();
  };
};
