# Backend Unit Tests

This directory contains comprehensive unit tests for the Dexmate robot management API.

## Test Coverage

### Authentication Tests (`auth.test.js`)

-   ✅ User registration with validation
-   ✅ Duplicate email prevention
-   ✅ Email format validation
-   ✅ User login with correct credentials
-   ✅ Login failure with incorrect password
-   ✅ Login failure with non-existent email

### Robot Management Tests (`robots.test.js`)

-   ✅ Create robot with valid data
-   ✅ Prevent robot creation without authentication
-   ✅ Validate required fields on robot creation
-   ✅ Prevent duplicate serial numbers
-   ✅ Retrieve user's robots
-   ✅ Get robot details by serial number
-   ✅ Prevent access to non-existent robots
-   ✅ Delete owned robots
-   ✅ Prevent deletion of non-existent robots

### Group Management Tests (`groups.test.js`)

-   ✅ Create groups successfully
-   ✅ Prevent group creation without authentication
-   ✅ Validate required fields (group name)
-   ✅ Retrieve user's groups
-   ✅ Add members to groups by email
-   ✅ Prevent non-admins from adding members
-   ✅ Prevent duplicate group memberships
-   ✅ Remove members from groups
-   ✅ Prevent non-admins from removing members

### Permission Management Tests (`permissions.test.js`)

-   ✅ Grant permissions to users
-   ✅ Prevent non-owners from granting permissions
-   ✅ Update existing permissions (upsert behavior)
-   ✅ Revoke permissions
-   ✅ Allow users to revoke their own permissions (admin level)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test __tests__/auth.test.js

# Run with coverage
npm test -- --coverage
```

## Test Results

```
Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total
Snapshots:   0 total
Time:        ~1.6s
```

## Test Database

Tests use the same SQLite database configured in `.env`. The test suite:

-   Cleans up test data in `beforeAll` hooks
-   Creates fresh test data for each test suite
-   Cleans up in `afterAll` hooks to prevent pollution

## Critical Endpoints Tested

All critical API endpoints are covered:

-   POST `/api/auth/register` - User registration
-   POST `/api/auth/login` - User authentication
-   POST `/api/robots` - Robot creation
-   GET `/api/robots` - List robots
-   GET `/api/robots/:serialNumber` - Get robot details
-   DELETE `/api/robots/:serialNumber` - Delete robot
-   POST `/api/groups` - Create group
-   GET `/api/groups` - List groups
-   POST `/api/groups/:id/members` - Add group member
-   DELETE `/api/groups/:id/members/:userId` - Remove member
-   POST `/api/robots/:serialNumber/permissions` - Grant permission
-   DELETE `/api/robots/:serialNumber/permissions/:userId` - Revoke permission

## Testing Framework

-   **Jest**: Modern JavaScript testing framework
-   **Supertest**: HTTP assertion library for testing Express apps
-   **Prisma Client**: Database access for test setup/teardown
