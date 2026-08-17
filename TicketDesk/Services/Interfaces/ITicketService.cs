using TicketDesk.DTOs.Ticket;

namespace TicketDesk.Services.Interfaces;

public interface ITicketService
{
    Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int currentUserId);
    Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto, int currentUserId, string userRole);
    Task<bool> DeleteTicketAsync(int id, int currentUserId, string userRole);
    Task<TicketDetailDto?> GetTicketByIdAsync(int id, int currentUserId, string userRole);
    Task<(IEnumerable<TicketDto> Items, int TotalCount)> GetFilteredTicketsAsync(TicketSearchFilterDto filter, int currentUserId, string userRole);
    Task<TicketDto> AssignTicketAsync(int id, AssignTicketDto dto);
}
