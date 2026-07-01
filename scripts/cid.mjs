import { readFileSync } from "fs"; import pg from "pg";
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf-8").split("\n")){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2];}
const c=new pg.Client({host:env.SUPABASE_DB_HOST,port:5432,user:`postgres.${env.SUPABASE_PROJECT_REF}`,password:env.SUPABASE_DB_PASSWORD,database:"postgres",ssl:{rejectUnauthorized:false}});
await c.connect();
const r=await c.query("select id,nombre from public.miembros where nombre in ('Carlos','Yuli alias chiquitera')");
console.log(JSON.stringify(r.rows));
await c.end();
