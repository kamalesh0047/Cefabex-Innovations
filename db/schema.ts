import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull(),
  phone: text("phone").notNull().default(""), company: text("company").notNull().default(""),
  service: text("service").notNull(), message: text("message").notNull(),
  status: text("status").notNull().default("new"), createdAt: text("created_at").notNull(),
});
export const events = sqliteTable("events", {
  id: text("id").primaryKey(), title: text("title").notNull(), date: text("date").notNull(),
  description: text("description").notNull(), image: text("image").notNull().default(""),
  published: integer("published", {mode:"boolean"}).notNull().default(false),
  archived: integer("archived", {mode:"boolean"}).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(), name: text("name").notNull(), company: text("company").notNull().default(""),
  service: text("service").notNull(), quote: text("quote").notNull(), rating: integer("rating").notNull(),
  consentConfirmed: integer("consent_confirmed", {mode:"boolean"}).notNull().default(false),
  published: integer("published", {mode:"boolean"}).notNull().default(false),
  archived: integer("archived", {mode:"boolean"}).notNull().default(false), createdAt: text("created_at").notNull(),
});
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey(), userId: text("user_id").notNull(), createdAt: text("created_at").notNull(),
});
export const rateLimits = sqliteTable("rate_limits", { id: text("id").primaryKey(), count: integer("count").notNull().default(1), expiresAt: integer("expires_at").notNull() });
