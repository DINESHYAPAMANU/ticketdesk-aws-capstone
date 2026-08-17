using Microsoft.EntityFrameworkCore;
using TicketDesk.Data;
using TicketDesk.DTOs.Ticket;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;

namespace TicketDesk.Repositories;

public class TicketRepository : GenericRepository<Ticket>, ITicketRepository
{
    public TicketRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Ticket?> GetTicketWithDetailsAsync(int id)
    {
        return await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Attachment)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<(IEnumerable<Ticket> Items, int TotalCount)> GetFilteredTicketsAsync(TicketSearchFilterDto filter)
    {
        var query = _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Include(t => t.Comments)
            .Include(t => t.Attachment)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.SearchQuery))
        {
            var search = filter.SearchQuery.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(search) || t.Description.ToLower().Contains(search));
        }

        if (filter.Category.HasValue)
        {
            query = query.Where(t => t.Category == filter.Category.Value);
        }

        if (filter.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == filter.Priority.Value);
        }

        if (filter.Status.HasValue)
        {
            query = query.Where(t => t.Status == filter.Status.Value);
        }

        if (filter.CreatedById.HasValue)
        {
            query = query.Where(t => t.CreatedById == filter.CreatedById.Value);
        }

        if (filter.AssignedToId.HasValue)
        {
            query = query.Where(t => t.AssignedToId == filter.AssignedToId.Value);
        }

        int totalCount = await query.CountAsync();

        var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
        var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;

        var items = await query
            .OrderByDescending(t => t.CreatedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<Ticket>> GetUserTicketsAsync(int userId)
    {
        return await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTo)
            .Where(t => t.CreatedById == userId || t.AssignedToId == userId)
            .OrderByDescending(t => t.CreatedDate)
            .ToListAsync();
    }

    public async Task<int> GetTotalCountAsync(int? userId = null)
    {
        var query = _context.Tickets.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(t => t.CreatedById == userId.Value || t.AssignedToId == userId.Value);
        }
        return await query.CountAsync();
    }

    public async Task<IDictionary<Status, int>> GetCountByStatusAsync(int? userId = null)
    {
        var query = _context.Tickets.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(t => t.CreatedById == userId.Value || t.AssignedToId == userId.Value);
        }

        var counts = await query
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Status, x => x.Count);

        foreach (Status status in Enum.GetValues(typeof(Status)))
        {
            if (!counts.ContainsKey(status))
            {
                counts[status] = 0;
            }
        }

        return counts;
    }

    public async Task<IDictionary<Priority, int>> GetCountByPriorityAsync(int? userId = null)
    {
        var query = _context.Tickets.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(t => t.CreatedById == userId.Value || t.AssignedToId == userId.Value);
        }

        var counts = await query
            .GroupBy(t => t.Priority)
            .Select(g => new { Priority = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Priority, x => x.Count);

        foreach (Priority priority in Enum.GetValues(typeof(Priority)))
        {
            if (!counts.ContainsKey(priority))
            {
                counts[priority] = 0;
            }
        }

        return counts;
    }

    public async Task<IDictionary<Category, int>> GetCountByCategoryAsync(int? userId = null)
    {
        var query = _context.Tickets.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(t => t.CreatedById == userId.Value || t.AssignedToId == userId.Value);
        }

        var counts = await query
            .GroupBy(t => t.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Category, x => x.Count);

        foreach (Category category in Enum.GetValues(typeof(Category)))
        {
            if (!counts.ContainsKey(category))
            {
                counts[category] = 0;
            }
        }

        return counts;
    }
}
