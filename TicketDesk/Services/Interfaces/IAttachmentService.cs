using Microsoft.AspNetCore.Http;
using TicketDesk.DTOs.Attachment;

namespace TicketDesk.Services.Interfaces;

public interface IAttachmentService
{
    Task<AttachmentDto> UploadAttachmentAsync(int ticketId, IFormFile file, int currentUserId, string userRole);
    Task<(byte[] FileBytes, string ContentType, string FileName)> DownloadAttachmentAsync(int ticketId, int currentUserId, string userRole);
    Task<bool> DeleteAttachmentAsync(int ticketId, int currentUserId, string userRole);
}
