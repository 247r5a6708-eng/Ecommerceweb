import { seedCatalog } from '../../src/services/catalogService';

async function run() {
  await seedCatalog();
  process.exit(0);
}
run();
