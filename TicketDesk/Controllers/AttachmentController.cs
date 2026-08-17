using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TicketDesk.DTOs.Attachment;
using TicketDesk.Services.Interfaces;

namespace TicketDesk.Controllers;

[ApiController]
[Route("api/tickets/{ticketId:int}/attachments")]
[Authorize]
public class AttachmentController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentController(IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
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

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(AttachmentDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadAttachment(int ticketId, [FromForm] FileUploadDto uploadDto)
    {
        var attachment = await _attachmentService.UploadAttachmentAsync(ticketId, uploadDto.File, GetCurrentUserId(), GetCurrentUserRole());
        return CreatedAtAction(nameof(DownloadAttachment), new { ticketId }, attachment);
    }

    [HttpGet("download")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DownloadAttachment(int ticketId)
    {
        var (fileBytes, contentType, fileName) = await _attachmentService.DownloadAttachmentAsync(ticketId, GetCurrentUserId(), GetCurrentUserRole());
        return File(fileBytes, contentType, fileName);
    }

    [HttpDelete]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAttachment(int ticketId)
    {
        await _attachmentService.DeleteAttachmentAsync(ticketId, GetCurrentUserId(), GetCurrentUserRole());
        return NoContent();
    }
}
