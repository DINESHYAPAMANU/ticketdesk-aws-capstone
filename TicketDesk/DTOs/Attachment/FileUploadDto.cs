using Microsoft.AspNetCore.Http;

namespace TicketDesk.DTOs.Attachment;

public class FileUploadDto
{
    public IFormFile File { get; set; } = null!;
}
