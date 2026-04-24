# Neo Task Manager - System Flow Documentation

## Overview
Neo Task Manager is a production-grade Jira-like shared Kanban board built as a Turborepo monorepo with React, Express, MongoDB, Socket.IO, and shared TypeScript packages.

## Architecture Summary

### Tech Stack
- **Monorepo**: Turborepo + npm workspaces
- **Frontend**: React, Vite, Tailwind CSS, React Query, Zustand, dnd-kit, Socket.IO client
- **Backend**: Node.js, Express, Mongoose, JWT auth with HTTP-only cookies, Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Shared Packages**: UI components, shared types, shared utilities, shared config
- **Testing**: Jest + Supertest

### Project Structure
```
neo-task-manager/
├── apps/
│   ├── client/                 # React frontend application
│   │   ├── src/
│   │   │   ├── api/           # API client functions
│   │   │   ├── app/           # Routing configuration
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── features/      # Feature-specific logic
│   │   │   ├── lib/           # HTTP client, query client, socket
│   │   │   ├── pages/         # Page components
│   │   │   ├── providers/     # React context providers
│   │   │   └── styles/        # Global styles
│   └── server/                # Express backend application
│       ├── src/
│       │   ├── config/        # Environment configuration
│       │   ├── controllers/   # Request handlers
│       │   ├── db/            # Database connection
│       │   ├── middleware/    # Express middleware
│       │   ├── models/        # Mongoose models
│       │   ├── repositories/  # Data access layer
│       │   ├── routes/        # Route definitions
│       │   ├── schemas/       # Validation schemas
│       │   ├── services/      # Business logic
│       │   ├── sockets/       # Socket.IO handlers
│       │   ├── tests/         # Test files
│       │   ├── types/         # TypeScript types
│       │   └── utils/         # Utility functions
├── packages/                   # Shared packages
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # UI component library
│   ├── utils/                 # Shared utilities
│   └── config/                # Shared configuration
```

## Data Flow

### 1. Authentication Flow

**Client-Side Authentication:**
```
1. User visits /auth page
2. AuthPage component renders login/signup forms
3. Form submission triggers API call to /auth/login or /auth/signup
4. On success, HTTP-only cookie is set by server
5. Client fetches user session via /auth/me endpoint
6. Auth store updates with user data
7. ProtectedRoute redirects authenticated users to /board
```

**Server-Side Authentication:**
```
1. Auth routes receive request
2. Auth controller validates input via schemas
3. Auth service handles business logic:
   - Login: Verify credentials, generate JWT, set HTTP-only cookie
   - Signup: Create user, hash password, generate JWT
   - Logout: Clear cookie
4. User repository interacts with MongoDB User model
5. Response sent with user data
```

### 2. Task Management Flow

**Board Loading:**
```
1. BoardPage component mounts
2. useBoard hook calls fetchBoard() API
3. HTTP GET request to /tasks endpoint
4. Task controller's listBoard() method invoked
5. Task service aggregates tasks by status columns
6. Task repository queries MongoDB with status-based grouping
7. Response includes columns with tasks sorted by position
8. React Query caches the board data
9. UI renders columns (Backlog, Selected, In Progress, etc.)
```

**Task Creation:**
```
1. User opens CreateTaskForm modal
2. Form submission triggers createTask() API
3. HTTP POST to /tasks with task data
4. Task controller's createTask() extracts userId from request.user
5. Task service validates and creates task with position calculation
6. Task repository saves to MongoDB
7. Socket.IO broadcasts task-created event to all connected clients
8. React Query invalidates "board" query to trigger refetch
9. UI updates with new task in appropriate column
```

**Task Drag & Drop (Reorder):**
```
1. User drags task between columns
2. dnd-kit handles drag events
3. handleDragEnd calculates source/destination columns
4. reorderTasks() API called with ReorderTaskInput
5. HTTP POST to /tasks/reorder with taskId, newStatus, newPosition
6. Task controller's reorderTasks() forwards to task service
7. Task service updates task status and recalculates positions
8. Socket.IO broadcasts task-updated event
9. React Query invalidates "board" query
10. UI reflects new task positions
```

### 3. Real-time Updates (Socket.IO)

**Socket Connection Flow:**
```
1. Client establishes Socket.IO connection via lib/socket.ts
2. Server socket service attaches to HTTP server
3. Authentication middleware validates socket connection using JWT cookie
4. On connection, user joins room based on userId
5. Server emits connection confirmation
```

**Real-time Events:**
- `task-created`: Broadcast when new task created
- `task-updated`: Broadcast when task modified
- `task-deleted`: Broadcast when task removed
- `assignment-changed`: Broadcast when task assignee changes
- `worklog-added`: Broadcast when worklog entry added

### 4. Assignment History Flow

**Task Assignment:**
```
1. User assigns/unassigns task via UI
2. updateAssignment() API called
3. HTTP POST to /assignments with taskId and assigneeId
4. Assignment controller forwards to assignment service
5. Service creates AssignmentHistory entry
6. Task repository updates task.assignee field
7. Socket.IO broadcasts assignment-changed event
8. UI updates task card with new assignee
```

**History Tracking:**
- AssignmentHistory model stores all assignment changes
- Each entry includes oldAssignee, newAssignee, timestamp
- Task details endpoint includes assignment history

### 5. Worklog Tracking Flow

**Adding Worklog:**
```
1. User opens task modal and adds worklog entry
2. createWorklog() API called with taskId, description, minutes
3. HTTP POST to /worklogs
4. Worklog controller forwards to worklog service
5. Service validates task exists and creates worklog
6. Worklog repository saves to MongoDB
7. Socket.IO broadcasts worklog-added event
8. Task details refetched to show updated worklogs
```

**Time Reports:**
```
1. User navigates to /reports/time
2. ReportsPage component fetches time reports
3. fetchTimeReport() API calls /reports/time
4. Report controller forwards to report service
5. Service aggregates worklogs by user/task/date
6. UI displays charts and tables of time tracking data
```

## Component Hierarchy

### Client Application Structure
```
App (main.tsx)
├── AppProviders (QueryClientProvider)
│   └── RouterProvider
│       ├── /auth → AuthPage
│       └── / (ProtectedRoute)
│           └── AppShell
│               ├── /board → BoardPage
│               │   ├── DndContext
│               │   ├── BoardColumn(s)
│               │   │   └── TaskCard(s)
│               │   ├── CreateTaskForm
│               │   └── TaskModal
│               └── /reports/time → ReportsPage
```

### Key Components

1. **AppShell**: Layout wrapper with navigation
2. **ProtectedRoute**: Guards authenticated routes
3. **BoardPage**: Main Kanban board with drag-and-drop
4. **BoardColumn**: Column for specific task status
5. **TaskCard**: Individual task display card
6. **TaskModal**: Detailed task view/edit modal
7. **CreateTaskForm**: Form for creating new tasks
8. **ReportsPage**: Time tracking reports and analytics

## State Management

### Client State
- **React Query**: Server state (tasks, board, user)
  - Query keys: ["board"], ["task", taskId], ["user"]
  - Mutations: createTask, updateTask, reorderTasks
- **Zustand Stores**: Client state
  - `useAuthStore`: User authentication state
  - `useBoardStore`: Selected task, UI state
- **Component State**: Local UI state (form inputs, modals)

### Server State
- **MongoDB Models**:
  - `User`: User accounts and profiles
  - `Task`: Task definitions and status
  - `AssignmentHistory`: Task assignment tracking
  - `Worklog`: Time tracking entries
- **In-memory**: Socket.IO connections, session state

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user session

### Tasks (`/tasks`)
- `GET /tasks` - Get board with columns and tasks
- `POST /tasks` - Create new task
- `PATCH /tasks/:taskId` - Update task
- `GET /tasks/:taskId` - Get task details with history/worklogs
- `POST /tasks/reorder` - Reorder tasks across columns

### Assignments (`/assignments`)
- `POST /assignments` - Assign/unassign task to user
- `GET /assignments/history/:taskId` - Get assignment history for task

### Worklogs (`/worklogs`)
- `POST /worklogs` - Add worklog entry to task
- `GET /worklogs/task/:taskId` - Get worklogs for task

### Reports (`/reports`)
- `GET /reports/time` - Get time tracking reports
- `GET /reports/assignments` - Get assignment reports

## Database Schema

### User Model
```typescript
{
  name: string,
  email: string,
  passwordHash: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```typescript
{
  title: string,
  description: string,
  status: TaskStatus, // "Backlog", "Selected", "In Progress", etc.
  assignee: ObjectId | null,
  dueDate: Date | null,
  createdBy: ObjectId,
  position: number,
  createdAt: Date,
  updatedAt: Date
}
```

### AssignmentHistory Model
```typescript
{
  taskId: ObjectId,
  oldAssignee: ObjectId | null,
  newAssignee: ObjectId | null,
  changedBy: ObjectId,
  changedAt: Date
}
```

### Worklog Model
```typescript
{
  taskId: ObjectId,
  userId: ObjectId,
  description: string,
  minutes: number,
  loggedAt: Date
}
```

## Error Handling

### Client-Side
- React Query error boundaries
- HTTP client interceptors for authentication errors
- Form validation with user-friendly messages

### Server-Side
- Express error handling middleware
- Custom AppError class for structured errors
- Validation middleware with Zod schemas
- MongoDB connection error handling

## Security Considerations

1. **Authentication**: JWT tokens in HTTP-only cookies
2. **Authorization**: User can only modify their own tasks/assignments
3. **Input Validation**: Zod schemas for all API endpoints
4. **CORS**: Configured to allow only client origin
5. **Password Security**: bcrypt hashing with salt rounds
6. **Rate Limiting**: (To be implemented)
7. **HTTPS**: Enforced in production

## Deployment Considerations

### Build Process
```
npm run build        # Build all packages and apps
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint validation
npm run test         # Run test suites
```

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `CLIENT_URL`: Frontend URL for CORS
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

## Development Workflow

### Starting Development
```bash
npm install          # Install dependencies
npm run dev          # Start client and server in dev mode
```

### Code Organization
- Feature-based folder structure
- Shared types in packages/types
- Reusable UI components in packages/ui
- Dependency injection for testability
- Repository pattern for data access

## Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions
- Component rendering

### Integration Tests
- API endpoint testing with Supertest
- Database interaction tests
- Socket.IO event testing

### End-to-End Tests
- (To be implemented) User workflows
- Authentication flows
- Task management scenarios

## Future Enhancements

1. **Advanced Reporting**: Burndown charts, velocity tracking
2. **Notifications**: Email/Slack notifications for assignments
3. **File Attachments**: Attach files to tasks
4. **Comments/Discussion**: Threaded comments on tasks
5. **Custom Workflows**: User-defined status columns
6. **Team Management**: User roles and permissions
7. **Mobile App**: React Native application
8. **Export/Import**: CSV/Excel export of reports

## Conclusion

The Neo Task Manager follows a clean architecture with clear separation of concerns:
- **Presentation Layer**: React components with Tailwind CSS
- **Application Layer**: React Query for data fetching, Zustand for state
- **Business Logic Layer**: Express services with repository pattern
- **Data Access Layer**: Mongoose models and repositories
- **Infrastructure Layer**: MongoDB, Socket.IO, HTTP server

The real-time collaboration features via Socket.IO and comprehensive task management capabilities make it a production-ready alternative to tools like Jira or Trello.