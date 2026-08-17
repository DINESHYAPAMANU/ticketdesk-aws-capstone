using Microsoft.EntityFrameworkCore;
using TicketDesk.Data;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;

namespace TicketDesk.Repositories;

public class AttachmentRepository : GenericRepository<Attachment>, IAttachmentRepository
{
    public AttachmentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Attachment?> GetByTicketIdAsync(int ticketId)
    {
        return await _context.Attachments
            .FirstOrDefaultAsync(a => a.TicketId == ticketId);
    }
}
