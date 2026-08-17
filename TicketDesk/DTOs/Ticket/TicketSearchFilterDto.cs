using TicketDesk.Models;

namespace TicketDesk.DTOs.Ticket;

public class TicketSearchFilterDto
{
    public string? SearchQuery { get; set; }
    public Category? Category { get; set; }
    public Priority? Priority { get; set; }
    public Status? Status { get; set; }
    public int? CreatedById { get; set; }
    public int? AssignedToId { get; set; }

    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
