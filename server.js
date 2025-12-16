const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'streaks.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }

    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify({}));
    }
}

// Utility functions
function getToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function getDateDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
}

// Load all streak data
async function loadAllStreaks() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// Save all streak data
async function saveAllStreaks(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get student streak data
async function getStudentStreak(schoolId) {
    const allData = await loadAllStreaks();
    return allData[schoolId] || {
        schoolId,
        currentStreak: 0,
        longestStreak: 0,
        lastVisitDate: null,
        visitDates: [],
        totalVisits: 0,
        createdAt: new Date().toISOString()
    };
}

// Calculate and update streak
async function calculateStreak(schoolId) {
    const allData = await loadAllStreaks();
    const data = await getStudentStreak(schoolId);
    const today = getToday();
    const todayStr = formatDate(today);

    // Check if already visited today
    if (data.lastVisitDate === todayStr) {
        return {
            ...data,
            alreadyVisitedToday: true,
            isNewVisit: false
        };
    }

    const isNewUser = !data.lastVisitDate;
    let isMilestone = false;

    if (isNewUser) {
        // First visit
        data.currentStreak = 1;
        data.longestStreak = 1;
        data.lastVisitDate = todayStr;
        data.visitDates = [todayStr];
        data.totalVisits = 1;
        isMilestone = true; // First visit is special
    } else {
        const lastVisit = new Date(data.lastVisitDate);
        const daysSinceLastVisit = getDateDifference(today, lastVisit);

        if (daysSinceLastVisit === 1) {
            // Consecutive day - increment streak
            data.currentStreak += 1;
            data.longestStreak = Math.max(data.longestStreak, data.currentStreak);

            // Check if milestone
            const milestones = [3, 7, 14, 30, 60, 100, 365];
            isMilestone = milestones.includes(data.currentStreak);
        } else if (daysSinceLastVisit > 1) {
            // Streak broken - start over
            data.currentStreak = 1;
        }

        data.lastVisitDate = todayStr;
        data.visitDates.push(todayStr);
        data.totalVisits += 1;
    }

    data.updatedAt = new Date().toISOString();

    // Save back to file
    allData[schoolId] = data;
    await saveAllStreaks(allData);

    return {
        ...data,
        alreadyVisitedToday: false,
        isNewVisit: true,
        isMilestone,
        isNewUser
    };
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ADMIN: Manually add a backdated visit (for demo purposes)
app.post('/api/admin/backdate-visit', async (req, res) => {
    const { schoolId, date } = req.body;

    if (!schoolId || !date) {
        return res.status(400).json({ error: 'schoolId and date required (format: YYYY-MM-DD)' });
    }

    try {
        const allData = await loadAllStreaks();
        const data = allData[schoolId] || {
            schoolId,
            currentStreak: 0,
            longestStreak: 0,
            lastVisitDate: null,
            visitDates: [],
            totalVisits: 0,
            createdAt: new Date().toISOString()
        };

        // Add the date if not already present
        if (!data.visitDates.includes(date)) {
            data.visitDates.push(date);
            data.visitDates.sort();
            data.totalVisits = data.visitDates.length;

            // Recalculate streak
            const dates = data.visitDates.map(d => new Date(d)).sort((a, b) => a - b);
            let currentStreak = 1;
            let longestStreak = 1;

            for (let i = dates.length - 1; i > 0; i--) {
                const diff = getDateDifference(dates[i], dates[i - 1]);
                if (diff === 1) {
                    currentStreak++;
                    longestStreak = Math.max(longestStreak, currentStreak);
                } else if (diff > 1) {
                    break;
                }
            }

            data.currentStreak = currentStreak;
            data.longestStreak = Math.max(data.longestStreak, longestStreak);
            data.lastVisitDate = data.visitDates[data.visitDates.length - 1];
            data.updatedAt = new Date().toISOString();

            allData[schoolId] = data;
            await saveAllStreaks(allData);
        }

        res.json(data);
    } catch (error) {
        console.error('Error backdating visit:', error);
        res.status(500).json({ error: 'Failed to backdate visit' });
    }
});

// Get student streak (without incrementing)
app.get('/api/streak/:schoolId', async (req, res) => {
    try {
        const { schoolId } = req.params;

        if (!schoolId || schoolId.trim() === '') {
            return res.status(400).json({ error: 'School ID is required' });
        }

        const data = await getStudentStreak(schoolId);
        res.json(data);
    } catch (error) {
        console.error('Error getting streak:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Record a visit (increments streak)
app.post('/api/visit', async (req, res) => {
    try {
        const { schoolId } = req.body;

        if (!schoolId || schoolId.trim() === '') {
            return res.status(400).json({ error: 'School ID is required' });
        }

        const data = await calculateStreak(schoolId);
        res.json(data);
    } catch (error) {
        console.error('Error recording visit:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get leaderboard (top 10 streaks)
app.get('/api/leaderboard', async (req, res) => {
    try {
        const allData = await loadAllStreaks();
        const leaderboard = Object.values(allData)
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .slice(0, 10)
            .map(student => ({
                schoolId: student.schoolId.substring(0, 3) + '***', // Anonymize
                currentStreak: student.currentStreak,
                longestStreak: student.longestStreak
            }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const allData = await loadAllStreaks();
        const students = Object.values(allData);

        const stats = {
            totalStudents: students.length,
            totalVisits: students.reduce((sum, s) => sum + s.totalVisits, 0),
            averageStreak: students.length > 0
                ? (students.reduce((sum, s) => sum + s.currentStreak, 0) / students.length).toFixed(1)
                : 0,
            longestStreak: students.length > 0
                ? Math.max(...students.map(s => s.longestStreak))
                : 0
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize and start server
async function startServer() {
    await ensureDataDirectory();
    app.listen(PORT, () => {
        console.log(`🔥 Teachable Streak Tracker running on port ${PORT}`);
        console.log(`📊 Visit http://localhost:${PORT} to view the widget`);
    });
}

startServer();
