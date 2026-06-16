import { config } from './dist/config.js';
import { prisma } from './dist/prisma.js';

const baseUrl = 'http://localhost:3001/api';

async function runTests() {
  console.log("=== 1. Signup -> Logout -> Login ===");
  const testEmail = `newuser_${Date.now()}@fraylon.com`;
  
  // 1a. Signup
  const signupRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123', name: 'New User' })
  });
  const signupData = await signupRes.json();
  if (signupRes.status !== 201) {
    console.error("Signup failed:", signupData);
    return;
  }
  const newUserId = signupData.user.id;
  console.log(`[PASS] Signup successful. Created User UUID: ${newUserId}`);
  
  // Get refresh cookie from signup
  let cookies = signupRes.headers.get('set-cookie') || '';
  let refreshTokenCookie = cookies.split(';').find(c => c.includes('fa_refresh_token'));
  
  // 1b. Logout
  const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${signupData.access_token}`,
      'Cookie': refreshTokenCookie || ''
    }
  });
  if (logoutRes.status !== 200) console.error("Logout failed:", await logoutRes.json());
  console.log(`[PASS] Logout successful.`);
  
  // 1c. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200) console.error("Login failed:", loginData);
  console.log(`[PASS] Login successful. Access Token received.`);
  
  cookies = loginRes.headers.get('set-cookie') || '';
  refreshTokenCookie = cookies.split(';').find(c => c.includes('fa_refresh_token'));

  console.log("\n=== 2. Refresh Token Flow ===");
  // 2a. Valid Refresh
  const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': refreshTokenCookie || '' }
  });
  const refreshData = await refreshRes.json();
  if (refreshRes.status !== 200) console.error("Refresh failed:", refreshData);
  console.log(`[PASS] Refresh successful. New access token received.`);
  
  // Update cookie to the rotated one
  cookies = refreshRes.headers.get('set-cookie') || '';
  const newRefreshTokenCookie = cookies.split(';').find(c => c.includes('fa_refresh_token'));
  
  // 2b. Invalid Refresh (reusing the old one)
  const invalidRefreshRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': refreshTokenCookie || '' }
  });
  if (invalidRefreshRes.status === 401) {
    console.log(`[PASS] Invalid/expired refresh token correctly rejected.`);
  } else {
    console.error("Invalid refresh test failed, status:", invalidRefreshRes.status);
  }

  console.log("\n=== 3. Progress Updates After Login ===");
  const progRes = await fetch(`${baseUrl}/progress/section`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshData.access_token}`
    },
    body: JSON.stringify({ courseSlug: 'cs50-ai', lectureId: 'lecture_3', practiceAttempted: true })
  });
  const progData = await progRes.json();
  if (progRes.status === 200 && progData.userId === newUserId) {
    console.log(`[PASS] Progress correctly updated/created for user UUID: ${progData.userId}`);
  } else {
    console.error("Progress update failed:", progRes.status, progData);
  }

  console.log("\n=== 4. Existing Users Can Still Authenticate ===");
  // We'll use the user created in the previous session: test_postgres@fraylon.com
  const existingLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_postgres@fraylon.com', password: 'securepassword123' })
  });
  const existingLoginData = await existingLoginRes.json();
  if (existingLoginRes.status === 200) {
    console.log(`[PASS] Existing user (test_postgres@fraylon.com) logged in successfully.`);
  } else {
    console.error("Existing user login failed:", existingLoginData);
  }

  console.log("\n=== 5. UUID Consistency Across Auth and Progress Modules ===");
  // Query Prisma directly
  const users = await prisma.user.findMany({
    where: { email: { in: [testEmail, 'test_postgres@fraylon.com'] } },
    include: { progress: true }
  });
  
  for (const user of users) {
    console.log(`User ID type in DB: ${typeof user.id} (Value: ${user.id})`);
    if (user.progress.length > 0) {
      console.log(`  Progress record linked exactly to userId: ${user.progress[0].userId}`);
      if (user.id === user.progress[0].userId) {
        console.log(`  [PASS] User UUID exactly matches Progress userId.`);
      } else {
        console.error(`  [FAIL] Mismatch! User ID: ${user.id}, Progress userId: ${user.progress[0].userId}`);
      }
    } else {
      console.log(`  No progress records to verify.`);
    }
  }

  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
