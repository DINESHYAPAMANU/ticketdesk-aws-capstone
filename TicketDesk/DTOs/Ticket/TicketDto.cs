using TicketDesk.Models;

namespace TicketDesk.DTOs.Ticket;

public class TicketDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Category Category { get; set; }
    public string CategoryName => Category.ToString();
    public Priority Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public Status Status { get; set; }
    public string StatusName => Status.ToString();

    public int CreatedById { get; set; }
    public string CreatedByName { get; set; } = string.Empty;

    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }

    public DateTime CreatedDate { get; set; }
    public DateTime? UpdatedDate { get; set; }

    public int CommentsCount { get; set; }
    public bool HasAttachment { get; set; }
}
