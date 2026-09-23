async function run() {
  try {
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'ST-0022', password: 'password', role: 'STUDENT' })
    });
    const login = await loginRes.json();
    const token = login.token;
    console.log("Token:", !!token, "User:", login.user);
    
    if (token) {
        const id = login.user.id;
        const res = await fetch(`http://localhost:5001/api/students/${id}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Attendance count:", data.length);
        console.log("Attendance data:", data);
    }
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
