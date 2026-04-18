
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function runAudit() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('--- DB AUDIT REPORT ---');

    // 1. Check User table (positions)
    const users = await client.query('SELECT position, COUNT(*) FROM "User" GROUP BY position');
    console.log('\n[User Stats by Role]');
    users.rows.forEach(row => console.log(`- ${row.position}: ${row.count} users`));

    // 2. Check QuestionSet and Question count
    const qSets = await client.query(`
      SELECT 
        tr.code as "targetRole", 
        COUNT(q.id) as q_count
      FROM "QuestionSet" qs
      JOIN "TargetRole" tr ON qs."roleId" = tr.id
      LEFT JOIN "Question" q ON qs.id = q."setId"
      GROUP BY tr.code
    `);

    console.log('\n[QuestionSet Audit]');
    qSets.rows.forEach(row => {
      const count = parseInt(row.q_count);
      const status = count >= 120 ? '✅ OK' : '❌ ERROR (Insufficient Qs)';
      console.log(`- Role ${row.targetRole}: ${count}/120 questions [${status}]`);
    });

    // 3. Find missing roles (referenced in UI but no QuestionSet)
    const uiRoles = ['DEV', 'TESTER', 'MANAGER', 'PM', 'HR', 'SALES', 'BRSE', 'COMTOR', 'ACC', 'MKT'];
    const dbRoles = qSets.rows.map(r => r.targetRole);
    const missingRoles = uiRoles.filter(role => !dbRoles.includes(role));

    if (missingRoles.length > 0) {
      console.log('\n[Missing QuestionSets for UI Roles]');
      missingRoles.forEach(role => console.log(`- ${role}: ❌ NO DATA`));
    }

  } catch (err: any) {
    console.error('Audit failed:', err.message);
  } finally {
    await client.end();
  }
}

runAudit();
