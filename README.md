# Teachable Streak Tracker

A gamified streak tracking application for Teachable students. Students enter their school ID and track their daily learning streaks with celebrations, milestones, and visual feedback.

## Features

- **Student Identification**: Enter school ID to track individual streaks
- **Server-Side Tracking**: Data persists across devices and browsers
- **Streak Calculation**: Automatic daily streak counting
- **Milestone Celebrations**: Special animations at 3, 7, 14, 30, 60, 100, and 365 days
- **7-Day Calendar**: Visual representation of recent activity
- **Stats Dashboard**: View longest streak and total visits
- **Auto-Login**: Returns to your streak automatically
- **Confetti Animations**: Celebrations for achievements

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

### Testing

1. Enter any school ID (e.g., "student123")
2. See your streak widget
3. Visit data/streaks.json to see stored data
4. Return tomorrow to see streak increment

### Simulating Different Scenarios

**Reset a student's streak:**
- Delete their entry from `data/streaks.json` and restart the server

**Test streak increment:**
- Edit `data/streaks.json` and change `lastVisitDate` to yesterday's date
- Reload the page to see streak increment

## API Endpoints

### `POST /api/visit`
Record a student visit and update streak

**Request Body:**
```json
{
  "schoolId": "student123"
}
```

**Response:**
```json
{
  "schoolId": "student123",
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

### `GET /api/streak/:schoolId`
Get student streak without recording a visit

### `GET /api/leaderboard`
Get top 10 students by current streak (anonymized)

### `GET /api/stats`
Get overall statistics

### `GET /api/health`
Health check endpoint

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

Once deployed, share the URL with students:

**Option 1: Direct Link**
Share `https://your-app-url.com` with students

**Option 2: Embed in Teachable**
Add to Teachable custom code:
```html
<iframe
  src="https://your-app-url.com"
  width="100%"
  height="800px"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>
```

**Option 3: Redirect from Dashboard**
Set up a custom redirect from `/l/dashboard` to your hosted app

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

## Data Structure

Student data stored in `data/streaks.json`:
```json
{
  "student123": {
    "schoolId": "student123",
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
