export const PERMISSIONS = {
  ADMIN: {
    DASHBOARD: ["admin", "musyrif", "wali"],
    SANTRI: ["create", "read", "update", "delete"],
    HALAQAH: ["create", "read", "update", "delete"],
    HAFALAN: ["approve", "reject", "manage"],
    ATTENDANCE: ["manage", "report"],
    PAYMENT: ["manage", "confirm", "report"],
    SETTINGS: ["manage"],
  },
  MUSYRIF: {
    DASHBOARD: ["musyrif"],
    SANTRI: ["read", "update"],
    HALAQAH: ["read", "update"],
    HAFALAN: ["create", "read", "update"],
    ATTENDANCE: ["create", "read", "update"],
    PAYMENT: [],
    SETTINGS: [],
  },
  WALI: {
    DASHBOARD: ["wali"],
    SANTRI: ["read"],
    HAFALAN: ["read"],
    ATTENDANCE: ["read"],
    PAYMENT: ["read", "pay"],
  },
} as const;

export type Resource = keyof typeof PERMISSIONS.ADMIN;
export type Action = (typeof PERMISSIONS.ADMIN)[Resource][number];
export type Role = keyof typeof PERMISSIONS;
