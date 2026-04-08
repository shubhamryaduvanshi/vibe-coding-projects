# Tickets Listing

## Purpose
- List tickets based on role and filters.
- Allow admin status updates and user actions.

## Requirements
- Pagination support.
- Status and raised-by filters.
- Search field.
- Actions:
  - Admin: update status, add comments.
  - User: view only.
  - User view page should show all fields in disabled/read-only mode once a ticket is created.
- Once created, a ticket should not be deleted.

## Notes
- Use `/api/tickets` endpoints.
- Admin views all tickets; user sees own tickets.
