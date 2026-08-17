using TicketDesk.Models;

namespace TicketDesk.DTOs.Ticket;

public class UpdateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Category Category { get; set; }
    public Priority Priority { get; set; }
    public Status Status { get; set; }
}
