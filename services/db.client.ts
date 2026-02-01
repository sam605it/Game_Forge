"use client";
import { db } from "@/services/db.client";
import type { SavedGame, User } from "../types";

export class ForgeDB extends Dexie {
  users!: Table<User, string>;
  games!: Table<SavedGame, string>;

  constructor() {
    super("GameForge");
    this.version(1).stores({
      users: "id",
      games: "id",
    });
  }
}

export const db = new ForgeDB();
