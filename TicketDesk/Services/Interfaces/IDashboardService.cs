using TicketDesk.DTOs.Dashboard;

namespace TicketDesk.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId, string userRole);
}
