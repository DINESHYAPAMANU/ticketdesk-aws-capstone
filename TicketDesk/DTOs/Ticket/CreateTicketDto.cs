using TicketDesk.Models;

namespace TicketDesk.DTOs.Ticket;

public class CreateTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Category Category { get; set; } = Category.Other;
    public Priority Priority { get; set; } = Priority.Medium;
}
