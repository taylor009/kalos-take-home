import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

const app = new Hono()

// Middleware
app.use("*", logger())
app.use("*", cors({
  origin: ["http://localhost:3000"], // Next.js dev server
  credentials: true,
}))

// Basic health check
app.get("/", (c) => {
  return c.json({ 
    message: "Kalos Sales Dashboard API",
    status: "running",
    timestamp: new Date().toISOString()
  })
})

// API routes placeholder
app.get("/api/health", (c) => {
  return c.json({ status: "healthy" })
})

const port = 3001

console.log(`🚀 Server is running on port ${port}`)
console.log(`📊 Kalos Sales Dashboard API`)
console.log(`🌐 http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
