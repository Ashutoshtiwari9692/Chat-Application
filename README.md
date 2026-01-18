# Real-time Chat Application

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for real-time messaging.

## Features

### Authentication

- User signup and login with JWT authentication
- Secure password hashing with bcrypt
- Protected routes requiring authentication
- Persistent login with localStorage
- Logout functionality

### User Profile & Avatar

- User profile with display picture (DP)
- Upload and update profile picture
- Preview before saving avatar
- Remove/reset to default avatar
- Cloudinary integration for image storage (or local fallback)

### Real-time Chat

- One-to-one private messaging
- Real-time message delivery with Socket.io
- User search functionality
- Create new chats or open existing ones
- Online/offline status indicators
- Typing indicators
- Last seen timestamps
- Message history

### UI/UX

- Modern, responsive design with Tailwind CSS
- Sidebar with profile, search, and recent chats
- Chat window with message bubbles
- Different styling for sent vs received messages
- Avatar display in sidebar, chat header, and messages
- Loading states and error handling

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage

### Frontend

- **React** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling

## Project Structure

```
Chat-Application/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── chatController.js
│   │   └── messageController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Chat.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── chatRoutes.js
│   │   └── messageRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js
    │   │   └── socket.js
    │   ├── components/
    │   │   ├── AvatarUpload.jsx
    │   │   ├── ChatWindow.jsx
    │   │   ├── MessageBubble.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ChatContext.jsx
    │   ├── pages/
    │   │   ├── Chat.jsx
    │   │   ├── Login.jsx
    │   │   └── Signup.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (optional, for avatar uploads)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Configure your `.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173

# Optional: For Cloudinary avatar uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start the backend server:

```bash
# Development mode with nodemon
npm run dev

# Or production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### MongoDB Setup

**Option 1: Local MongoDB**

- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/chatapp`

**Option 2: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Cloudinary Setup (Optional)

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from dashboard
3. Update Cloudinary credentials in `.env`
4. If Cloudinary is not configured, avatars will be stored locally in `backend/uploads/`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users

- `GET /api/users/me` - Get user profile (protected)
- `PUT /api/users/me/avatar` - Update avatar (protected)
- `DELETE /api/users/me/avatar` - Remove avatar (protected)
- `GET /api/users/search?q=searchterm` - Search users (protected)

### Chats

- `GET /api/chats` - Get all chats (protected)
- `POST /api/chats` - Create/open chat (protected)
- `GET /api/chats/:id` - Get chat by ID (protected)

### Messages

- `GET /api/messages/:chatId` - Get messages for chat (protected)
- `POST /api/messages` - Send message (protected)

## Socket Events

### Client to Server

- `join` - User joins with userId
- `private_message` - Send private message
- `typing` - Send typing indicator

### Server to Client

- `online_users` - Broadcast online users array
- `private_message` - Receive private message
- `message_sent` - Confirmation of sent message
- `user_typing` - Receive typing indicator

## Usage

1. **Sign Up**: Create a new account with name, email, and password
2. **Login**: Sign in with your credentials
3. **Update Profile**: Click on your avatar in the sidebar to upload a new profile picture
4. **Search Users**: Click "New Chat" to search for users by name or email
5. **Start Chat**: Click on a user from search results to start a conversation
6. **Send Messages**: Type your message and click Send or press Enter
7. **Real-time Updates**: Messages appear instantly, see online status and typing indicators
8. **Logout**: Click Logout to sign out

## Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend URL for CORS
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name (optional)
- `CLOUDINARY_API_KEY` - Cloudinary API key (optional)
- `CLOUDINARY_API_SECRET` - Cloudinary API secret (optional)

## Features in Detail

### Authentication Flow

1. User enters credentials (signup/login)
2. Backend validates and creates/verifies user
3. JWT token generated and sent to client
4. Token stored in localStorage
5. Token sent in Authorization header for protected routes
6. Socket connection established with user ID

### Real-time Messaging

1. User sends message via API
2. Message saved to database
3. Socket event emitted to recipient
4. Recipient receives message instantly
5. Chat list updated with last message

### Avatar Upload

1. User selects image file
2. Preview shown before upload
3. File sent to backend as multipart/form-data
4. Backend uploads to Cloudinary (or saves locally)
5. URL saved to user document
6. UI updated with new avatar

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- CORS configuration
- Input validation
- File upload restrictions (type, size)
- Token verification on socket connections

## Development Tips

- Backend runs on port 5000
- Frontend runs on port 5173
- Vite proxy configured for API and uploads
- Hot reload enabled for both frontend and backend
- Check console for errors and logs
- Use MongoDB Compass to view database

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB
4. Set up Cloudinary for avatars
5. Deploy to Heroku, DigitalOcean, AWS, etc.

### Frontend

1. Build production bundle: `npm run build`
2. Deploy `dist` folder to Netlify, Vercel, etc.
3. Update `CLIENT_URL` in backend .env
4. Update API URL in frontend if needed

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check connection string format
- Verify network access (for MongoDB Atlas)
- Check firewall settings

### Socket.io Connection Issues

- Verify backend server is running
- Check CORS configuration
- Ensure CLIENT_URL matches frontend URL
- Check browser console for errors

### Avatar Upload Issues

- Check Cloudinary credentials
- Verify file size limits
- Ensure uploads directory exists
- Check file type restrictions

## Future Enhancements

- Group chats
- File/image sharing in messages
- Voice/video calls
- Message reactions
- Message read receipts
- User status (away, busy, etc.)
- Push notifications
- Message search
- Dark mode
- Mobile app (React Native)

## License

MIT

## Author

Built with ❤️ using MERN Stack
