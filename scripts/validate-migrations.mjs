import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.resolve('supabase/migrations');
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
if (!files.length) throw new Error('No Supabase migrations found');

const seen = new Set();
let previous = '';
for (const file of files) {
  const match = file.match(/^(\d{14})_.+\.sql$/);
  if (!match) throw new Error(`Invalid migration filename: ${file}`);
  const stamp = match[1];
  if (seen.has(stamp)) throw new Error(`Duplicate migration timestamp: ${stamp}`);
  if (previous && stamp <= previous) throw new Error(`Migration order conflict at ${file}`);
  seen.add(stamp);
  previous = stamp;
  const sql = await readFile(path.join(dir, file), 'utf8');
  if (!sql.trim()) throw new Error(`Empty migration: ${file}`);
}

const onboarding = await readFile(path.join(dir, '20260930120000_onboarding.sql'), 'utf8');
const ageSafety = await readFile(path.join(dir, '20260930213000_age_safety.sql'), 'utf8');
if (!onboarding.includes('function public.set_updated_at')) throw new Error('set_updated_at must be defined in the onboarding migration');
if (!ageSafety.includes('execute function public.set_updated_at()')) throw new Error('Age safety migration must use the existing set_updated_at function');

console.log(`Validated ${files.length} Supabase migrations in execution order.`);
