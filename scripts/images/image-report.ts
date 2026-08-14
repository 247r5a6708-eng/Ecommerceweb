import { getProducts } from '../../src/services/catalogService';

async function generateReport() {
  console.log("Product | Model | Variant | Image | Status");
  console.log("-------------------------------------------------------------------");
  const products = await getProducts();
  for (const p of products) {
    const status = p.image ? 'Has Image' : 'No Image';
    console.log(`${p.name} | ${p.model} | ${p.variant} | ${p.image} | ${status}`);
  }
  process.exit(0);
}
generateReport();
