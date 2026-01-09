# Mini Social Media Platform

A full-stack social media application with user profiles, posts, comments, likes, and a follow system.

## Features Implemented

✅ **User Authentication**
- User registration with validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Token stored in localStorage

✅ **User Profiles**
- View user profiles with bio and avatar
- Follow/unfollow users
- Track followers and following counts
- View user's posts

✅ **Posts**
- Create posts with text content
- Delete own posts
- Update posts (backend ready)
- View feed of all posts
- Display post creation time with relative date format

✅ **Likes System**
- Like/unlike posts
- Real-time like count updates
- Visual feedback for liked posts

✅ **Comments**
- Add comments to posts
- View all comments on a post
- Delete own comments
- Display commenter info and timestamp

✅ **Follow System**
- Follow/unfollow other users
- See follower and following counts
- Profile view with follow button

✅ **Responsive Design**
- Beautiful gradient authentication UI
- Clean, modern feed design
- Mobile-responsive layout
- Proper spacing and typography

## Tech Stack

**Frontend:**
- HTML5
- CSS3 (Custom styling)
- Vanilla JavaScript (ES6+)
- Font Awesome icons

**Backend:**
- Node.js + Express.js
- SQLite3 database
- JWT authentication
- bcryptjs password hashing
- CORS enabled

**Database:**
- SQLite with tables for:
  - Users
  - Posts
  - Comments
  - Likes
  - Followers

## Installation & Running

### Backend Setup

```bash
cd backend
npm install
```

### Start Backend

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Backend runs on `http://localhost:5000`

### Frontend Setup

**Option 1: Using npx serve**
```bash
cd frontend
npx serve -l 3000 .
# Open http://localhost:3000
```

**Option 2: Using Python simple server**
```bash
cd frontend
python -m http.server 3000
# Open http://localhost:3000
```

**Option 3: Open index.html directly**
```bash
# Simply double-click frontend/index.html
# Note: May have CORS issues, better to use a local server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts (feed)
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post (own posts only)
- `DELETE /api/posts/:id` - Delete post (own posts only)
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/:id/comments` - Get comments for post
- `POST /api/posts/:id/comments` - Add comment to post
- `DELETE /api/posts/:postId/comments/:commentId` - Delete comment

### Users
- `GET /api/users/:username` - Get user profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/:id/posts` - Get user's posts

## How to Test

### 1. Register a New User
1. Go to the app in browser
2. Click "Register"
3. Enter name, username, email, password, and optional bio
4. Click "Register" button

### 2. Login
1. Enter email and password from registration
2. Click "Login"

### 3. Create Posts
1. Once logged in, type in the "What's on your mind?" textarea
2. Click "Post" button
3. Post appears at the top of feed

### 4. Like Posts
1. Click the heart icon on any post
2. Heart turns red and like count increases
3. Click again to unlike

### 5. Add Comments
1. Click "Comment" button on a post
2. Type comment in modal
3. Click "Comment" button in modal
4. Comment appears in list

### 6. Follow Users
1. Click "Profile" button on any post
2. In profile modal, click "Follow" button
3. Button changes to "Unfollow"
4. User's followers count increases

### 7. View Your Profile
1. Click "Profile" in header navigation
2. See your posts and stats

### 8. Delete Content
1. For own posts: Click trash icon in post header
2. For own comments: Click trash icon in comment
3. Confirm deletion

## File Structure

```
.
├── backend/
│   ├── config/
│   │   ├── database.js       # SQLite setup
│   │   └── database.sqlite   # Database file (auto-created)
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── posts.js          # Posts and comments endpoints
│   │   └── users.js          # User profile and follow endpoints
│   ├── .env                  # Environment variables
│   ├── server.js             # Express server setup
│   └── package.json          # Backend dependencies
│
├── frontend/
│   ├── index.html            # Main HTML
│   ├── style.css             # Styling
│   ├── auth.js               # Authentication functions
│   ├── app.js                # Main app functions (posts, feed, profile)
│   └── assets/               # (Optional) Images, icons
```

## Environment Variables

Create a `.env` file in the `backend` directory:

```
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

## Notes

- JWT secret is used for token signing. Change it in production!
- SQLite database is stored at `backend/config/database.sqlite`
- CORS is enabled for frontend requests
- All passwords are hashed with bcryptjs before storage
- Frontend stores auth token in localStorage

## Future Enhancements

- Edit posts (frontend UI)
- Search functionality
- Hashtags and mentions
- Direct messaging
- Post sharing
- Image upload for posts and profiles
- Email verification
- Password reset
- User notifications
- Admin dashboard

## License

Open source - feel free to modify and use!
