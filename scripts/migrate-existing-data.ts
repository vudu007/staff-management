import * as fs from 'fs';
import * as path from 'path';

const STAFF_DATA_PATH = path.join(__dirname, '..', '..', 'staff_data.json');
const USERS_PATH = path.join(__dirname, '..', '..', 'users.json');

async function main() {
  console.log('Starting data migration from existing system...');

  let staffData: any;
  let usersData: any;

  try {
    staffData = JSON.parse(fs.readFileSync(STAFF_DATA_PATH, 'utf-8'));
    console.log(`Loaded staff data with ${Object.keys(staffData).length} stores`);
  } catch {
    console.log('No staff_data.json found. Skipping staff migration.');
    staffData = {};
  }

  try {
    usersData = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    console.log(`Loaded ${Object.keys(usersData).length} users`);
  } catch {
    console.log('No users.json found. Skipping user migration.');
    usersData = {};
  }

  const stores: { name: string; code: string }[] = [];
  const staff: any[] = [];

  for (const [storeName, staffList] of Object.entries(staffData)) {
    if (storeName === 'userid') continue;
    const code = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    stores.push({ name: storeName, code });

    for (const [staffId, info] of Object.entries(staffList as Record<string, any>)) {
      if (staffId === 'userid') continue;
      const fullName = info.name || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      staff.push({
        staffId,
        firstName,
        lastName,
        position: info.position || 'Sales Associate',
        phone: info.phone || '',
        storeCode: code,
        plainPassword: info.plain_password || '',
      });
    }
  }

  const output = {
    stores,
    staff,
    users: Object.entries(usersData).map(([username, info]: [string, any]) => ({
      username,
      role: info.role || 'ADMIN',
    })),
  };

  const outputPath = path.join(__dirname, '..', 'migration-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\nMigration summary:`);
  console.log(`  Stores: ${stores.length}`);
  console.log(`  Staff: ${staff.length}`);
  console.log(`  Users: ${output.users.length}`);
  console.log(`\nOutput written to: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('  1. Run: npm run db:generate');
  console.log('  2. Run: npm run db:migrate');
  console.log('  3. Run: npm run db:seed');
  console.log('  4. Use the migration-output.json to seed your database');
}

main().catch(console.error);
