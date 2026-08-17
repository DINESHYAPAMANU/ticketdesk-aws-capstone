using TicketDesk.DTOs.Attachment;
using TicketDesk.DTOs.Comment;

namespace TicketDesk.DTOs.Ticket;

public class TicketDetailDto : TicketDto
{
    public List<CommentDto> Comments { get; set; } = new();
    public AttachmentDto? Attachment { get; set; }
}
