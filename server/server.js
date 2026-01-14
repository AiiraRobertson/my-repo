require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const EMAIL_SECRET = process.env.EMAIL_SECRET || 'dev-secret-change-me';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@localhost';

app.use(cors());
app.use(bodyParser.json());

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const fs = require('fs').promises;
const path = require('path');
const USERS_DB = path.join(__dirname, 'data', 'users.json');

async function readUsers() {
    try {
        const txt = await fs.readFile(USERS_DB, 'utf8');
        return JSON.parse(txt || '{}');
    } catch (err) {
        if (err.code === 'ENOENT') return {};
        throw err;
    }
}
async function writeUsers(obj) {
    await fs.writeFile(USERS_DB, JSON.stringify(obj, null, 2), 'utf8');
}

async function sendEmailViaSendGrid(to, subject, html) {
    const msg = { to, from: FROM_EMAIL, subject, html };
    return sgMail.send(msg);
}

async function sendEmailViaSMTP(to, subject, html) {
    // If SMTP not configured, use ethereal (nodemailer) for local testing
    let transporter;
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass }
        });
    }

    const info = await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
    return info;
}

app.post('/api/send-verification', async (req, res) => {
    const { email } = req.body || {};
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

    const token = createVerificationToken(email);
    const verifyUrl = (req.headers['x-forwarded-proto'] || req.protocol) + '://' + req.get('host') + '/verify?token=' + token;

    const subject = 'Verify your DistroMusic account';
    const html = `
    <p>Hi,</p>
    <p>Click the link below to verify your email for DistroMusic:</p>
    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    <p>This link expires in 24 hours.</p>
  `;

    // persist token & pending verification to users DB
    try {
        const users = await readUsers();
        const now = Date.now();
        users[email] = users[email] || { email, createdAt: now };
        users[email].verificationToken = token;
        users[email].tokenExpires = now + 24 * 3600 * 1000;
        users[email].verified = users[email].verified || false;
        await writeUsers(users);
    } catch (err) {
        console.error('Failed to persist verification token', err);
    }

    try {
        if (process.env.SENDGRID_API_KEY) {
            await sendEmailViaSendGrid(email, subject, html);
            return res.json({ ok: true, provider: 'sendgrid' });
        }

        const info = await sendEmailViaSMTP(email, subject, html);
        // If using ethereal, return preview URL for testing
        let preview = null;
        if (info && info.messageId && nodemailer.getTestMessageUrl) {
            preview = nodemailer.getTestMessageUrl(info);
        }
        // In development include token for easier local testing (do not expose in prod)
        const response = { ok: true, provider: 'smtp', preview };
        if (preview || process.env.NODE_ENV === 'development') response.token = token;
        return res.json(response);
    } catch (err) {
        console.error('Email send error', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
});

// Verify token via API (returns email if valid)
app.post('/api/verify-token', async (req, res) => {
    const token = req.body && req.body.token || req.query.token;
    if (!token) return res.status(400).json({ error: 'Missing token' });
    try {
        const payload = jwt.verify(token, EMAIL_SECRET);
        const users = await readUsers();
        const u = users[payload.email];
        if (!u) return res.status(400).json({ error: 'Unknown user' });
        if (u.verificationToken !== token) return res.status(400).json({ error: 'Token mismatch' });
        if (!u.tokenExpires || u.tokenExpires < Date.now()) return res.status(400).json({ error: 'Token expired' });

        u.verified = true;
        u.verifiedAt = Date.now();
        delete u.verificationToken;
        delete u.tokenExpires;
        await writeUsers(users);

        return res.json({ ok: true, email: payload.email });
    } catch (err) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
});

// Verify URL endpoint (link in email)
app.get('/verify', async (req, res) => {
    const { token } = req.query || {};
    if (!token) return res.status(400).send('Missing token');

    try {
        const payload = jwt.verify(token, EMAIL_SECRET);
        // Update user record to mark verified if token matches
        try {
            const users = await readUsers();
            const u = users[payload.email];
            if (u && u.verificationToken === token && u.tokenExpires && u.tokenExpires > Date.now()) {
                u.verified = true;
                u.verifiedAt = Date.now();
                delete u.verificationToken;
                delete u.tokenExpires;
                await writeUsers(users);
            }
        } catch (err) {
            console.error('Failed updating user record on verify', err);
        }

        const redirectUrl = '/recipe/dashboard.html?verified=1&email=' + encodeURIComponent(payload.email) + '&token=' + encodeURIComponent(token);
        return res.redirect(302, redirectUrl);
    } catch (err) {
        console.error('Token verify failed', err);
        return res.status(400).send('Invalid or expired token');
    }
});

// user status endpoint
app.get('/api/user-status', async (req, res) => {
    const email = req.query.email || (req.body && req.body.email);
    if (!email) return res.status(400).json({ error: 'Missing email' });
    try {
        const users = await readUsers();
        const u = users[email];
        return res.json({ ok: true, email, verified: !!(u && u.verified), verifiedAt: u && u.verifiedAt });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to read user status' });
    }
});

// Verify token via API (returns email if valid)
app.post('/api/verify-token', (req, res) => {
    const token = req.body && req.body.token || req.query.token;
    if (!token) return res.status(400).json({ error: 'Missing token' });
    try {
        const payload = jwt.verify(token, EMAIL_SECRET);
        return res.json({ ok: true, email: payload.email });
    } catch (err) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
});

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

// Development helper: list users (only in development)
app.get('/api/users', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') return res.status(403).json({ error: 'Forbidden' });
    const users = await readUsers();
    res.json(users);
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));