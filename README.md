# Kalos Sales Dashboard

A real-time sales analytics dashboard built for the Kalos take-home project. This application provides live transaction tracking with instant analytics updates, demonstrating modern full-stack development practices with a focus on real-time data synchronization.

## 🚀 Quick Start

```bash
# Navigate to project directory
cd kalos-sales-dashboard

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
**Why**: Provides robust WebSocket connections with automatic fallbacks, connection management, and error recovery.

### 2. Data Synchronization Strategy
**Decision**: React Query with optimistic updates + WebSocket cache invalidation  
**Why**: Provides the best user experience with immediate UI feedback while maintaining data consistency across clients.

### 3. In-Memory Data Store
**Decision**: Simple in-memory storage using JavaScript arrays and Maps  
**Why**: Rapid development for take-home project while maintaining good performance characteristics for demonstration purposes.

### 4. Type Safety Strategy
**Decision**: Shared TypeScript types in monorepo package  
**Why**: Ensures type safety across the entire application stack, catching errors at compile time.

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

### Search & Filtering
- **Live Search**: Filter transactions by customer name in real-time
- **Smart Highlighting**: Search terms highlighted in results
- **Search Statistics**: Live count of filtered results
- **Keyboard Navigation**: Full keyboard support for accessibility

## ⚖️ Trade-offs & Assumptions

### Key Trade-offs Made

1. **Simplicity vs. Production Readiness**
   - ✅ Chose in-memory storage for rapid development
   - ❌ Not suitable for production (data loss on restart)

2. **Single Currency Analytics**
   - ✅ Simplified analytics calculation for demo
   - ❌ Real-world would need multi-currency handling

3. **Client-Side Search**
   - ✅ Immediate response and better UX
   - ❌ Doesn't scale with large datasets

### Key Assumptions

1. **Data Volume**: Suitable for demo/small business scale (< 1000 transactions)
2. **Currency**: USD as primary currency for analytics
3. **Users**: Single tenant, no authentication required for demo
4. **Network**: Reliable local network for WebSocket connections

## 🚫 Known Limitations

- **Data Persistence**: Data is lost when backend server restarts
- **Scalability**: In-memory storage doesn't scale horizontally
- **Multi-Currency Support**: Analytics calculation assumes single currency
- **Search Performance**: Client-side search doesn't scale with large datasets
- **Authentication**: No user authentication or authorization

## 🔍 Code Review Focus Areas

1. **Architecture & Organization**: Monorepo structure, type safety, component organization
2. **Real-Time Implementation**: WebSocket management, data synchronization, optimistic updates
3. **User Experience**: Loading states, error handling, performance optimizations
4. **Code Quality**: Error boundaries, form validation, accessibility
5. **Development Experience**: TypeScript integration, development workflow, code organization

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

## 🎯 Time Investment

This project was completed within the 4-hour take-home challenge timeframe, focusing on core functionality and real-time features while maintaining high code quality.

## 📝 Development

The project uses npm workspaces for dependency management. Each app and package has its own `package.json` and can be developed independently.

**See the full documentation in `kalos-sales-dashboard/README.md` for detailed setup instructions, API documentation, and comprehensive technical details.**

---

**Built with ❤️ for the Kalos take-home project**  
*Demonstrating modern full-stack development with real-time capabilities* 