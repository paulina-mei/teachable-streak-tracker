# How The Teachable Streak Widget Works

Simple explanation of how everything connects!

## The Big Picture

```
┌─────────────────┐
│   Teachable     │
│   Dashboard     │  ← Your students see this
│                 │
│  [Welcome!]     │
│  [Streak Widget]│  ← Widget displays here
│  [Your Courses] │
└─────────────────┘
         ↓
    (Calls API)
         ↓
┌─────────────────┐
│   Your Server   │
│  (Node.js API)  │  ← Tracks all streak data
│                 │
│  Port 3000      │
└─────────────────┘
         ↓
    (Stores data)
         ↓
┌─────────────────┐
│ streaks.json    │
│                 │
│ {              │
│   "paulina.mei"│
│   streak: 5    │
│ }              │
└─────────────────┘
```

## Understanding the API URL

### ❌ What it's NOT
- **NOT** Teachable's API
- **NOT** connecting to Teachable's database
- **NOT** getting data from Teachable

### ✅ What it IS
- **YOUR own backend server** that you run
- A simple Node.js API that stores student streak data
- Independent of Teachable (works standalone)

### The Two Environments

#### 1. Testing (Local)
```
API URL: http://localhost:3000/api
```
- Running on your computer
- Only you can access it
- Perfect for testing

#### 2. Production (Deployed)
```
API URL: https://teachable-streak-tracker.onrender.com/api
```
- Running on a hosting service (like Render)
- Everyone can access it
- Use this for real students

## How a Student Visit Works

**Step 1:** Student visits their Teachable dashboard
```
URL: https://myschool.teachable.com/dashboard
```

**Step 2:** The widget code (that you pasted) runs
```javascript
// Finds the "Welcome back..." heading
const targetEl = document.querySelector('.DashboardGreeting');

// Inserts widget right after it
```

**Step 3:** Widget calls YOUR API
```javascript
fetch('http://localhost:3000/api/visit', {
  method: 'POST',
  body: JSON.stringify({ schoolId: 'paulina.mei' })
})
```

**Step 4:** Your server receives the request
```javascript
// server.js
app.post('/api/visit', async (req, res) => {
  const { schoolId } = req.body;

  // Load student's data
  const data = await getStudentStreak(schoolId);

  // Calculate if streak should increment
  if (visitedYesterday) {
    data.currentStreak += 1;
  }

  // Save and return
  await saveStudentStreak(data);
  res.json(data);
});
```

**Step 5:** Widget displays the streak
```javascript
// Shows: "5 days in a row! 🔥"
```

## The Data Flow

### What Gets Stored?
```json
{
  "paulina.mei": {
    "schoolId": "paulina.mei",
    "currentStreak": 5,
    "longestStreak": 7,
    "lastVisitDate": "2025-12-15",
    "visitDates": ["2025-12-11", "2025-12-12", "2025-12-13", "2025-12-14", "2025-12-15"],
    "totalVisits": 5
  },
  "student.two": {
    "schoolId": "student.two",
    "currentStreak": 3,
    ...
  }
}
```

### Where Is It Stored?
- **Testing:** `teachable-streak-app/data/streaks.json` (your computer)
- **Production:** Same file on your deployed server

## Example: Complete Journey

**Day 1 (Monday):**
1. Paulína visits dashboard
2. Widget sees: "No data for paulina.mei"
3. Creates new record: `currentStreak: 1`
4. Shows: "1 day in a row! Welcome! 🎉"

**Day 2 (Tuesday):**
1. Paulína visits dashboard
2. Widget sees: `lastVisitDate: Monday`
3. Calculates: "That was yesterday! Increment!"
4. Updates: `currentStreak: 2`
5. Shows: "2 days in a row! Keep it going! 🌟"

**Day 4 (Thursday - Missed Wednesday):**
1. Paulína visits dashboard
2. Widget sees: `lastVisitDate: Tuesday`
3. Calculates: "More than 1 day ago! Reset!"
4. Updates: `currentStreak: 1`
5. Shows: "1 day in a row! You're back! 💪"
6. BUT: `longestStreak: 2` (remembers the record!)

## Why This Approach?

### ✅ Advantages
1. **Simple:** No Teachable API authentication needed
2. **Independent:** Works without Teachable access
3. **Flexible:** You control all the data and logic
4. **Free:** No external services required
5. **Privacy:** Data stays with you

### ⚠️ Limitations
1. **Manual IDs:** Students need to enter their School ID
2. **Separate System:** Not integrated with Teachable's database
3. **No Auto-Sync:** Can't pull student data from Teachable automatically

## Integration Options

### Current Approach (Simple)
- Student enters School ID manually
- Widget tracks visits
- No Teachable integration needed
- ✅ Perfect for POC/testing

### Future Enhancement (Advanced)
If you want to auto-identify students from Teachable:
1. Use Teachable's API to get student email
2. Pass email as School ID
3. No manual entry needed
4. Requires Teachable API key

## Common Questions

**Q: Does this work if students use different devices?**
A: Yes! Because data is stored on YOUR server, not in their browser.

**Q: What happens if my server goes down?**
A: Widget shows "Failed to load streak" message. When server comes back, all data is still there.

**Q: Can I see all students' streaks?**
A: Yes! Check `data/streaks.json` or use `/api/stats` endpoint.

**Q: What if I want to use a real database instead of JSON?**
A: See `DATABASE_UPGRADE.md` for PostgreSQL/MongoDB setup.

**Q: How do I deploy this so my students can use it?**
A: See `QUICKSTART.md` - deploy to Render in 5 minutes!

**Q: Does each student get their own widget?**
A: Yes! Each student enters their unique School ID and gets their own tracked streak.

## Security Note

⚠️ **For POC/Testing:**
Current setup is fine - anyone can submit any School ID.

⚠️ **For Production:**
Consider adding:
- API key validation
- Rate limiting
- School ID verification
- HTTPS only

See `README.md` security section for details.

---

**Bottom Line:** Your API server is a simple tracker that sits between Teachable and your students. It doesn't talk to Teachable - it just displays on Teachable pages and stores streak data independently.
