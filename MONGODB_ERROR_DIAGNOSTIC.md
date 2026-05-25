# Diagnostic: "Client must be connected before running operations"

## Summary

This is a **Mongoose/MongoDB server-side error** — not a frontend bug.  
It is thrown by the backend Node.js server when a database query runs before the MongoDB connection is ready or after it has dropped.

---

## Root Causes

| # | Cause | Likelihood |
|---|---|---|
| 1 | MongoDB Atlas **free-tier cluster auto-paused** (inactive 60+ days) | ⭐ Most likely |
| 2 | Backend starts and a request arrives **before `mongoose.connect()` resolves** | Common |
| 3 | MongoDB connection **dropped** (network timeout, Atlas maintenance) and no reconnect logic | Common |
| 4 | `MONGODB_URI` environment variable **missing or wrong** in production | Possible |
| 5 | Backend **crashed and restarted** but connection pool didn't re-establish in time | Possible |

---

## Immediate Fix — Check Atlas Cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Select your project → **Clusters**
3. If the cluster shows **"Paused"** → click **Resume**
4. Wait ~2 minutes for the cluster to wake up
5. Retry the request on [https://app.talentai.bid/signin/](https://app.talentai.bid/signin/)

> Free-tier (M0) clusters auto-pause after **60 days of inactivity**.

---

## Backend Code Fixes

### 1. Ensure `mongoose.connect()` is awaited before `app.listen()`

```js
// ✅ Correct
async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
start();

// ❌ Wrong — requests can arrive before DB is ready
mongoose.connect(process.env.MONGODB_URI);
app.listen(PORT);
```

### 2. Add reconnect resilience

```js
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,  // fail fast if no server found
  heartbeatFrequencyMS: 2000,       // check connection health every 2s
  maxPoolSize: 10,
});

mongoose.connection.on('connected',    () => console.log('MongoDB connected'));
mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected — attempting reconnect');
  mongoose.connect(process.env.MONGODB_URI);
});
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
```

### 3. Add a readiness check middleware

```js
// Block requests until DB is ready
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Service temporarily unavailable — DB not ready' });
  }
  next();
});
```

---

## Environment Variable Checklist

| Variable | Example value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |

- Verify it is set in the production `.env` or hosting platform (Railway / Render / Vercel / etc.)
- Confirm the Atlas user has **readWrite** permissions on the target database
- Confirm the Atlas **Network Access** whitelist includes `0.0.0.0/0` or the server's IP

---

## How to Read the Full Stack Trace

Check your backend server logs for lines like:

```
MongooseError: Client must be connected before running operations
    at NativeConnection.Collection (/app/node_modules/mongoose/lib/connection.js:...)
    at model.Query._find (...)
```

The frame **above** `mongoose/lib/connection.js` in the stack trace will show exactly which controller/service triggered the query before the connection was ready.

---

## Quick Reference — Mongoose Connection States

| `readyState` | Meaning |
|---|---|
| `0` | Disconnected |
| `1` | Connected ✅ |
| `2` | Connecting |
| `3` | Disconnecting |

```js
// Check in your backend health endpoint
app.get('/health', (req, res) => {
  res.json({ db: mongoose.connection.readyState });
});
```
