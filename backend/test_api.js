const baseUrl = 'http://localhost:3001/api';
let accessToken = '';

async function runTests() {
  console.log('Testing Registration...');
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_postgres@fraylon.com', password: 'securepassword123', name: 'Postgres Tester' })
  });
  const regData = await regRes.json();
  console.log('Registration Status:', regRes.status);
  console.log('Registration Response:', regData);

  console.log('\nTesting Login...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_postgres@fraylon.com', password: 'securepassword123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', loginData);
  accessToken = loginData.access_token;

  console.log('\nTesting Protected Route (Progress update)...');
  const progRes = await fetch(`${baseUrl}/progress/section`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ courseSlug: 'cs50-ai', lectureId: 'lecture_3', practiceAttempted: true })
  });
  const progData = await progRes.json();
  console.log('Progress Status:', progRes.status);
  console.log('Progress Response:', progData);
}

runTests().catch(console.error);
