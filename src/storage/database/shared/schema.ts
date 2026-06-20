import { pgTable, serial, timestamp, varchar, integer, numeric, boolean, text, uuid, date, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


// Health check table (system table - DO NOT DELETE)
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// User profiles - extends Supabase auth.users
export const userProfiles = pgTable(
	"user_profiles",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		user_id: uuid("user_id").notNull().unique(), // Links to auth.users
		display_name: varchar("display_name", { length: 100 }),
		target_weight: numeric("target_weight", { precision: 5, scale: 2 }), // kg
		target_date: date("target_date"),
		height: numeric("height", { precision: 5, scale: 2 }), // cm
		date_of_birth: date("date_of_birth"),
		gender: varchar("gender", { length: 10 }), // 'male', 'female', 'other'
		activity_level: varchar("activity_level", { length: 20 }), // 'sedentary', 'light', 'moderate', 'active', 'very_active'
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("user_profiles_user_id_idx").on(table.user_id),
	]
);

// Body metrics tracking - weight, body composition
export const bodyMetrics = pgTable(
	"body_metrics",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		recorded_at: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
		weight: numeric("weight", { precision: 5, scale: 2 }), // kg
		body_fat_pct: numeric("body_fat_pct", { precision: 4, scale: 1 }), // percentage
		bmi: numeric("bmi", { precision: 4, scale: 1 }), // calculated
		body_age: integer("body_age"), // metabolic age
		visceral_fat: integer("visceral_fat"), // visceral fat level
		muscle_mass: numeric("muscle_mass", { precision: 5, scale: 2 }), // kg
		bone_mass: numeric("bone_mass", { precision: 4, scale: 2 }), // kg
		water_pct: numeric("water_pct", { precision: 4, scale: 1 }), // percentage
		notes: text("notes"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("body_metrics_user_id_idx").on(table.user_id),
		index("body_metrics_recorded_at_idx").on(table.recorded_at),
	]
);

// Diet logs - food intake records
export const dietLogs = pgTable(
	"diet_logs",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		date: date("date").notNull(),
		meal_type: varchar("meal_type", { length: 20 }).notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
		food_id: uuid("food_id").references(() => foods.id),
		food_name: varchar("food_name", { length: 200 }).notNull(),
		portion_size: numeric("portion_size", { precision: 6, scale: 2 }), // grams or serving size
		calories: integer("calories"), // kcal
		protein: numeric("protein", { precision: 5, scale: 1 }), // grams
		carbs: numeric("carbs", { precision: 5, scale: 1 }), // grams
		fat: numeric("fat", { precision: 5, scale: 1 }), // grams
		notes: text("notes"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("diet_logs_user_id_idx").on(table.user_id),
		index("diet_logs_date_idx").on(table.date),
		index("diet_logs_food_id_idx").on(table.food_id),
	]
);

// Exercise logs - workout records
export const exerciseLogs = pgTable(
	"exercise_logs",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		date: date("date").notNull(),
		exercise_type: varchar("exercise_type", { length: 50 }).notNull(), // 'running', 'walking', 'swimming', etc.
		duration_minutes: integer("duration_minutes").notNull(),
		calories_burned: integer("calories_burned"),
		distance_km: numeric("distance_km", { precision: 5, scale: 2 }),
		intensity: varchar("intensity", { length: 20 }), // 'low', 'moderate', 'high'
		notes: text("notes"),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("exercise_logs_user_id_idx").on(table.user_id),
		index("exercise_logs_date_idx").on(table.date),
	]
);

// Foods database - reference table for food items
export const foods = pgTable(
	"foods",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		name: varchar("name", { length: 200 }).notNull(),
		category: varchar("category", { length: 50 }), // 'vegetables', 'fruits', 'meat', 'dairy', etc.
		serving_size: numeric("serving_size", { precision: 6, scale: 2 }), // grams
		calories_per_serving: integer("calories_per_serving").notNull(),
		protein_per_serving: numeric("protein_per_serving", { precision: 5, scale: 1 }),
		carbs_per_serving: numeric("carbs_per_serving", { precision: 5, scale: 1 }),
		fat_per_serving: numeric("fat_per_serving", { precision: 5, scale: 1 }),
		fiber_per_serving: numeric("fiber_per_serving", { precision: 5, scale: 1 }),
		is_public: boolean("is_public").default(true).notNull(), // public foods available to all users
		user_id: uuid("user_id"), // null for public foods, filled for custom user foods
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("foods_user_id_idx").on(table.user_id),
		index("foods_category_idx").on(table.category),
		index("foods_name_idx").on(table.name),
	]
);

// Plans - diet and exercise plans
export const plans = pgTable(
	"plans",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		name: varchar("name", { length: 100 }).notNull(),
		type: varchar("type", { length: 20 }).notNull(), // 'diet', 'exercise', 'combined'
		description: text("description"),
		start_date: date("start_date").notNull(),
		end_date: date("end_date"),
		target_calories: integer("target_calories"), // daily calorie target
		target_exercise_minutes: integer("target_exercise_minutes"), // daily exercise target
		is_active: boolean("is_active").default(true).notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("plans_user_id_idx").on(table.user_id),
		index("plans_is_active_idx").on(table.is_active),
	]
);

// Daily summary - aggregated daily stats
export const dailySummary = pgTable(
	"daily_summary",
	{
		id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
		user_id: uuid("user_id").notNull().default(sql`auth.uid()`),
		date: date("date").notNull(),
		total_calories_in: integer("total_calories_in").default(0),
		total_calories_out: integer("total_calories_out").default(0),
		calorie_balance: integer("calorie_balance").default(0), // in - out
		total_protein: numeric("total_protein", { precision: 6, scale: 1 }).default(sql`0`),
		total_carbs: numeric("total_carbs", { precision: 6, scale: 1 }).default(sql`0`),
		total_fat: numeric("total_fat", { precision: 6, scale: 1 }).default(sql`0`),
		total_exercise_minutes: integer("total_exercise_minutes").default(0),
		weight: numeric("weight", { precision: 5, scale: 2 }),
		bmi: numeric("bmi", { precision: 4, scale: 1 }),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("daily_summary_user_id_idx").on(table.user_id),
		index("daily_summary_date_idx").on(table.date),
	]
);