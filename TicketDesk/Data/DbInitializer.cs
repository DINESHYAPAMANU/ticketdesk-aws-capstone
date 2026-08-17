using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace TicketDesk.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        int maxRetries = 30;
        int delaySeconds = 5;

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                logger.LogInformation("Ensuring database is created and migrating to latest schema version (Attempt {Attempt}/{MaxRetries})...", attempt, maxRetries);
                await context.Database.MigrateAsync();

                logger.LogInformation("Seeding database with initial default data...");
                await SeedData.SeedAsync(context);

                logger.LogInformation("Database initialization completed successfully.");
                break;
            }
            catch (Exception ex)
            {
                if (attempt == maxRetries)
                {
                    logger.LogError(ex, "Failed to initialize or seed database after {MaxRetries} attempts.", maxRetries);
                    throw;
                }

                logger.LogWarning("Database not ready yet (Attempt {Attempt}/{MaxRetries}). Retrying in {Delay}s... Error: {Message}", attempt, maxRetries, delaySeconds, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
    }
}
