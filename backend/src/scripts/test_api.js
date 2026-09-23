async function run() {
  try {
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: 'admin@sdm.com', password: 'admin' })
    });
    const login = await loginRes.json();
    const token = login.token;
    if (token) {
        console.log("Full Login Response:", JSON.stringify(login, null, 2));
        const res = await fetch('http://localhost:5001/api/admin/staff', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("Logged in Admin name:", login.user.name);
        console.log("Successfully fetched Staff Count:", data.length);
    } else {
        console.log("Login failed:", login);
    }
  } catch(e) {
    console.log("Error:", e.message);
  }
}
run();
