/**
 * Test script for rate limiting functionality.
 * Tests the GraphQL API rate limiting by making multiple requests.
 */

const API_URL = 'http://localhost:3000/api/graphql';

async function makeGraphQLRequest(query: string) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const headers = {
    'RateLimit-Limit': response.headers.get('RateLimit-Limit'),
    'RateLimit-Remaining': response.headers.get('RateLimit-Remaining'),
    'RateLimit-Reset': response.headers.get('RateLimit-Reset'),
    'Retry-After': response.headers.get('Retry-After'),
  };

  const status = response.status;
  const body = await response.json();

  return { status, headers, body };
}

async function testRateLimiting() {
  console.log('🧪 Testing GraphQL API Rate Limiting\n');
  console.log('Rate limit: 100 requests per hour per IP\n');

  // Simple query to test
  const query = `
    query {
      Posts {
        docs {
          id
          title
        }
      }
    }
  `;

  console.log('Making 5 test requests...\n');

  for (let i = 1; i <= 5; i++) {
    const result = await makeGraphQLRequest(query);

    console.log(`Request ${i}:`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Rate Limit Headers:`);
    console.log(`    Limit: ${result.headers['RateLimit-Limit']}`);
    console.log(`    Remaining: ${result.headers['RateLimit-Remaining']}`);
    console.log(`    Reset: ${result.headers['RateLimit-Reset']}`);

    if (result.status === 429) {
      console.log(`    Retry-After: ${result.headers['Retry-After']} seconds`);
      console.log(`  ❌ Rate limited!`);
      console.log(`  Response: ${JSON.stringify(result.body, null, 2)}`);
    } else {
      console.log(`  ✅ Request successful`);
    }
    console.log();

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('✅ Rate limiting test complete!');
  console.log('\nTo test rate limit exceeded (429 response):');
  console.log('  - Make 100+ requests within an hour');
  console.log('  - Or reduce the limit in src/lib/rate-limit.ts for testing');
}

// Run the test
testRateLimiting().catch(console.error);
