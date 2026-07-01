import { readFileSync } from "fs"; import pg from "pg";
pg.types.setTypeParser(1082, v=>v);
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf-8").split("\n")){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2];}
const c=new pg.Client({host:env.SUPABASE_DB_HOST,port:5432,user:`postgres.${env.SUPABASE_PROJECT_REF}`,password:env.SUPABASE_DB_PASSWORD,database:"postgres",ssl:{rejectUnauthorized:false}});
await c.connect();
const m=await c.query("insert into public.miembros(nombre,emoji,color) values('__IDEMTEST__','🐷','#6c5ce7') returning id");
const mid=m.rows[0].id; const tok="11111111-1111-1111-1111-111111111111";
const q="insert into public.aportes(miembro_id,monto,fecha,estado,client_token) values($1,50000,'2026-07-01','pendiente',$2) on conflict (client_token) do nothing returning id";
const r1=await c.query(q,[mid,tok]);
const r2=await c.query(q,[mid,tok]); // reintento con el mismo token
const cnt=await c.query("select count(*)::int n from public.aportes where client_token=$1",[tok]);
console.log(`insert1 devolvió ${r1.rowCount} fila(s), insert2 (reintento) devolvió ${r2.rowCount} fila(s) → total con ese token: ${cnt.rows[0].n} (debe ser 1)`);
// limpieza
await c.query("delete from public.aportes where miembro_id=$1",[mid]);
await c.query("delete from public.miembros where id=$1",[mid]);
const real=await c.query("select (select count(*) from public.miembros) mi,(select count(*) from public.aportes) ap");
console.log("limpio, datos reales intactos:", JSON.stringify(real.rows[0]));
await c.end();
