
Acceptance criteria - 

Task:
I've to create a monorepo based ticket-management-system web application.
Already created the basic structure for mono-repo where client and server repository you can find with npm installed.
utilise these created server for development.

Context:
This application would be used for a company where the admin can manage the tickets and employee can raise and check the tickets history. This appication UI/UX should look like an SaSS Application, modern ui themes. It should be a dashboard where left side will be menu items and right there would be content.


Pages:
- Login
- Dashboard
- Tickets ListingTickets Listing
- Raise A Ticket (Form)
- User Management (Admin)

Detailed Info With Page:
1- Login => 
It should contain the form with email and password, on click of login button, it should call our backend server with the payload.
Backend should validate and do the business logic and return the user basic info and jwt token. create a test admin.

2- Dashboard
 It should show the charts and the basic cards with tickets history. it should get the details from the backend server and show in UI based on the standard business needs.

 3- Tickets Listing
 This would be ticket listing page where all the tickets would be listed based on role.
 If user is isAdmin:true then the would have filters based on status and raised by and the search fieidl and below there would be listing with pagination (offset based) with backend api integration.
 Each listed item should have the button to update the status where for admin on click of that button it should update the status if requiired with comments like admin can close the ticket.
 Where isAdmin:false  will only have the option for edit, view and delete button , on view and edit it should navigate to edit and view ticket detail page and on click on delete it should ask confirmation, on confirm it should call the backend api to delete

- Raise A Ticket (Form)
This page will be assessible for normal user not admin, they can add the details like, subject, toDepartment, Description, optional image or document (as of now store in the local system only but make the reusable method for later we can add the option for cloudinary or r2 cloudfront later).
Default it should pick the userId and email from the context of logged in user to save with the ticket, and user would have the option for select the priority like high, medium and low.
on create click, it should call the backend api and backend should do the logic of saving in db and validation.

- User Management (Admin)
This page would be used by only admin login page. where new user can be added using a form and there would be listing page and create page a user would only be created with default isAdmin:false key and value.
this listing and cread page only accessible by admin.

Note: For the above functionslity create the respective backend logic with authentication and authorization with JWT.
Kindly ask if any confusion? 




Technical details - 
1. Frontend: React using vite
2. Backend: Using express
3. Database: MongoDB.
4. Node version: 24
5. Styling: Tailwind css
6. Rule: Only use the npm packages for both which are stable with current node version.