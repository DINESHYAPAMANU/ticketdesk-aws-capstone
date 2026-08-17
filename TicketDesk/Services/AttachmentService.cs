using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TicketDesk.DTOs.Attachment;
using TicketDesk.Models;
using TicketDesk.Repositories.Interfaces;
using TicketDesk.Services.Interfaces;

namespace TicketDesk.Services;

public class AttachmentService : IAttachmentService
{
    private readonly IAttachmentRepository _attachmentRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly IMapper _mapper;
    private readonly ILogger<AttachmentService> _logger;

    public AttachmentService(
        IAttachmentRepository attachmentRepository,
        ITicketRepository ticketRepository,
        IWebHostEnvironment environment,
        IMapper mapper,
        ILogger<AttachmentService> logger)
    {
        _attachmentRepository = attachmentRepository;
        _ticketRepository = ticketRepository;
        _environment = environment;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<AttachmentDto> UploadAttachmentAsync(int ticketId, IFormFile file, int currentUserId, string userRole)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("No file was uploaded or file is empty.");
        }

        var ticket = await _ticketRepository.GetTicketWithDetailsAsync(ticketId);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        if (userRole != Role.Admin.ToString() && ticket.CreatedById != currentUserId && ticket.AssignedToId != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to attach files to this ticket.");
        }

        var existingAttachment = await _attachmentRepository.GetByTicketIdAsync(ticketId);
        if (existingAttachment != null)
        {
            DeletePhysicalFile(existingAttachment.FilePath);
            _attachmentRepository.Remove(existingAttachment);
        }

        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var attachment = new Attachment
        {
            TicketId = ticketId,
            FileName = file.FileName,
            FilePath = filePath,
            ContentType = file.ContentType,
            FileSize = file.Length,
            UploadedDate = DateTime.UtcNow
        };

        await _attachmentRepository.AddAsync(attachment);
        await _attachmentRepository.SaveChangesAsync();

        _logger.LogInformation("File {FileName} uploaded for Ticket {TicketId}", file.FileName, ticketId);
        return _mapper.Map<AttachmentDto>(attachment);
    }

    public async Task<(byte[] FileBytes, string ContentType, string FileName)> DownloadAttachmentAsync(int ticketId, int currentUserId, string userRole)
    {
        var ticket = await _ticketRepository.GetTicketWithDetailsAsync(ticketId);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        if (userRole != Role.Admin.ToString() && ticket.CreatedById != currentUserId && ticket.AssignedToId != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to download files for this ticket.");
        }

        var attachment = await _attachmentRepository.GetByTicketIdAsync(ticketId);
        if (attachment == null || !File.Exists(attachment.FilePath))
        {
            throw new KeyNotFoundException("Attachment file not found.");
        }

        var fileBytes = await File.ReadAllBytesAsync(attachment.FilePath);
        return (fileBytes, attachment.ContentType, attachment.FileName);
    }

    public async Task<bool> DeleteAttachmentAsync(int ticketId, int currentUserId, string userRole)
    {
        var ticket = await _ticketRepository.GetTicketWithDetailsAsync(ticketId);
        if (ticket == null)
        {
            throw new KeyNotFoundException($"Ticket with ID {ticketId} was not found.");
        }

        if (userRole != Role.Admin.ToString() && ticket.CreatedById != currentUserId)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete attachments for this ticket.");
        }

        var attachment = await _attachmentRepository.GetByTicketIdAsync(ticketId);
        if (attachment == null)
        {
            throw new KeyNotFoundException("Attachment not found for this ticket.");
        }

        DeletePhysicalFile(attachment.FilePath);
        _attachmentRepository.Remove(attachment);
        await _attachmentRepository.SaveChangesAsync();

        _logger.LogInformation("Attachment deleted for Ticket {TicketId}", ticketId);
        return true;
    }

    private void DeletePhysicalFile(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete physical file at {FilePath}", filePath);
        }
    }
}
