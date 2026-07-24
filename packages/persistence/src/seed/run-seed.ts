import { createPersistence } from '../create-persistence';
import { SEED_PRODUCTS } from './catalog';

async function main(): Promise<void> {
  const { products, table } = createPersistence();

  for (const product of SEED_PRODUCTS) {
    const result = await products.put(product);
    if (result.isErr()) {
      console.error(`Failed to seed ${product.id}:`, result.error);
      process.exit(1);
    }
    console.log(
      `Seeded ${product.id} stock=${product.stock} (${product.name})`,
    );
  }

  const listed = await products.listAll();
  if (listed.isErr()) {
    console.error('Seed verification failed:', listed.error);
    process.exit(1);
  }

  const withStock = listed.value.filter((p: { stock: number }) => p.stock > 0);
  if (withStock.length < 3) {
    console.error(
      `Expected ≥3 products with stock > 0, got ${withStock.length}`,
    );
    process.exit(1);
  }

  console.log(
    `OK — table=${table} products=${listed.value.length} withStock=${withStock.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
