const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'packages/backend/prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');

// remove enums completely
schema = schema.replace(/enum \w+ \{[\s\S]*?\}/g, '');

// replace field types
schema = schema.replace(/UserRole/g, 'String');
schema = schema.replace(/StaffStatus/g, 'String');
schema = schema.replace(/AttendanceStatus/g, 'String');
schema = schema.replace(/PerformanceCategory/g, 'String');
schema = schema.replace(/AuditAction/g, 'String');
schema = schema.replace(/AuditEntityType/g, 'String');
schema = schema.replace(/EncryptionType/g, 'String');

fs.writeFileSync(schemaPath, schema);
console.log('Schema converted');
