import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const petClicks = sqliteTable("pet_clicks", {
  petName: text("pet_name").primaryKey(),
  clicks: integer("clicks").notNull().default(0),
  treats: integer("treats").notNull().default(0),
});
