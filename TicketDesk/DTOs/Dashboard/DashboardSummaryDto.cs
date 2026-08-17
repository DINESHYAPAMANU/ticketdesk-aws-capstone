namespace TicketDesk.DTOs.Dashboard;

public class DashboardSummaryDto
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int InProgressTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int ClosedTickets { get; set; }

    public List<PriorityCountDto> TicketsByPriority { get; set; } = new();
    public List<CategoryCountDto> TicketsByCategory { get; set; } = new();
}
