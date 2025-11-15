// ============================================
// FILE: server/tests/setup.js
// ============================================
const { supabase } = require('../src/config/database');
const { redis } = require('../src/config/redis');

// Global test timeout
jest.setTimeout(10000);

// Setup before all tests
beforeAll(async () => {
  // Ensure test database is clean
  await cleanupTestData();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanupTestData();
  await redis.quit();
});

// Cleanup after each test
afterEach(async () => {
  await redis.flushdb();
});

async function cleanupTestData() {
  try {
    // Delete test data in correct order (respecting foreign keys)
    const tables = [
      'message_reactions',
      'message_status',
      'messages',
      'conversation_participants',
      'conversations',
      'status_views',
      'statuses',
      'call_logs',
      'contacts',
      'user_settings',
      'push_subscriptions',
      'refresh_tokens',
      'otps',
      'users',
    ];

    for (const table of tables) {
      await supabase.from(table).delete().ilike('email', 'test%');
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// Test helpers
global.createTestUser = async (email = 'test@example.com') => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      display_name: email.split('@')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

global.createTestConversation = async (creatorId, type = 'direct') => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      type,
      created_by: creatorId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

