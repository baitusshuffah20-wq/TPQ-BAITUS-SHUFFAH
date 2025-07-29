# Audit Log Utility - High-Level Documentation

## Purpose

This module provides a utility function to record audit log entries in the application's database, ensuring traceability and accountability for user actions performed on various entities.

## Components

### 1. **AuditLogData Interface**

Defines the structure of data required to create an audit log entry:

- **action**: Type of operation performed (e.g., "create", "update", "delete").
- **entity**: The name/type of the entity being affected.
- **entityId**: Unique identifier for the instance of the entity.
- **userId**: Identifier for the user performing the action.
- **oldData** (optional): Serialized representation of the entity state before the action (usually as JSON string).
- **newData** (optional): Serialized representation of the entity state after the action (usually as JSON string).

### 2. **createAuditLog Function**

Asynchronous function that inserts a new audit log entry into the database:

- **Input**: An object adhering to the AuditLogData interface.
- **Process**: Uses the Prisma ORM to persist the log entry in the `auditLog` table.
- **Error Handling**:
  - Errors during creation are logged to the console.
  - The function does not throw errors (returns `null` on failure), ensuring that failures to write to the audit log do not interrupt the primary business logic.

## Usage

Call `createAuditLog()` after any significant data operation where auditability is desired. Pass in sufficient contextual and descriptive data as per the `AuditLogData` interface.

## Summary

This code is a reusable and practical building block for maintaining an audit trail in applications built with Prisma and TypeScript. It is designed to be robust and non-intrusive, preventing audit failures from impacting core application functionality.
