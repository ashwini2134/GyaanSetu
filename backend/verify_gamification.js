import { randomUUID } from 'crypto';

const baseUrl = 'http://localhost:3001/api';

async function run() {
  let passedAll = true;
  const logPass = (msg) => console.log(`✅ PASS: ${msg}`);
  const logFail = (msg, err) => {
    console.error(`❌ FAIL: ${msg}`, err || "");
    passedAll = false;
  };

  try {
    // 1. Signup test user
    const email = `gamer_${randomUUID()}@example.com`;
    const password = "Password123!";
    const signupRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: "Gamer User" })
    });
    
    if (signupRes.status !== 201) throw new Error("Signup failed: " + await signupRes.text());
    const signupData = await signupRes.json();
    const accessToken = signupData.access_token;
    if (!accessToken) throw new Error("No access token returned from signup");

    logPass(`User signed up: ${email} with UUID ${signupData.user.id}`);

    const authHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    };

    // 2. Initial /me
    const me1 = await fetch(`${baseUrl}/progress/me`, { headers: authHeaders }).then(r => r.json());
    if (me1.xp !== 0) throw new Error(`Initial XP is ${me1.xp}, expected 0`);
    logPass(`Initial /me XP is 0`);

    // 3. /section with practiceCompleted
    const sectionBody = {
      courseSlug: "test-course",
      lectureId: "lec-1",
      practiceCompleted: true
    };
    const sectionRes = await fetch(`${baseUrl}/progress/section`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(sectionBody)
    });
    if (!sectionRes.ok) throw new Error("Section failed: " + await sectionRes.text());
    
    const me2 = await fetch(`${baseUrl}/progress/me`, { headers: authHeaders }).then(r => r.json());
    if (me2.xp !== 20) throw new Error(`XP after section is ${me2.xp}, expected 20`);
    logPass(`Section practice completed -> XP is 20`);

    // 4. /quiz passed
    const quizBody = {
      courseSlug: "test-course",
      lectureId: "lec-1",
      quizId: "quiz-1",
      score: 8,
      total: 10,
      answers: { q1: "a" }
    };
    const quizRes = await fetch(`${baseUrl}/progress/quiz`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(quizBody)
    });
    if (!quizRes.ok) throw new Error("Quiz failed: " + await quizRes.text());
    
    const me3 = await fetch(`${baseUrl}/progress/me`, { headers: authHeaders }).then(r => r.json());
    if (me3.xp !== 50) throw new Error(`XP after quiz is ${me3.xp}, expected 50`);
    logPass(`Quiz passed -> XP is 50`);

    // 5. /lecture complete
    const lectureBody = {
      courseSlug: "test-course",
      lectureId: "lec-1",
      hasProject: false
    };
    const lectureRes = await fetch(`${baseUrl}/progress/lecture`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(lectureBody)
    });
    if (!lectureRes.ok) throw new Error("Lecture failed: " + await lectureRes.text());
    
    const me4 = await fetch(`${baseUrl}/progress/me`, { headers: authHeaders }).then(r => r.json());
    if (me4.xp !== 100) throw new Error(`XP after lecture is ${me4.xp}, expected 100`);
    if (me4.streak !== 1) logFail(`Streak is ${me4.streak}, expected 1`);
    else logPass(`Lecture completed -> XP is 100, streak is 1`);

    // 6. /projects/complete
    const projectBody = {
      courseSlug: "test-course",
      lectureId: "lec-1",
      projectId: "proj-1"
    };
    const projectRes = await fetch(`${baseUrl}/projects/complete`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(projectBody)
    });
    if (!projectRes.ok) throw new Error("Project failed: " + await projectRes.text());
    
    const me5 = await fetch(`${baseUrl}/progress/me`, { headers: authHeaders }).then(r => r.json());
    if (me5.xp !== 200) throw new Error(`XP after project is ${me5.xp}, expected 200`);
    logPass(`Project completed -> XP is 200`);

    // 7. /leaderboard
    const lbRes = await fetch(`${baseUrl}/progress/leaderboard`, { headers: authHeaders }).then(r => r.json());
    const userInLb = lbRes.leaderboard.find(u => u.email === email);
    if (!userInLb) throw new Error("User not found in leaderboard");
    if (userInLb.score !== 200) throw new Error(`Leaderboard XP is ${userInLb.score}, expected 200`);
    logPass(`Leaderboard sorted and user has 200 XP`);

    // 8. Regression: section without practiceCompleted
    const sectionBody2 = {
      courseSlug: "test-course",
      lectureId: "lec-2",
      practiceAttempted: true
    };
    const sectionRes2 = await fetch(`${baseUrl}/progress/section`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(sectionBody2)
    });
    if (!sectionRes2.ok) throw new Error("Section2 failed: " + await sectionRes2.text());
    
    const me6 = await fetch(`${baseUrl}/progress/me`, { headers: authHeaders }).then(r => r.json());
    if (me6.xp !== 200) throw new Error(`XP after regression check is ${me6.xp}, expected 200`);
    logPass(`Regression check passed -> XP remains 200`);

    console.log(`\nOVERALL STATUS: ${passedAll ? 'PASS' : 'FAIL'}`);
    process.exit(passedAll ? 0 : 1);
  } catch (err) {
    logFail(err.message, err);
    console.log(`\nOVERALL STATUS: FAIL`);
    process.exit(1);
  }
}

run();
