import { relations } from "drizzle-orm/relations";
import { userProfiles, bodyMetrics, dietLogs, exerciseLogs, foods, plans, dailySummary } from "./schema";

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
	bodyMetrics: many(bodyMetrics),
	dietLogs: many(dietLogs),
	exerciseLogs: many(exerciseLogs),
	plans: many(plans),
	dailySummary: many(dailySummary),
	foods: many(foods),
}));

export const bodyMetricsRelations = relations(bodyMetrics, ({ one }) => ({
	userProfile: one(userProfiles, {
		fields: [bodyMetrics.user_id],
		references: [userProfiles.user_id],
	}),
}));

export const dietLogsRelations = relations(dietLogs, ({ one }) => ({
	userProfile: one(userProfiles, {
		fields: [dietLogs.user_id],
		references: [userProfiles.user_id],
	}),
	food: one(foods, {
		fields: [dietLogs.food_id],
		references: [foods.id],
	}),
}));

export const exerciseLogsRelations = relations(exerciseLogs, ({ one }) => ({
	userProfile: one(userProfiles, {
		fields: [exerciseLogs.user_id],
		references: [userProfiles.user_id],
	}),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
	userProfile: one(userProfiles, {
		fields: [foods.user_id],
		references: [userProfiles.user_id],
	}),
	dietLogs: many(dietLogs),
}));

export const plansRelations = relations(plans, ({ one }) => ({
	userProfile: one(userProfiles, {
		fields: [plans.user_id],
		references: [userProfiles.user_id],
	}),
}));

export const dailySummaryRelations = relations(dailySummary, ({ one }) => ({
	userProfile: one(userProfiles, {
		fields: [dailySummary.user_id],
		references: [userProfiles.user_id],
	}),
}));