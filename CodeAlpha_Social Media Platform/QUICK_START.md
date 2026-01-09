# QUICK START GUIDE - Social Media Platform

## EASIEST WAY - Run START.bat

1. Go to: `C:\Users\Thrisanth\Downloads\social thri\`
2. Double-click **START.bat**
3. Wait 5 seconds - browser opens automatically to http://localhost:3000
4. DONE! App is running

---

## MANUAL START (If batch file doesn't work)

### Terminal 1 - Backend
```
cd C:\Users\Thrisanth\Downloads\social thri\backend
npm install
npm run dev
```
Wait for: `Server running on port 5000`

### Terminal 2 - Frontend
```
cd C:\Users\Thrisanth\Downloads\social thri\frontend
npx serve -l 3000 .
```
Wait for: `Accepting connections at http://localhost:3000`

### Browser
Open: **http://localhost:3000**

---

## REGISTER TEST ACCOUNT

1. Click "Register"
2. Fill in:
   - Name: `Test User`
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Register"

---

## TEST ALL FEATURES

✅ **Post** - Type in "What's on your mind?" → Click Post
✅ **Like** - Click heart icon  
✅ **Comment** - Click comment button → Add comment
✅ **Follow** - Click Profile on post → Click Follow
✅ **View Profile** - Click Profile in top menu

---

## TROUBLESHOOTING

**Port already in use?**
```
Frontend: npx serve -l 3001 .
Then visit: http://localhost:3001
```

**Backend won't start?**
```
cd backend
npm install
npm run dev
```

**Clear data (fresh start)?**
```
Delete: backend/config/database.sqlite
Then restart backend
```

**Browser console errors?**
```
Press F12 → Console → Clear (Ctrl+L)
Refresh page (F5)
```

---

**The app is FULLY FUNCTIONAL - all features work!**
