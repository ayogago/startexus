import { prisma } from './prisma'

export async function logAuditEvent({
  userId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: {
  userId: string
  action: string
  targetType: string
  targetId: string
  details?: string
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetType,
        targetId,
        details,
        ipAddress,
      },
    })
  } catch {
    // Silently fail - audit logging should never break the main flow
  }
}
