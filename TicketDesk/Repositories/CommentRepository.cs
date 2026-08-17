using Microsoft.EntityFrameworkCore;
using TicketDesk.Data;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;

namespace TicketDesk.Repositories;

public class CommentRepository : GenericRepository<Comment>, ICommentRepository
{
    public CommentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Comment?> GetCommentWithUserAsync(int commentId)
    {
        return await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == commentId);
    }

    public async Task<IEnumerable<Comment>> GetCommentsByTicketIdAsync(int ticketId)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Where(c => c.TicketId == ticketId)
            .OrderBy(c => c.CreatedDate)
            .ToListAsync();
    }
}
