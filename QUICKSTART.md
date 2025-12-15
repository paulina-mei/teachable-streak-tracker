# Quick Start Guide

Get your Teachable Streak Tracker running in 5 minutes!

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

## 3. Test Locally

1. Open http://localhost:3000 in your browser
2. Enter a school ID (anything, e.g., "student123")
3. Click "View My Streak"
4. You should see a beautiful streak widget with confetti! 🎉

## 4. Test Streak Logic

**Day 1 (Today):**
- Visit the page → See 1 day streak

**Simulate Day 2:**
1. Stop the server (Ctrl+C)
2. Open `data/streaks.json`
3. Change the `lastVisitDate` to yesterday:
   ```json
   {
     "student123": {
       "lastVisitDate": "2025-12-14",  // Change to yesterday
       ...
     }
   }
   ```
4. Start server again: `npm start`
5. Refresh page → See 2 day streak!

**Simulate Streak Break:**
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

## 6. Share with Students

Send students the URL:
```
https://teachable-streak-tracker.onrender.com
```

Or embed in Teachable:
```html
<iframe
  src="https://teachable-streak-tracker.onrender.com"
  width="100%"
  height="800px"
  frameborder="0">
</iframe>
```

## Testing with Real Students

**Recommended approach for POC:**

1. Create test school IDs:
   - testuser1
   - testuser2
   - testuser3

2. Share URL + instructions:
   ```
   Track your learning streak! 🔥

   Visit: https://your-app-url.com
   Enter your school ID: [provided by instructor]
   Check daily to build your streak!
   ```

3. Monitor engagement:
   - Check `data/streaks.json` to see who's visiting
   - Use `/api/stats` endpoint to get overview
   - View `/api/leaderboard` to see top performers

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
