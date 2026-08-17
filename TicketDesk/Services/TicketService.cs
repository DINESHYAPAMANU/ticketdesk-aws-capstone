using AutoMapper;
using Microsoft.Extensions.Logging;
using TicketDesk.DTOs.Ticket;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;
using TicketDesk.Services.Interfaces;

namespace TicketDesk.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<TicketService> _logger;

    public TicketService(
        ITicketRepository ticketRepository,
        IUserRepository userRepository,
        IMapper mapper,
        ILogger<TicketService> logger)
    {
        _ticketRepository = ticketRepository;
        _userRepository = userRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto, int currentUserId)
    {
        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Priority = dto.Priority,
            Status = Status.Open,
            CreatedById = currentUserId,
            CreatedDate = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} created by User {UserId}", ticket.Id, currentUserId);

        var createdTicket = await _ticketRepository.GetTicketWithDetailsAsync(ticket.Id);
        return _mapper.Map<TicketDto>(createdTicket ?? ticket);
    }

    public async Task<TicketDto> UpdateTicketAsync(int id, UpdateTicketDto dto, int currentUserId, string userRole)
    {
        var ticket = await _ticketRepository.GetTicketWithDetailsAsync(id);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {id} was not found.");
        }

        if (userRole != Role.Admin.ToString() && ticket.CreatedById != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to update this ticket.");
        }

        ticket.Title = dto.Title;
        ticket.Description = dto.Description;
        ticket.Category = dto.Category;
        ticket.Priority = dto.Priority;
        ticket.Status = dto.Status;
        ticket.UpdatedDate = DateTime.UtcNow;

        _ticketRepository.Update(ticket);
        await _ticketRepository.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} updated by User {UserId}", id, currentUserId);

        return _mapper.Map<TicketDto>(ticket);
    }

    public async Task<bool> DeleteTicketAsync(int id, int currentUserId, string userRole)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {id} was not found.");
        }

        if (userRole != Role.Admin.ToString() && ticket.CreatedById != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this ticket.");
        }

        _ticketRepository.Remove(ticket);
        await _ticketRepository.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} deleted by User {UserId}", id, currentUserId);
        return true;
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(int id, int currentUserId, string userRole)
    {
        var ticket = await _ticketRepository.GetTicketWithDetailsAsync(id);
        if (ticket == null)
        {
            return null;
        }

        if (userRole != Role.Admin.ToString() && ticket.CreatedById != currentUserId && ticket.AssignedToId != currentUserId)
        {
            throw new UnauthorizedAccessException("You do not have permission to view this ticket.");
        }

        return _mapper.Map<TicketDetailDto>(ticket);
    }

    public async Task<(IEnumerable<TicketDto> Items, int TotalCount)> GetFilteredTicketsAsync(TicketSearchFilterDto filter, int currentUserId, string userRole)
    {
        if (userRole != Role.Admin.ToString())
        {
            filter.CreatedById = currentUserId;
        }

        var (items, totalCount) = await _ticketRepository.GetFilteredTicketsAsync(filter);
        var dtos = _mapper.Map<IEnumerable<TicketDto>>(items);

        return (dtos, totalCount);
    }

    public async Task<TicketDto> AssignTicketAsync(int id, AssignTicketDto dto)
    {
        var ticket = await _ticketRepository.GetTicketWithDetailsAsync(id);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {id} was not found.");
        }

        var assignee = await _userRepository.GetByIdAsync(dto.AssignedToId);
        if (assignee == null)
        {
            throw new KeyNotFoundException($"Assignee User with ID {dto.AssignedToId} was not found.");
        }

        ticket.AssignedToId = dto.AssignedToId;
        if (ticket.Status == Status.Open)
        {
            ticket.Status = Status.InProgress;
        }
        ticket.UpdatedDate = DateTime.UtcNow;

        _ticketRepository.Update(ticket);
        await _ticketRepository.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} assigned to User {AssigneeId}", id, dto.AssignedToId);

        var updatedTicket = await _ticketRepository.GetTicketWithDetailsAsync(id);
        return _mapper.Map<TicketDto>(updatedTicket);
    }
}
