# Raise A Ticket

## Purpose
- Allow non-admin users to create new tickets.

## Requirements
- Form fields: subject, toDepartment, description, priority, optional attachment.
- Store createdBy user ID and email automatically.
- Backend validation and saving.

## Notes
- Use `/api/tickets` POST.
- Attachment stored locally for now.
