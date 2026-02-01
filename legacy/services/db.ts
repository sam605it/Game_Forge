// legacy/services/db.ts
"use client";

/**
 * BUILD-SAFE DB STUB
 * ------------------
 * This prevents Next.js build crashes.
 * Replace with real Dexie DB later (client-only).
 */

const noop = async () => undefined;

export const db = {
  games: {
    add: noop,
    put: noop,
    delete: noop,
    orderBy: () => ({
      reverse: () => ({
        toArray: async () => []
      })
    })
  },
  users: {
    add: noop,
    put: noop,
    get: async () => null,
    where: () => ({
      equals: () => ({
        first: async () => null
      })
    })
  }
};
