using TicketDesk.Models;

namespace TicketDesk.Repositories.Interfaces;

public interface IAttachmentRepository : IGenericRepository<Attachment>
{
    Task<Attachment?> GetByTicketIdAsync(int ticketId);
}
