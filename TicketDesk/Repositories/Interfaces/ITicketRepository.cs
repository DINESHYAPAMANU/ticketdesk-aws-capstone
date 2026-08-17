using TicketDesk.DTOs.Ticket;
using TicketDesk.Models;

namespace TicketDesk.Repositories.Interfaces;

public interface ITicketRepository : IGenericRepository<Ticket>
{
    Task<Ticket?> GetTicketWithDetailsAsync(int id);
    Task<(IEnumerable<Ticket> Items, int TotalCount)> GetFilteredTicketsAsync(TicketSearchFilterDto filter);
    Task<IEnumerable<Ticket>> GetUserTicketsAsync(int userId);
    Task<int> GetTotalCountAsync(int? userId = null);
    Task<IDictionary<Status, int>> GetCountByStatusAsync(int? userId = null);
    Task<IDictionary<Priority, int>> GetCountByPriorityAsync(int? userId = null);
    Task<IDictionary<Category, int>> GetCountByCategoryAsync(int? userId = null);
}
