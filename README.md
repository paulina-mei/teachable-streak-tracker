# Teachable Streak Tracker

A gamified streak tracking widget for Teachable students that displays on the student dashboard. Each student's unique ID is automatically extracted from Teachable cookies, providing personalized streak tracking without manual ID entry.

## Features

- **Automatic Student Detection**: Extracts student ID from Teachable cookies (`_hp2_id` or `ajs_user_id`)
- **Personal Streak Tracking**: Each student sees their own individual streak
- **Server-Side Persistence**: Data persists across devices and browsers
- **Automatic Streak Calculation**: Tracks consecutive daily visits
- **Milestone Celebrations**: Special messages at 1, 2, 3, 7, 14, 30, 60, and 100 days
- **Horizontal Dashboard Widget**: Clean, wide layout positioned after the dashboard greeting
- **Stats Display**: View current streak, record, and total visits
- **Dynamic Loading**: Works with Teachable's client-side routing

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Node.js, Express
- **Storage**: JSON file (easily upgradeable to PostgreSQL/MongoDB)
- **Hosting**: Can deploy to Render, Railway, Heroku, DigitalOcean, etc.

## Local Development

### Prerequisites

- Node.js 16+ installed
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Create environment file**:
```bash
cp .env.example .env
```

3. **Start the server**:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

4. **Visit the app**:
Open http://localhost:3000 in your browser

### Testing Locally

For local testing without Teachable cookies:

1. Visit http://localhost:3000/generator.html
2. Click "Generate Widget Code"
3. The widget will use a fallback guest ID stored in localStorage
4. Check `data/streaks.json` to see stored data

### Testing with Production

1. Deploy to Render (see Deployment section)
2. Visit your Teachable dashboard where the widget is installed
3. Your student ID from Teachable cookies will be auto-detected
4. Each refresh on the same day won't increment the streak
5. Return the next day to see the streak increment

### Simulating Different Scenarios

**Test streak increment (recommended method):**
Use the admin backdate endpoint to add historical visits:
```bash
# Add a visit for yesterday
curl -X POST https://your-app-url.onrender.com/api/admin/backdate-visit \
  -H "Content-Type: application/json" \
  -d '{"schoolId":"76326411","date":"2025-12-15"}'
```

**Test multi-day streaks:**
Add multiple backdated visits to simulate consecutive days:
```bash
# Day 1
curl -X POST https://your-app-url.onrender.com/api/admin/backdate-visit \
  -H "Content-Type: application/json" \
  -d '{"schoolId":"76326411","date":"2025-12-14"}'

# Day 2
curl -X POST https://your-app-url.onrender.com/api/admin/backdate-visit \
  -H "Content-Type: application/json" \
  -d '{"schoolId":"76326411","date":"2025-12-15"}'
```

**Reset a student's streak:**
- Delete their entry from `data/streaks.json`
- Or use the admin endpoint to rebuild their streak from specific dates

**Manual testing (alternative method):**
- Edit `data/streaks.json` and change `lastVisitDate` to yesterday's date
- Reload the dashboard to see streak increment

**Test different students:**
- Each student with a different Teachable ID will have their own streak tracked
- Numeric student IDs are automatically extracted from Teachable cookies

## API Endpoints

### `POST /api/visit`
Record a student visit and update streak

**Request Body:**
```json
{
  "schoolId": "76326411",
  "schoolRef": "1371193"
}
```
*Note: `schoolId` (the individual student's unique ID) and `schoolRef` (the school ID for reference) are automatically extracted from Teachable cookies by the widget.*

**Response:**
```json
{
  "schoolId": "76326411",
  "schoolRef": "1371193",
  "currentStreak": 5,
  "longestStreak": 7,
  "lastVisitDate": "2025-12-15",
  "visitDates": ["2025-12-11", "2025-12-12", "2025-12-13", "2025-12-14", "2025-12-15"],
  "totalVisits": 5,
  "isNewVisit": true,
  "isMilestone": false,
  "isNewUser": false
}
```

### `POST /api/admin/backdate-visit`
**Admin endpoint** - Manually add a backdated visit (for demo/testing purposes)

⚠️ **Use with caution** - This endpoint bypasses normal visit logic and directly modifies streak data.

**Request Body:**
```json
{
  "schoolId": "76326411",
  "date": "2025-12-15"
}
```

**Response:**
```json
{
  "schoolId": "76326411",
  "schoolRef": "1371193",
  "currentStreak": 2,
  "longestStreak": 2,
  "lastVisitDate": "2025-12-16",
  "visitDates": ["2025-12-15", "2025-12-16"],
  "totalVisits": 2,
  "createdAt": "2025-12-15T15:04:26.586Z",
  "updatedAt": "2025-12-16T13:45:45.427Z"
}
```

**Example Usage:**
```bash
# Add a backdated visit for demo purposes
curl -X POST https://your-app-url.onrender.com/api/admin/backdate-visit \
  -H "Content-Type: application/json" \
  -d '{"schoolId":"76326411","date":"2025-12-15"}'
```

**Use Cases:**
- Restore streak data after Render deploys (free tier has ephemeral disk)
- Prepare demo data with multi-day streaks
- Test streak calculation logic with historical dates

**Production Note:** For production use, consider adding authentication/authorization to this endpoint.

### `GET /api/streak/:schoolId`
Get student streak without recording a visit

**Example:**
```bash
curl https://your-app-url.onrender.com/api/streak/76326411
```

### `GET /api/leaderboard`
Get top 10 students by current streak (anonymized)

**Example:**
```bash
curl https://your-app-url.onrender.com/api/leaderboard
```

**Response:**
```json
[
  {
    "schoolId": "763***",
    "currentStreak": 15,
    "longestStreak": 20
  },
  ...
]
```

### `GET /api/stats`
Get overall statistics

**Example:**
```bash
curl https://your-app-url.onrender.com/api/stats
```

**Response:**
```json
{
  "totalStudents": 42,
  "totalVisits": 326,
  "averageStreak": "4.2",
  "longestStreak": 30
}
```

### `GET /api/health`
Health check endpoint

**Example:**
```bash
curl https://your-app-url.onrender.com/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-16T13:45:45.427Z"
}
```

## Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. **Create account** at [render.com](https://render.com)

2. **Push code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create teachable-streak-tracker --public
git push -u origin main
```

3. **Deploy on Render**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: teachable-streak-tracker
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Click "Create Web Service"

4. **Your app URL**: `https://teachable-streak-tracker.onrender.com`

**Note**: Free tier spins down after inactivity. First load may be slow.

### Important: Render Free Tier Limitations

**Data Persistence:**
- ⚠️ JSON file storage is **ephemeral** on Render free tier
- Data is **lost** on redeploys, restarts, or server migrations
- For production, migrate to a database (see "Upgrading Storage" section)

**Service Behavior:**
- Sleeps after **15 minutes** of inactivity
- First request after sleep: **30-60 second delay**
- No limits on visitors or API calls
- 750 hours/month runtime (enough for 24/7)

**For demos/testing:**
- Wake up service 10 minutes before demo (visit any page)
- Don't push code changes before important demos (preserves data)
- Use the admin backdate endpoint to restore test data after deploys

**For production:**
- Upgrade to database (PostgreSQL/MongoDB) for data persistence
- Consider paid tier ($7/month) to eliminate sleep/wake delays

### Option 2: Railway

1. **Create account** at [railway.app](https://railway.app)

2. **Deploy**:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

3. **Add domain**:
   - Go to your project → Settings → Domains
   - Generate domain or add custom domain

### Option 3: Heroku

1. **Install Heroku CLI**:
```bash
brew install heroku/brew/heroku  # macOS
```

2. **Deploy**:
```bash
heroku login
heroku create teachable-streak-tracker
git push heroku main
heroku open
```

### Option 4: DigitalOcean App Platform

1. **Create account** at [digitalocean.com](https://digitalocean.com)

2. **Deploy**:
   - Go to Apps → Create App
   - Connect GitHub repo
   - Configure build settings
   - Deploy

### Option 5: Self-Hosted (VPS)

**Requirements**: Linux server with Node.js

1. **SSH into server**:
```bash
ssh user@your-server-ip
```

2. **Clone and setup**:
```bash
git clone https://github.com/yourusername/teachable-streak-tracker
cd teachable-streak-tracker
npm install
```

3. **Use PM2 for process management**:
```bash
npm install -g pm2
pm2 start server.js --name streak-tracker
pm2 startup
pm2 save
```

4. **Setup Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Embedding in Teachable

Once deployed, use the code generator to create embeddable widget code:

### Step 1: Generate Widget Code

1. Visit your deployed code generator: `https://your-app-url.onrender.com/generator.html`
2. Verify the API URL is set to your production server
3. Click "Generate Widget Code"
4. Copy the generated code

### Step 2: Add to Teachable

1. Go to Teachable Admin → **Site** → **Code Snippets**
2. Paste the code in **"Header Code"** or **"Footer Code"**
3. Click **Save**

### Step 3: Verify

1. Visit your Teachable dashboard at `/l/dashboard`
2. The streak widget should appear below the "Welcome back..." greeting
3. Each student will see their own personal streak automatically

**How it works:**
- Widget only displays on the dashboard page (`/l/dashboard`)
- Student IDs are automatically extracted from Teachable cookies
- Each student sees their own streak data
- Works with Teachable's client-side routing (appears on navigation without page refresh)

## Upgrading Storage

The app currently uses JSON file storage. For production:

### Upgrade to PostgreSQL

1. **Install pg**:
```bash
npm install pg
```

2. **Update server.js** to use PostgreSQL instead of JSON file

3. **Add DATABASE_URL** to environment variables

### Upgrade to MongoDB

1. **Install mongoose**:
```bash
npm install mongoose
```

2. **Update server.js** to use MongoDB

3. **Add MONGODB_URI** to environment variables

## Customization

### Change Colors

Edit `public/index.html` gradients:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modify Milestone Thresholds

Edit `server.js`:
```javascript
const milestones = [3, 7, 14, 30, 60, 100, 365];
```

### Customize Messages

Edit `getEncouragingMessage()` function in `public/index.html`

## How Student ID Detection Works

The widget automatically extracts individual student IDs from Teachable cookies. Since users may have multiple `_hp2_id` cookies (some with emails, some with numeric IDs), the extraction follows this priority:

### Priority Order:

1. **`_hp2_id` cookies (multiple may exist)** - Scans all cookies, **prefers numeric IDs** over emails
2. **`ajs_user_id` cookie** - Fallback Teachable user identifier
3. **localStorage** - Last resort: generates a guest ID and stores it locally

### Example:

You might have two cookies:
```javascript
_hp2_id.3407116132 = {"identity":"user@example.com",...}  // Email - ignored
_hp2_id.318805607  = {"identity":"76326411",...}          // Numeric - USED ✓
```

The widget will select `76326411` (numeric ID) and use it to track your personal streak.

### School Reference:

The school ID (from `_hp2_props.school_id`) is stored as **reference data only**:
```javascript
{
  "76326411": {
    "schoolId": "76326411",     // Primary key (user's unique ID)
    "schoolRef": "1371193",     // Reference (which school they belong to)
    "currentStreak": 5,
    ...
  }
}
```

This ensures each student sees only their own streak data, while maintaining school association for future analytics.

## Data Structure

Student data stored in `data/streaks.json`:
```json
{
  "76326411": {
    "schoolId": "76326411",
    "schoolRef": "1371193",
    "currentStreak": 5,
    "longestStreak": 7,
    "lastVisitDate": "2025-12-15",
    "visitDates": ["2025-12-11", "2025-12-12", "..."],
    "totalVisits": 5,
    "createdAt": "2025-12-11T10:30:00.000Z",
    "updatedAt": "2025-12-15T09:15:00.000Z"
  }
}
```

**Fields:**
- `schoolId` - Primary key (unique user ID from Teachable)
- `schoolRef` - School ID reference (which school the student belongs to)
- `currentStreak` - Current consecutive days
- `longestStreak` - Best streak ever achieved
- `lastVisitDate` - Last visit in YYYY-MM-DD format
- `visitDates` - Array of all visit dates
- `totalVisits` - Total number of visits
- `createdAt` - First visit timestamp
- `updatedAt` - Last update timestamp

## Security Considerations

### For POC/Testing:
- Current setup is fine
- School IDs are not validated
- No authentication required

### For Production:
1. **Add authentication** - Verify school IDs against Teachable API
2. **Rate limiting** - Prevent abuse
3. **HTTPS only** - Use SSL certificates
4. **Input validation** - Sanitize school IDs
5. **Database** - Upgrade from JSON to PostgreSQL/MongoDB
6. **Backup** - Regular data backups
7. **Privacy** - Add terms of service and privacy policy

## Monitoring & Analytics

### Add Google Analytics

Add to `public/index.html` before `</head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Server Logging

The app logs to console. For production, use:
- Winston for structured logging
- Sentry for error tracking
- LogRocket for session replay

## Troubleshooting

**Server won't start:**
- Check Node.js version: `node --version` (needs 16+)
- Verify port 3000 is available
- Check for syntax errors in server.js

**Data not saving:**
- Verify `data/` directory exists and is writable
- Check server logs for errors
- Ensure proper permissions on data directory

**Streak not incrementing:**
- Verify server system clock is correct
- Check `data/streaks.json` for lastVisitDate
- Ensure API endpoint is being called

**Cannot access from external URL:**
- Check firewall rules
- Verify port forwarding
- Ensure server is binding to 0.0.0.0 not localhost

## Future Enhancements

- [ ] Leaderboard display on frontend
- [ ] Email reminders for streak maintenance
- [ ] Teachable API integration for auto-enrollment
- [ ] Push notifications
- [ ] Social sharing of milestones
- [ ] Badges and achievements
- [ ] Export streak history
- [ ] Team/cohort streaks
- [ ] Weekly/monthly reports
- [ ] Integration with Teachable course progress

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Test locally first
4. Check API endpoints with Postman/curl

---

Built with ❤️ for Teachable educators
