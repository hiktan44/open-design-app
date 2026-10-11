import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Daemon bağımlılığı, çalışan Node ABI'siyle gerçek bir SQLite sorgusu çalıştırmalıdır. */
export function checkNativeSqlite() {
  const require = createRequire(new URL('../apps/daemon/package.json', import.meta.url));
  const Database = require('better-sqlite3');
  const database = new Database(':memory:');
  try {
    const row = database.prepare('SELECT 1 AS ready, sqlite_version() AS version').get();
    if (row?.ready !== 1 || typeof row?.version !== 'string') {
      throw new Error('SQLite sorgu kontrolü başarısız.');
    }
    return { node: process.version, abi: process.versions.modules, platform: process.platform, arch: process.arch, sqlite: row.version as string };
  } finally {
    database.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    console.log('SQLite yerel bağlayıcısı ve gerçek sorgu geçti: ' + JSON.stringify(checkNativeSqlite()));
  } catch {
    console.error('SQLite yerel bağlayıcısı veya gerçek sorgu başarısız; imaj hazır değil.');
    process.exitCode = 1;
  }
}
