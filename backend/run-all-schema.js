
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');
const db = require('./db');

const schemaDir = path.join(__dirname, '..', 'database', 'schema');
const seedDir = path.join(__dirname, '..', 'database', 'seed');

const schemaFiles = [
  '01_master_data.sql',
  '02_users.sql',
  '03_requests.sql',
  '04_offers.sql',
  '05_deals.sql',
  '06_trust.sql'
];

const seedFiles = [
  '01_departments.sql',
  '02_categories.sql',
  '03_pickup_locations.sql'
];

// Split SQL at semicolons outside strings and comments.
function getStatements(sql) {
  const statements = [];
  let statement = '';
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (lineComment) {
      if (ch === '\n') {
        lineComment = false;
        statement += '\n';
      }
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i++;
        statement += ' ';
      }
      continue;
    }

    if (quote) {
      statement += ch;

      if (ch === '\\' && quote !== '`' && i + 1 < sql.length) {
        statement += sql[++i];
        continue;
      }

      if (ch === quote) {
        if (next === quote) {
          statement += sql[++i];
        } else {
          quote = null;
        }
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      statement += ch;
      continue;
    }

    if (
      ch === '#' ||
      (ch === '-' && next === '-' &&
        (i + 2 === sql.length || /\s/.test(sql[i + 2])))
    ) {
      lineComment = true;
      if (ch === '-') i++;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i++;
      statement += ' ';
      continue;
    }

    if (ch === ';') {
      if (statement.trim()) statements.push(statement.trim());
      statement = '';
      continue;
    }

    statement += ch;
  }

  if (quote) {
    throw new Error('Unclosed quote found in SQL file.');
  }

  if (blockComment) {
    throw new Error('Unclosed block comment found in SQL file.');
  }

  if (statement.trim()) statements.push(statement.trim());

  return statements;
}

async function processFiles(directory, files, type) {
  for (const file of files) {
    const filePath = path.join(directory, file);

    if (!fs.existsSync(filePath)) {
      throw new Error(`${type} file not found: ${file}`);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    const statements = getStatements(sql);

    console.log(`Processing ${type}: ${file}...`);

    for (const statement of statements) {
      await db.query(statement);
    }

    console.log(`Completed ${file}`);
  }
}

async function main() {
  try {
    const allowedDatabases = ['campus_plus_test'];

    if (!allowedDatabases.includes(process.env.DB_NAME)) {
      throw new Error(
        'Stopped: set DB_NAME=campus_plus_test in backend/.env before running.'
      );
    }

    console.log('Starting schema setup...');
    await processFiles(schemaDir, schemaFiles, 'schema');

    console.log('Starting seed data...');
    await processFiles(seedDir, seedFiles, 'seed');

    console.log('Schema and seed data processed successfully.');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();
