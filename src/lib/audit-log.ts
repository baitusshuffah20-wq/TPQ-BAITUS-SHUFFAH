// src/lib/audit-log.ts
import { prisma } from "@/lib/prisma";

interface AuditLogData {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  oldData?: string;
  newData?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        oldData: data.oldData,
        newData: data.newData,
      },
    });

    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
}
