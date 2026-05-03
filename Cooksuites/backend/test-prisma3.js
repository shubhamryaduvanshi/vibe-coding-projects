const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { UnitConverter } = require('./dist/utils/unitConverter.js'); // Or TS execution
