using AutoMapper;
using Microsoft.Extensions.Logging;
using TicketDesk.DTOs.Comment;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;
using TicketDesk.Services.Interfaces;

namespace TicketDesk.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<CommentService> _logger;

    public CommentService(
        ICommentRepository commentRepository,
        ITicketRepository ticketRepository,
        IMapper mapper,
        ILogger<CommentService> logger)
    {
        _commentRepository = commentRepository;
        _ticketRepository = ticketRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<CommentDto> CreateCommentAsync(int ticketId, CreateCommentDto dto, int currentUserId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        var comment = new Comment
        {
            TicketId = ticketId,
            UserId = currentUserId,
            Content = dto.Content,
            CreatedDate = DateTime.UtcNow
        };

        await _commentRepository.AddAsync(comment);
        await _commentRepository.SaveChangesAsync();

        _logger.LogInformation("Comment {CommentId} added to Ticket {TicketId} by User {UserId}", comment.Id, ticketId, currentUserId);

        var createdComment = await _commentRepository.GetCommentWithUserAsync(comment.Id);
        return _mapper.Map<CommentDto>(createdComment ?? comment);
    }

    public async Task<CommentDto> UpdateCommentAsync(int commentId, UpdateCommentDto dto, int currentUserId, string userRole)
    {
        var comment = await _commentRepository.GetCommentWithUserAsync(commentId);
        if (comment == null)
        {
            throw new KeyNotFoundException($"Comment with ID {commentId} was not found.");
        }

        if (userRole != Role.Admin.ToString() && comment.UserId != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this comment.");
        }

        comment.Content = dto.Content;
        comment.UpdatedDate = DateTime.UtcNow;

        _commentRepository.Update(comment);
        await _commentRepository.SaveChangesAsync();

        _logger.LogInformation("Comment {CommentId} updated by User {UserId}", commentId, currentUserId);
        return _mapper.Map<CommentDto>(comment);
    }

    public async Task<bool> DeleteCommentAsync(int commentId, int currentUserId, string userRole)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
        {
            throw new KeyNotFoundException($"Comment with ID {commentId} was not found.");
        }

        if (userRole != Role.Admin.ToString() && comment.UserId != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this comment.");
        }

        _commentRepository.Remove(comment);
        await _commentRepository.SaveChangesAsync();

        _logger.LogInformation("Comment {CommentId} deleted by User {UserId}", commentId, currentUserId);
        return true;
    }

    public async Task<IEnumerable<CommentDto>> GetCommentsByTicketIdAsync(int ticketId)
    {
        var comments = await _commentRepository.GetCommentsByTicketIdAsync(ticketId);
        return _mapper.Map<IEnumerable<CommentDto>>(comments);
    }
}
