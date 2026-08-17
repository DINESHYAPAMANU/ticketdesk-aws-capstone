using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TicketDesk.DTOs.Comment;
using TicketDesk.Services.Interfaces;

namespace TicketDesk.Controllers;

[ApiController]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out int userId) ? userId : 0;
    }

    private string GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }

    [HttpPost("api/tickets/{ticketId:int}/comments")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(CommentDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateComment(int ticketId, [FromBody] CreateCommentDto dto)
    {
        var comment = await _commentService.CreateCommentAsync(ticketId, dto, GetCurrentUserId());
        return CreatedAtAction(nameof(GetCommentsByTicketId), new { ticketId }, comment);
    }

    [HttpGet("api/tickets/{ticketId:int}/comments")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<CommentDto>))]
    public async Task<IActionResult> GetCommentsByTicketId(int ticketId)
    {
        var comments = await _commentService.GetCommentsByTicketIdAsync(ticketId);
        return Ok(comments);
    }

    [HttpPut("api/comments/{commentId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CommentDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateComment(int commentId, [FromBody] UpdateCommentDto dto)
    {
        var comment = await _commentService.UpdateCommentAsync(commentId, dto, GetCurrentUserId(), GetCurrentUserRole());
        return Ok(comment);
    }

    [HttpDelete("api/comments/{commentId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        await _commentService.DeleteCommentAsync(commentId, GetCurrentUserId(), GetCurrentUserRole());
        return NoContent();
    }
}
