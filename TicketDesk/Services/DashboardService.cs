using Microsoft.Extensions.Logging;
using TicketDesk.DTOs.Dashboard;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;
using TicketDesk.Services.Interfaces;

namespace TicketDesk.Services;

public class DashboardService : IDashboardService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(ITicketRepository ticketRepository, ILogger<DashboardService> logger)
    {
        _ticketRepository = ticketRepository;
        _logger = logger;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(int userId, string userRole)
    {
        int? filterUserId = userRole == Role.Admin.ToString() ? null : userId;

        var totalTickets = await _ticketRepository.GetTotalCountAsync(filterUserId);
        var statusCounts = await _ticketRepository.GetCountByStatusAsync(filterUserId);
        var priorityCounts = await _ticketRepository.GetCountByPriorityAsync(filterUserId);
        var categoryCounts = await _ticketRepository.GetCountByCategoryAsync(filterUserId);

        int GetStatusCount(Status status) => statusCounts.TryGetValue(status, out var val) ? val : 0;

        var summary = new DashboardSummaryDto
        {
            TotalTickets = totalTickets,
            OpenTickets = GetStatusCount(Status.Open),
            InProgressTickets = GetStatusCount(Status.InProgress),
            ResolvedTickets = GetStatusCount(Status.Resolved),
            ClosedTickets = GetStatusCount(Status.Closed),

            TicketsByPriority = priorityCounts.Select(kvp => new PriorityCountDto
            {
                Priority = kvp.Key.ToString(),
                Count = kvp.Value
            }).ToList(),

            TicketsByCategory = categoryCounts.Select(kvp => new CategoryCountDto
            {
                Category = kvp.Key.ToString(),
                Count = kvp.Value
            }).ToList()
        };

        _logger.LogInformation("Dashboard metrics summary generated for User {UserId} (Role: {Role}).", userId, userRole);
        return summary;
    }
}
