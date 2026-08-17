using TicketDesk.DTOs.Comment;

namespace TicketDesk.Services.Interfaces;

public interface ICommentService
{
    Task<CommentDto> CreateCommentAsync(int ticketId, CreateCommentDto dto, int currentUserId);
    Task<CommentDto> UpdateCommentAsync(int commentId, UpdateCommentDto dto, int currentUserId, string userRole);
    Task<bool> DeleteCommentAsync(int commentId, int currentUserId, string userRole);
    Task<IEnumerable<CommentDto>> GetCommentsByTicketIdAsync(int ticketId);
}
