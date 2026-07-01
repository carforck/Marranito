import { readFileSync } from "fs"; import pg from "pg";
pg.types.setTypeParser(1082, v=>v);
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf-8").split("\n")){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2];}
const c=new pg.Client({host:"aws-1-us-west-2.pooler.supabase.com",port:6543,user:`postgres.${env.SUPABASE_PROJECT_REF}`,password:env.SUPABASE_DB_PASSWORD,database:"postgres",ssl:{rejectUnauthorized:false}});
await c.connect();
// consulta parametrizada (extended protocol) para probar compatibilidad con transaction pooler
const r=await c.query("select m.nombre, a.fecha, a.monto from public.aportes a join public.miembros m on m.id=a.miembro_id where a.estado=$1 order by a.fecha",["confirmado"]);
console.log("6543 OK, filas:", r.rows.length, "| ej:", JSON.stringify(r.rows[0]));
await c.end();
