import { indexCourseCatalog } from '../services/aiMentorService.js';

/**
 * Index Course Content into Qdrant
 * 
 * Extracts text content from course JSON files and indexes them into Qdrant
 * with 384-dimensional Xenova/all-MiniLM-L6-v2 embeddings for semantic search.
 * 
 * Usage:
 *   npx tsx src/seeds/indexCourseContent.ts
 */

async function main() {
  console.log('🚀 Starting safe course content indexing into Qdrant...');

  try {
    const result = await indexCourseCatalog({
      onProgress: (indexed, total, title) => {
        console.log(`[${indexed}/${total}] ✓ Indexed: ${title}`);
      },
    });

    console.log('\n📊 Indexing Summary:');
    console.log(`  Total blocks: ${result.total}`);
    console.log(`  Indexed: ${result.indexed}`);
    console.log(`  Errors: ${result.failed}`);

    if (result.success) {
      console.log('\n✅ Course content indexing completed successfully!');
    } else {
      console.error('\n❌ Course content indexing failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Indexing failed with error:', error);
    process.exit(1);
  }
}

main();
