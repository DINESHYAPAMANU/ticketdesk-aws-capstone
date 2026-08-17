using Microsoft.EntityFrameworkCore;
using TicketDesk.Models;

namespace TicketDesk.Data;

public static class SeedData
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // 1. Ensure Admin User exists
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@ticketdesk.com");
        if (adminUser == null)
        {
            adminUser = new User
            {
                FirstName = "System",
                LastName = "Admin",
                Email = "admin@ticketdesk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = Role.Admin,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(adminUser);
        }

        // 2. Ensure Demo User exists for user@ticketdesk.com / User@123
        var demoUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "user@ticketdesk.com");
        if (demoUser == null)
        {
            demoUser = new User
            {
                FirstName = "Demo",
                LastName = "User",
                Email = "user@ticketdesk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = Role.Employee,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(demoUser);
        }

        // 3. Ensure Employee 1 exists
        var employeeUser1 = await context.Users.FirstOrDefaultAsync(u => u.Email == "john.doe@ticketdesk.com");
        if (employeeUser1 == null)
        {
            employeeUser1 = new User
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@ticketdesk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = Role.Employee,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(employeeUser1);
        }

        // 4. Ensure Employee 2 exists
        var employeeUser2 = await context.Users.FirstOrDefaultAsync(u => u.Email == "jane.smith@ticketdesk.com");
        if (employeeUser2 == null)
        {
            employeeUser2 = new User
            {
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@ticketdesk.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123"),
                Role = Role.Employee,
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.AddAsync(employeeUser2);
        }

        await context.SaveChangesAsync();

        // 5. Ensure Sample Tickets exist
        if (!await context.Tickets.AnyAsync())
        {
            var sampleTickets = new List<Ticket>
            {
                new Ticket
                {
                    Title = "VPN Connection Issue",
                    Description = "Unable to connect to the corporate VPN network from remote workstation.",
                    Category = Category.Network,
                    Priority = Priority.High,
                    Status = Status.Open,
                    CreatedById = employeeUser1.Id,
                    AssignedToId = adminUser.Id,
                    CreatedDate = DateTime.UtcNow.AddDays(-3)
                },
                new Ticket
                {
                    Title = "Software License Request for VS Code",
                    Description = "Requesting enterprise IDE license key for development work.",
                    Category = Category.Software,
                    Priority = Priority.Medium,
                    Status = Status.InProgress,
                    CreatedById = employeeUser2.Id,
                    AssignedToId = adminUser.Id,
                    CreatedDate = DateTime.UtcNow.AddDays(-2)
                },
                new Ticket
                {
                    Title = "Monitor Flicker on Station 4",
                    Description = "Dual monitor setup flickering intermittently when connected via DisplayPort.",
                    Category = Category.Hardware,
                    Priority = Priority.Low,
                    Status = Status.Resolved,
                    CreatedById = employeeUser1.Id,
                    AssignedToId = adminUser.Id,
                    CreatedDate = DateTime.UtcNow.AddDays(-5),
                    UpdatedDate = DateTime.UtcNow.AddDays(-1)
                },
                new Ticket
                {
                    Title = "Access Granted to Financial Portal",
                    Description = "Need read access permissions for quarterly report dashboard.",
                    Category = Category.Access,
                    Priority = Priority.Critical,
                    Status = Status.Closed,
                    CreatedById = employeeUser2.Id,
                    AssignedToId = adminUser.Id,
                    CreatedDate = DateTime.UtcNow.AddDays(-10),
                    UpdatedDate = DateTime.UtcNow.AddDays(-4)
                }
            };

            await context.Tickets.AddRangeAsync(sampleTickets);
            await context.SaveChangesAsync();

            var sampleComments = new List<Comment>
            {
                new Comment
                {
                    TicketId = sampleTickets[0].Id,
                    UserId = adminUser.Id,
                    Content = "Please restart your network adapter and confirm if your firewall allows UDP 1194.",
                    CreatedDate = DateTime.UtcNow.AddDays(-2)
                },
                new Comment
                {
                    TicketId = sampleTickets[0].Id,
                    UserId = employeeUser1.Id,
                    Content = "Adapter restarted. Still seeing error code 800.",
                    CreatedDate = DateTime.UtcNow.AddDays(-1)
                },
                new Comment
                {
                    TicketId = sampleTickets[1].Id,
                    UserId = adminUser.Id,
                    Content = "License request forwarded to IT Procurement.",
                    CreatedDate = DateTime.UtcNow.AddDays(-1)
                }
            };

            await context.Comments.AddRangeAsync(sampleComments);
            await context.SaveChangesAsync();
        }
    }
}
