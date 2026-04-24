# Jira-like Kanban Board - MERN Stack

A modern, production-ready Kanban board application built with the MERN stack (MongoDB, Express, React 19, Node.js). Features drag-and-drop functionality, real-time updates, and a clean, responsive UI.

## Features

### Core Features
- **Board Management**: Create, read, update, and delete boards (projects)
- **Task Management**: Full CRUD operations for tasks with drag-and-drop
- **Drag & Drop**: Intuitive drag-and-drop using @dnd-kit (React 19 compatible)
- **Column Customization**: Configurable columns (Todo, In Progress, Done by default)
- **Task Properties**:
  - Title and description
  - Status (mapped to columns)
  - Priority (Low, Medium, High)
  - Position tracking for consistent ordering
- **Real-time Updates**: State management with React Context API
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Frontend**: React 19 with functional components and hooks
- **Backend**: Express 5 with RESTful API architecture
- **Database**: MongoDB with Mongoose ODM
- **State Management**: React Context API (no Redux overhead)
- **Drag & Drop**: @dnd-kit library with sortable lists
- **API Client**: Axios with interceptors for error handling
- **Modular Architecture**: Clean separation of concerns

## Project Structure

```
task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── Board.js
│   │   │   ├── Column.js
│   │   │   ├── TaskCard.js
│   │   │   ├── TaskForm.js
│   │   │   ├── BoardForm.js
│   │   │   └── BoardSelector.js
│   │   ├── context/       # React context for state
│   │   │   └── KanbanContext.js
│   │   ├── hooks/         # Custom hooks
│   │   │   └── useDragAndDrop.js
│   │   ├── services/      # API service layer
│   │   │   └── api.js
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   └── package.json
│
└── server/                # Express backend
    ├── controllers/       # Request handlers
    │   ├── boardController.js
    │   └── taskController.js
    ├── models/           # Mongoose schemas
    │   ├── Board.js
    │   └── Task.js
    ├── routes/           # API routes
    │   ├── boardRoutes.js
    │   └── taskRoutes.js
    ├── server.js         # Express app entry
    └── package.json
```

## API Endpoints

### Board Endpoints
- `GET /api/boards` - Get all boards
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get a board with its tasks
- `PUT /api/boards/:id` - Update a board
- `DELETE /api/boards/:id` - Delete a board and its tasks

### Task Endpoints
- `GET /api/tasks?boardId=:boardId` - Get all tasks for a board
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/reorder` - Reorder tasks (drag and drop)

## Database Schema

### Board Schema
```javascript
{
  name: String,           // Board name (required)
  description: String,    // Board description
  columns: [String],      // Array of column names
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String,          // Task title (required)
  description: String,    // Task description
  status: String,         // 'Todo', 'In Progress', 'Done'
  priority: String,       // 'low', 'medium', 'high'
  boardId: ObjectId,      // Reference to parent board
  position: Number,       // Order within column
  createdAt: Date,
  updatedAt: Date
}
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### 1. Clone and Navigate
```bash
cd /home/shubham/Desktop/vibe-coding-projects/task-manager
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kanban-board
NODE_ENV=development
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Start MongoDB
Ensure MongoDB is running:
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# Or start manually
mongod --dbpath /path/to/data
```

### 5. Run the Application

#### Option A: Run separately
**Backend:**
```bash
cd server
npm start
# or for development with nodemon
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

#### Option B: Run with concurrent scripts (Recommended)
Create a `package.json` in the root `task-manager` directory:

```json
{
  "name": "kanban-board",
  "version": "1.0.0",
  "scripts": {
    "install-all": "cd server && npm install && cd ../client && npm install",
    "server": "cd server && npm start",
    "client": "cd client && npm start",
    "dev": "concurrently \"npm run server\" \"npm run client\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Then run:
```bash
npm run install-all
npm run dev
```

## Application Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/ (returns API status)

## Key Implementation Details

### Drag & Drop Implementation
The application uses `@dnd-kit` for drag-and-drop functionality:

1. **DndContext**: Wraps the board for drag events
2. **useSortable**: Makes task cards draggable
3. **useDroppable**: Makes columns droppable targets
4. **Position Tracking**: Each task has a `position` field for consistent ordering
5. **Real-time Updates**: Backend updates position on drag end

### State Management
- **KanbanContext**: Centralized state for boards and tasks
- **Optimistic Updates**: UI updates immediately, then syncs with backend
- **Error Boundaries**: Graceful error handling with user feedback
- **Loading States**: Visual indicators during API calls

### API Service Layer
- **Axios Instance**: Configured base URL and interceptors
- **Error Handling**: Consistent error messages across the app
- **Request/Response Interceptors**: For auth tokens and error handling

## Development Notes

### React 19 Features
- Functional components with hooks only
- No class components
- Modern React patterns (useCallback, useMemo, useContext)
- Strict mode compatible

### Scalability Considerations
- Modular folder structure for easy expansion
- Index-based queries for efficient task ordering
- MongoDB indexes for performance
- RESTful API design for clear separation

### Future Enhancements
1. User authentication and authorization
2. Real-time collaboration with WebSockets
3. Task attachments and comments
4. Advanced filtering and search
5. Board templates and cloning
6. Export/Import functionality
7. Mobile app with React Native

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `sudo systemctl status mongod`
   - Check connection string in `.env` file

2. **Port Already in Use**
   - Change PORT in `.env` or kill process: `sudo lsof -ti:5000 | xargs kill`

3. **React Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Update dependencies: `npm update`

4. **CORS Errors**
   - Backend CORS is configured for all origins in development
   - For production, update CORS configuration in `server.js`

### Debugging
- Backend logs: Check console output from server
- Frontend logs: Browser developer tools
- Network requests: Monitor API calls in Network tab
- React DevTools: Inspect component state and props

## License

MIT License - Feel free to use and modify for your projects.

## Acknowledgments

- React Team for React 19
- @dnd-kit team for excellent drag-and-drop library
- MongoDB for flexible document database
- Express.js for robust backend framework