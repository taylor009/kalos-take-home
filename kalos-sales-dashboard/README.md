# Kalos Sales Dashboard

A real-time sales analytics dashboard built for the Kalos take-home project. This application provides live transaction tracking with instant analytics updates, demonstrating modern full-stack development practices with a focus on real-time data synchronization.

## 🚀 Quick Start

```bash
# Install dependencies for all workspaces
npm install

# Start both frontend and backend in development mode
npm run dev

# Or start individually if needed
npm run dev:backend    # Hono API server on :3001
npm run dev:frontend   # Next.js app on :3000
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001

## 📋 Requirements Met

✅ **Dashboard Page** - Transaction table with Date, Customer Name, Amount  
✅ **Search Functionality** - Filter transactions by Customer Name with live search  
✅ **Add Transaction Page** - Form with Customer Name, Amount, Currency fields  
✅ **Real-Time Updates** - Live analytics and transaction updates without page refresh  
✅ **Total Revenue Analytics** - Sum of all transactions updated in real-time  

## 🏗️ Architecture Overview

### Monorepo Structure
```
kalos-sales-dashboard/
├── apps/
│   ├── backend/          # Hono.js API server with Socket.IO
│   └── frontend/         # Next.js 14 dashboard application
├── packages/
│   └── shared/           # Shared TypeScript types and utilities
└── package.json          # Root workspace configuration
```

### Tech Stack

**Backend (apps/backend/)**
- **Hono.js** - Fast, lightweight web framework for TypeScript
- **Socket.IO** - Real-time bidirectional communication
- **TypeScript** - Type safety and developer experience
- **Node.js** - Runtime environment

**Frontend (apps/frontend/)**
- **Next.js 14** - React framework with App Router
- **React Query (TanStack Query)** - Powerful data synchronization
- **Socket.IO Client** - Real-time WebSocket communication
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Performant form management
- **React Hot Toast** - Elegant toast notifications

**Shared (packages/shared/)**
- **TypeScript Types** - Shared interfaces and types for type safety

## 🔧 Technical Approach & Key Decisions

### 1. Real-Time Architecture
**Decision**: Socket.IO for bidirectional real-time communication  
**Why**: Provides robust WebSocket connections with automatic fallbacks, connection management, and error recovery. Superior to Server-Sent Events for this use case due to the need for reliable bidirectional communication.

```typescript
// Real-time event flow
Client creates transaction → API validates & stores → WebSocket broadcasts → All clients update
```

### 2. Data Synchronization Strategy
**Decision**: React Query with optimistic updates + WebSocket cache invalidation  
**Why**: Provides the best user experience with immediate UI feedback while maintaining data consistency across clients.

**Implementation**:
- Optimistic updates for immediate UI response
- WebSocket events update React Query cache
- Automatic error recovery and rollback
- Consistent state across all connected clients

### 3. In-Memory Data Store
**Decision**: Simple in-memory storage using JavaScript arrays and Maps  
**Why**: Rapid development for take-home project while maintaining good performance characteristics for demonstration purposes.

**Trade-offs**:
- ✅ Fast development and setup
- ✅ No database configuration required
- ✅ Excellent performance for demo scale
- ❌ Data doesn't persist between server restarts
- ❌ Not suitable for production use

### 4. Type Safety Strategy
**Decision**: Shared TypeScript types in monorepo package  
**Why**: Ensures type safety across the entire application stack, catching errors at compile time and improving developer experience.

### 5. Error Handling & User Experience
**Decision**: Comprehensive error boundaries with graceful degradation  
**Why**: Provides robust user experience even when individual components fail.

**Features**:
- Section-level error boundaries prevent full page crashes
- Retry mechanisms for failed network requests
- Toast notifications for user feedback
- Loading states and skeleton screens
- Connection status indicators

### 6. Search Implementation
**Decision**: Client-side filtering with debounced input  
**Why**: Immediate response for better UX, suitable for the expected data volume in this demo.

**Features**:
- 300ms debounced search for performance
- Highlighting of search matches
- Search statistics and result counts
- Keyboard shortcuts (⌘K to focus, Esc to clear)

## 🎯 Core Features

### Real-Time Updates
- **Transaction Broadcasting**: New transactions appear instantly on all connected clients
- **Analytics Sync**: Revenue totals update in real-time across all sessions
- **Visual Feedback**: New transactions highlighted with animations and badges
- **Connection Status**: Live WebSocket connection indicator in header

### Advanced UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Loading States**: Sophisticated skeleton screens and loading indicators
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Error Recovery**: Automatic retry mechanisms and graceful error handling
- **Professional Styling**: Modern design with gradients, backdrop blur, and animations

### Search & Filtering
- **Live Search**: Filter transactions by customer name in real-time
- **Smart Highlighting**: Search terms highlighted in results
- **Search Statistics**: Live count of filtered results
- **Keyboard Navigation**: Full keyboard support for accessibility

## ⚖️ Trade-offs & Assumptions

### Trade-offs Made

1. **Simplicity vs. Production Readiness**
   - ✅ Chose in-memory storage for rapid development
   - ❌ Not suitable for production (data loss on restart)

2. **Single Currency Analytics**
   - ✅ Simplified analytics calculation for demo
   - ❌ Real-world would need multi-currency handling

3. **Client-Side Search**
   - ✅ Immediate response and better UX
   - ❌ Doesn't scale with large datasets

4. **Manual Reconnection Logic**
   - ✅ Better control over reconnection behavior
   - ❌ More complex than Socket.IO built-in reconnection

### Assumptions Made

1. **Data Volume**: Suitable for demo/small business scale (< 1000 transactions)
2. **Currency**: USD as primary currency for analytics
3. **Users**: Single tenant, no authentication required for demo
4. **Network**: Reliable local network for WebSocket connections
5. **Browser Support**: Modern browsers with WebSocket support

## 🚫 Known Limitations

### Data Persistence
- **Issue**: Data is lost when backend server restarts
- **Impact**: Not suitable for production use
- **Solution**: Integrate with database (PostgreSQL, MongoDB, etc.)

### Scalability
- **Issue**: In-memory storage doesn't scale horizontally
- **Impact**: Limited to single server instance
- **Solution**: Database + Redis for session management

### Multi-Currency Support
- **Issue**: Analytics calculation assumes single currency
- **Impact**: Incorrect totals with mixed currencies
- **Solution**: Currency conversion service integration

### Search Performance
- **Issue**: Client-side search doesn't scale with large datasets
- **Impact**: Poor performance with thousands of transactions
- **Solution**: Server-side search with pagination

### Authentication
- **Issue**: No user authentication or authorization
- **Impact**: Data accessible to anyone with URL
- **Solution**: Implement authentication system (JWT, OAuth, etc.)

## 🔍 Code Review Focus Areas

### 1. Architecture & Organization
- **Monorepo Structure**: Clean separation of concerns across apps/packages
- **Type Safety**: Comprehensive TypeScript usage with shared types
- **Component Organization**: Logical component hierarchy and reusability

### 2. Real-Time Implementation
- **WebSocket Management**: Connection handling, reconnection logic, error recovery
- **Data Synchronization**: React Query + WebSocket integration
- **Optimistic Updates**: Immediate UI feedback with proper rollback

### 3. User Experience
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: Graceful degradation and user-friendly error messages
- **Performance**: Debounced search, efficient re-renders, optimized queries

### 4. Code Quality
- **Error Boundaries**: Prevent component failures from crashing entire app
- **Form Validation**: Comprehensive input validation and user feedback
- **Accessibility**: Keyboard navigation and ARIA labels

### 5. Development Experience
- **TypeScript Integration**: Full type safety across the stack
- **Development Scripts**: Easy setup and development workflow
- **Code Organization**: Clear file structure and naming conventions

## 🚀 Future Improvements

### Short Term
- [ ] Add pagination for transaction table
- [ ] Implement transaction editing/deletion
- [ ] Add date range filtering
- [ ] Export functionality (CSV, PDF)

### Medium Term
- [ ] Database integration (PostgreSQL)
- [ ] User authentication system
- [ ] Multi-currency support with conversion
- [ ] Advanced analytics (charts, trends)

### Long Term
- [ ] Multi-tenant architecture
- [ ] Advanced reporting and dashboards
- [ ] API rate limiting and caching
- [ ] Horizontal scaling support

## 🎯 Time Investment

This project was completed within the 4-hour take-home challenge timeframe:

- **Phase 1**: Project setup & backend foundation (90 min)
- **Phase 2**: Real-time infrastructure (30 min)
- **Phase 3**: Frontend foundation (90 min)
- **Phase 4**: Real-time frontend integration (45 min)
- **Phase 5**: Polish & documentation (45 min)

**Focus Areas**: Prioritized core functionality and real-time features over advanced polish, maintaining high code quality while meeting time constraints.

## 📝 Development Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Start only backend server
npm run dev:frontend     # Start only frontend server

# Build
npm run build           # Build all workspaces
npm run build --workspace=frontend  # Build specific workspace
npm run build --workspace=backend   # Build specific workspace

# Cleanup
npm run clean           # Remove all node_modules
```

## 🌐 API Endpoints

```
GET    /api/health           # Health check endpoint
GET    /api/transactions     # Fetch all transactions
POST   /api/transactions     # Create new transaction
GET    /api/analytics        # Get analytics summary

WebSocket Events:
- server:transaction-added   # New transaction broadcast
- server:analytics-updated   # Analytics update broadcast
- server:connected          # Connection confirmation
- server:error              # Error notifications
```

---

**Built with ❤️ for the Kalos take-home project**  
*Demonstrating modern full-stack development with real-time capabilities*
