# Database Upgrade Guide

When you're ready to move from JSON file storage to a production database, follow this guide.

## Why Upgrade?

**JSON file storage is great for:**
- ✅ POC/testing
- ✅ Quick setup
- ✅ No external dependencies
- ✅ Easy to inspect data

**But has limitations:**
- ❌ No concurrent writes (can lose data)
- ❌ Entire file loaded into memory
- ❌ No query optimization
- ❌ File size grows indefinitely
- ❌ No built-in backups

**Upgrade when:**
- You have 100+ students
- Multiple concurrent users
- Need reliability
- Want advanced queries (analytics, reports)

---

## Option 1: PostgreSQL (Recommended)

### Step 1: Setup PostgreSQL

**Free hosted option - Render:**
1. Go to render.com
2. Click "New +" → "PostgreSQL"
3. Choose free tier
4. Copy the connection string

**Free hosted option - Neon:**
1. Go to neon.tech
2. Create free database
3. Copy connection string

### Step 2: Install Dependencies

```bash
npm install pg
```

### Step 3: Update server.js

Replace the JSON file functions with PostgreSQL:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Create table (run once)
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS streaks (
      school_id VARCHAR(255) PRIMARY KEY,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_visit_date DATE,
      visit_dates JSONB DEFAULT '[]'::jsonb,
      total_visits INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_current_streak ON streaks(current_streak DESC);
  `);
}

// Get student streak
async function getStudentStreak(schoolId) {
  const result = await pool.query(
    'SELECT * FROM streaks WHERE school_id = $1',
    [schoolId]
  );

  if (result.rows.length === 0) {
    return {
      schoolId,
      currentStreak: 0,
      longestStreak: 0,
      lastVisitDate: null,
      visitDates: [],
      totalVisits: 0
    };
  }

  const row = result.rows[0];
  return {
    schoolId: row.school_id,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastVisitDate: row.last_visit_date,
    visitDates: row.visit_dates || [],
    totalVisits: row.total_visits,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Save student streak
async function saveStudentStreak(data) {
  await pool.query(`
    INSERT INTO streaks (
      school_id, current_streak, longest_streak,
      last_visit_date, visit_dates, total_visits, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (school_id)
    DO UPDATE SET
      current_streak = $2,
      longest_streak = $3,
      last_visit_date = $4,
      visit_dates = $5,
      total_visits = $6,
      updated_at = NOW()
  `, [
    data.schoolId,
    data.currentStreak,
    data.longestStreak,
    data.lastVisitDate,
    JSON.stringify(data.visitDates),
    data.totalVisits
  ]);
}

// Update calculateStreak to use new functions
async function calculateStreak(schoolId) {
  const data = await getStudentStreak(schoolId);
  // ... rest of logic stays the same ...
  await saveStudentStreak(data);
  return data;
}

// Start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🔥 Server running on port ${PORT}`);
  });
}
```

### Step 4: Add Environment Variable

Add to `.env`:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Step 5: Deploy

Push to your hosting platform. It will use the new DATABASE_URL automatically.

---

## Option 2: MongoDB

### Step 1: Setup MongoDB

**Free hosted option - MongoDB Atlas:**
1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for testing)
5. Copy connection string

### Step 2: Install Dependencies

```bash
npm install mongoose
```

### Step 3: Create Model

Create `models/Streak.js`:

```javascript
const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastVisitDate: {
    type: String,
    default: null
  },
  visitDates: {
    type: [String],
    default: []
  },
  totalVisits: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Streak', streakSchema);
```

### Step 4: Update server.js

```javascript
const mongoose = require('mongoose');
const Streak = require('./models/Streak');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Get student streak
async function getStudentStreak(schoolId) {
  let streak = await Streak.findOne({ schoolId });

  if (!streak) {
    return {
      schoolId,
      currentStreak: 0,
      longestStreak: 0,
      lastVisitDate: null,
      visitDates: [],
      totalVisits: 0
    };
  }

  return streak.toObject();
}

// Save student streak
async function saveStudentStreak(data) {
  await Streak.findOneAndUpdate(
    { schoolId: data.schoolId },
    data,
    { upsert: true, new: true }
  );
}
```

### Step 5: Add Environment Variable

Add to `.env`:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/streaks?retryWrites=true&w=majority
```

---

## Option 3: Supabase (PostgreSQL + Auth)

Great option if you want to add authentication later!

### Step 1: Setup

1. Go to supabase.com
2. Create new project
3. Copy URL and anon key

### Step 2: Install

```bash
npm install @supabase/supabase-js
```

### Step 3: Create Table

In Supabase dashboard, run SQL:

```sql
CREATE TABLE streaks (
  school_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_visit_date DATE,
  visit_dates JSONB DEFAULT '[]'::jsonb,
  total_visits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Step 4: Use in Code

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function getStudentStreak(schoolId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('school_id', schoolId)
    .single();

  if (error || !data) {
    return { schoolId, currentStreak: 0, ... };
  }

  return data;
}

async function saveStudentStreak(data) {
  await supabase
    .from('streaks')
    .upsert({
      school_id: data.schoolId,
      current_streak: data.currentStreak,
      longest_streak: data.longestStreak,
      last_visit_date: data.lastVisitDate,
      visit_dates: data.visitDates,
      total_visits: data.totalVisits,
      updated_at: new Date().toISOString()
    });
}
```

---

## Migration Script

To migrate existing JSON data to database:

### For PostgreSQL:

```javascript
// migrate.js
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const jsonData = JSON.parse(fs.readFileSync('./data/streaks.json', 'utf8'));

  for (const [schoolId, data] of Object.entries(jsonData)) {
    await pool.query(`
      INSERT INTO streaks (school_id, current_streak, longest_streak, last_visit_date, visit_dates, total_visits)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (school_id) DO NOTHING
    `, [
      schoolId,
      data.currentStreak,
      data.longestStreak,
      data.lastVisitDate,
      JSON.stringify(data.visitDates),
      data.totalVisits
    ]);
  }

  console.log('Migration complete!');
  process.exit(0);
}

migrate();
```

Run: `node migrate.js`

---

## Comparison Table

| Feature | JSON File | PostgreSQL | MongoDB | Supabase |
|---------|-----------|------------|---------|----------|
| Setup Time | 0 min | 10 min | 10 min | 10 min |
| Free Tier | ✅ | ✅ | ✅ | ✅ |
| Concurrent Users | ❌ | ✅ | ✅ | ✅ |
| Query Speed | Slow | Fast | Fast | Fast |
| Scalability | Poor | Excellent | Excellent | Excellent |
| Backup | Manual | Auto | Auto | Auto |
| Auth Built-in | ❌ | ❌ | ❌ | ✅ |
| Best For | POC | Production | Production | Production+Auth |

## Recommendation

1. **POC/Testing (<50 students)**: Keep JSON
2. **Production (<1000 students)**: PostgreSQL on Render
3. **Production + Future Auth**: Supabase
4. **Large Scale**: MongoDB Atlas or AWS RDS

---

## Testing After Migration

1. Deploy with new database
2. Test one student:
   ```bash
   curl -X POST https://your-app.com/api/visit \
     -H "Content-Type: application/json" \
     -d '{"schoolId": "test123"}'
   ```
3. Verify in database dashboard
4. Test with multiple concurrent users
5. Monitor performance

---

**Questions?** Check the main README.md or test locally first!
