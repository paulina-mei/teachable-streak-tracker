# Testing Guide

Follow these steps to test your Teachable Streak Widget locally!

## Step 1: Start the Server

```bash
cd teachable-streak-app
npm install
npm start
```

You should see:
```
🔥 Teachable Streak Tracker running on port 3000
📊 Visit http://localhost:3000 to view the widget
```

## Step 2: Generate Your Widget Code

1. **Open your browser** to http://localhost:3000
2. **Enter your School ID** (e.g., "paulina.mei")
3. **Keep API URL** as `http://localhost:3000/api`
4. **Click "Generate My Widget Code"**
5. **See the preview** at the bottom showing your streak widget!

## Step 3: Test the Embed Code

### Option A: Test in a Local HTML File

1. **Click "Copy"** to copy the generated code
2. **Create a test file** `test-page.html`:

```bash
touch test-page.html
```

3. **Paste this** into `test-page.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Testing Teachable Streak</title>
</head>
<body>
    <h1>My Teachable Dashboard</h1>
    <p>This is where your streak widget will appear:</p>

    <!-- PASTE YOUR GENERATED CODE HERE -->

</body>
</html>
```

4. **Open `test-page.html`** in your browser
5. **See your streak!** 🔥

### Option B: Test the Preview

Just look at the preview section on the generator page - it shows exactly how it will look!

## Step 4: Test Streak Tracking

### See Your Data

Check what's stored:
```bash
cat data/streaks.json
```

You should see:
```json
{
  "paulina.mei": {
    "schoolId": "paulina.mei",
    "currentStreak": 1,
    "longestStreak": 1,
    "lastVisitDate": "2025-12-15",
    "visitDates": ["2025-12-15"],
    "totalVisits": 1,
    ...
  }
}
```

### Test Returning Tomorrow (Simulate)

1. **Stop the server** (Ctrl+C)

2. **Edit** `data/streaks.json` to change `lastVisitDate` to yesterday:
```json
{
  "paulina.mei": {
    "lastVisitDate": "2025-12-14",
    ...
  }
}
```

3. **Restart server**: `npm start`

4. **Refresh your test page** → Streak should now be 2! 🎉

### Test Milestone (Day 7)

1. Edit `data/streaks.json`:
```json
{
  "paulina.mei": {
    "currentStreak": 6,
    "lastVisitDate": "2025-12-14",
    ...
  }
}
```

2. Refresh page → See "One week! Unstoppable! 🚀"

## Step 5: Test with Multiple School IDs

1. Go back to generator: http://localhost:3000
2. Enter different School ID: "student.two"
3. Generate new code
4. Create another test file with that code
5. Check `data/streaks.json` → Now has 2 students!

## Step 6: Test the API Directly

### Record a Visit
```bash
curl -X POST http://localhost:3000/api/visit \
  -H "Content-Type: application/json" \
  -d '{"schoolId": "test123"}'
```

Response:
```json
{
  "schoolId": "test123",
  "currentStreak": 1,
  "longestStreak": 1,
  "lastVisitDate": "2025-12-15",
  ...
}
```

### Get Streak Without Recording
```bash
curl http://localhost:3000/api/streak/paulina.mei
```

### Get Leaderboard
```bash
curl http://localhost:3000/api/leaderboard
```

### Get Stats
```bash
curl http://localhost:3000/api/stats
```

## What You Should See

### First Visit:
- 🔥 Fire icon
- "1 day in a row"
- Message: "Welcome! Your journey begins! 🎉"
- Calendar with today highlighted
- Longest streak: 1
- Total visits: 1

### Second Day (Consecutive):
- "2 days in a row"
- Message: "You're back! Let's build a streak! 💪"
- Calendar with 2 days highlighted

### Milestone (Day 7):
- "7 days in a row"
- Message: "One week! Unstoppable! 🚀"
- Calendar shows full week

### Broken Streak:
- If you skip a day, resets to "1 day in a row"
- But longest streak still shows your record

## Common Issues

**"Failed to load streak"**
- Make sure server is running: `npm start`
- Check API URL in generated code matches your server
- Look at browser console for errors

**"Cannot POST /api/visit"**
- Server isn't running on the expected port
- Check `http://localhost:3000/api/health` works

**Streak not incrementing**
- Check `data/streaks.json` - is `lastVisitDate` today?
- If yes, it won't increment (already visited today)
- Change to yesterday to test increment

**Widget not appearing**
- Check browser console for errors
- Verify you copied the complete code (all 3 sections: div, style, script)
- Make sure the container div exists

## Next Steps - Deploy & Use in Teachable

Once testing works locally:

1. **Deploy to Render** (see QUICKSTART.md)
2. **Update API URL** in generator to your deployed URL:
   - Example: `https://teachable-streak-tracker.onrender.com/api`
3. **Generate production code** with new API URL
4. **Copy and paste** into Teachable custom code section
5. **Students see their streaks** on dashboard!

## Pro Testing Tips

### Reset Everything
```bash
rm data/streaks.json
# Restart server
```

### View Logs
Server logs show every visit:
```
POST /api/visit - student123 - streak: 5
```

### Test Multiple Users at Once
Open multiple browser windows/tabs with different test files (different school IDs)

### Verify Data Persistence
1. Create streak
2. Stop server
3. Start server
4. Refresh page - streak should still be there!

---

**Ready to test?** Start with Step 1! 🚀
