using TicketDesk.Models;

namespace TicketDesk.Repositories.Interfaces;

public interface ICommentRepository : IGenericRepository<Comment>
{
    Task<Comment?> GetCommentWithUserAsync(int commentId);
    Task<IEnumerable<Comment>> GetCommentsByTicketIdAsync(int ticketId);
}
