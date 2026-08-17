# TicketDesk - IT Support Ticket Management System Web API

Production-ready ASP.NET Core 8 Web API for IT Support Ticket Management.

## Technology Stack

- **Framework**: ASP.NET Core 8 Web API
- **Language**: C# 12
- **ORM**: Entity Framework Core 8 Code-First
- **Database**: SQL Server Express (`.\SQLEXPRESS`)
- **Security**: JWT Authentication, BCrypt Password Hashing, CORS, HTTPS
- **Architecture**: Repository Pattern + Service Pattern with Dependency Injection
- **Object Mapping**: AutoMapper 13
- **Validation**: FluentValidation 11
- **Logging**: Serilog (Console & File Sinks)
- **Documentation**: Swagger UI with JWT Bearer authentication support

---

## Features

- **Authentication**: Register, Login, Refresh Token, Role-Based Authorization (`Admin`, `Employee`).
- **Tickets**: Create, Update, Delete, Get By ID, List, Search, Filter, Assign (Admin only).
- **Comments**: Full CRUD discussion comments on tickets.
- **Attachments**: Local file upload inside `Uploads/`, secure stream download, deletion.
- **Dashboard**: Aggregated metrics (Total, Open, In Progress, Resolved, Closed, Tickets by Priority/Category).

Role	Email	Password
Admin	admin@ticketdesk.com	Admin@123
Employee 1	john.doe@ticketdesk.com	User@123
Employee 2	jane.smith@ticketdesk.com	User@123
