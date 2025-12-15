# Quick Start Guide

Get your Teachable Streak Tracker widget deployed and running in 10 minutes!

## 1. Install Dependencies

```bash
cd teachable-streak-app
npm install
```

## 2. Start the Server

```bash
npm start
```

You should see:
```
🔥 Teachable Streak Tracker running on port 3000
📊 Visit http://localhost:3000 to view the widget
```

## 3. Test the Code Generator

1. Open http://localhost:3000/generator.html in your browser
2. Click "Generate Widget Code"
3. You should see generated code appear below
4. The preview will show a demo streak widget

## 4. Test Streak Logic

**Check stored data:**
1. Open `data/streaks.json`
2. You should see an entry with a guest ID (since you're not on Teachable)
3. Check the `currentStreak`, `lastVisitDate`, and `totalVisits`

**Simulate next day visit:**
1. Stop the server (Ctrl+C)
2. Open `data/streaks.json`
3. Find your guest ID entry and change `lastVisitDate` to yesterday:
   ```json
   {
     "guest_1734567890_abc123": {
       "lastVisitDate": "2025-12-14",  // Change to yesterday
       "currentStreak": 1,
       ...
     }
   }
   ```
4. Start server: `npm start`
5. Refresh the generator page → Preview shows 2 day streak!

**Simulate streak break:**
1. Change `lastVisitDate` to 3 days ago
2. Refresh → Streak resets to 1

## 5. Deploy to Render (Free)

**One-time setup:**

1. Create GitHub repo:
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create teachable-streak-tracker --public --source=. --remote=origin --push
```

2. Go to [render.com](https://render.com) and sign up

3. Click "New +" → "Web Service"

4. Connect your GitHub repo

5. Configure:
   - **Name**: teachable-streak-tracker
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Click "Create Web Service"

6. Wait 2-3 minutes for deployment

7. Your app is live! 🚀
   Visit: `https://teachable-streak-tracker.onrender.com`

## 6. Add Widget to Teachable

**Generate the code:**
1. Visit: `https://teachable-streak-tracker.onrender.com/generator.html`
2. Verify API URL is set to production
3. Click "Generate Widget Code"
4. Click "📋 Copy" to copy the generated code

**Add to Teachable:**
1. Go to Teachable Admin → **Site** → **Code Snippets**
2. Paste the code in **"Header Code"** or **"Footer Code"**
3. Click **Save**

**Test on Teachable:**
1. Visit your Teachable dashboard at `/l/dashboard`
2. The streak widget should appear below the "Welcome back..." greeting
3. Your student ID will be auto-detected from Teachable cookies
4. Each student will see their own personal streak!

## 7. Monitor Engagement

**Check who's using the widget:**
1. Open `data/streaks.json` on your server
2. You'll see entries for each student who visited
3. Student IDs are their Teachable IDs (e.g., "76326411")

**Use API endpoints:**
```bash
# Get overall stats
curl https://teachable-streak-tracker.onrender.com/api/stats

# Get leaderboard (anonymized)
curl https://teachable-streak-tracker.onrender.com/api/leaderboard

# Get specific student's streak
curl https://teachable-streak-tracker.onrender.com/api/streak/76326411
```

## API Testing

Test endpoints with curl:

```bash
# Record a visit
curl -X POST http://localhost:3000/api/visit \
  -H "Content-Type: application/json" \
  -d '{"schoolId": "student123"}'

# Get streak
curl http://localhost:3000/api/streak/student123

# Get leaderboard
curl http://localhost:3000/api/leaderboard

# Get stats
curl http://localhost:3000/api/stats
```

## Troubleshooting

**"Cannot find module 'express'"**
→ Run `npm install`

**"Port 3000 already in use"**
→ Change PORT in `.env` or kill process on port 3000:
```bash
lsof -ti:3000 | xargs kill
```

**"Cannot read property of undefined"**
→ Delete `data/streaks.json` and restart server

**Deployment fails on Render**
→ Check build logs, ensure package.json is correct

## Next Steps

1. ✅ Test locally
2. ✅ Deploy to Render
3. ✅ Test with a few students
4. Gather feedback
5. Customize colors/messages
6. Add more features (leaderboard UI, etc.)

## Need Help?

- Check `README.md` for full documentation
- Review server logs for errors
- Test API endpoints individually
- Verify `data/streaks.json` contents

---

**You're all set! 🎉**

Students can now track their daily learning streaks!
