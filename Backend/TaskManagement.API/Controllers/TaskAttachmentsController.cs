using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models;

namespace TaskManagement.API.Controllers
{
    public class AttachmentResponseDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? ContentType { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    [ApiController]
    [Route("api/tasks/{taskId}/attachments")]
    [Authorize]
    public class TaskAttachmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

        public TaskAttachmentsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        private async Task<bool> TaskBelongsToUser(int taskId, int userId)
        {
            return await _context.Tasks.AnyAsync(t => t.Id == taskId && t.UserId == userId);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttachmentResponseDto>>> GetAttachments(int taskId)
        {
            var userId = GetUserId();

            if (!await TaskBelongsToUser(taskId, userId))
            {
                return NotFound();
            }

            var attachments = await _context.TaskAttachments
                .Where(a => a.TaskId == taskId)
                .Select(a => new AttachmentResponseDto
                {
                    Id = a.Id,
                    TaskId = a.TaskId,
                    FileName = a.FileName,
                    FileSize = a.FileSize,
                    ContentType = a.ContentType,
                    UploadedAt = a.UploadedAt
                })
                .ToListAsync();

            return Ok(attachments);
        }

        [HttpPost]
        public async Task<ActionResult<AttachmentResponseDto>> UploadAttachment(int taskId, IFormFile file)
        {
            var userId = GetUserId();

            if (!await TaskBelongsToUser(taskId, userId))
            {
                return NotFound();
            }

            if (file == null || file.Length == 0)
            {
                return BadRequest("Dosya boş olamaz.");
            }

            if (file.Length > MaxFileSize)
            {
                return BadRequest("Dosya boyutu 10 MB'ı geçemez.");
            }

            var uploadsRoot = Path.Combine(_environment.ContentRootPath, "Uploads");
            Directory.CreateDirectory(uploadsRoot);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsRoot, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new TaskAttachment
            {
                TaskId = taskId,
                FileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                ContentType = file.ContentType
            };

            _context.TaskAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttachments), new { taskId }, new AttachmentResponseDto
            {
                Id = attachment.Id,
                TaskId = attachment.TaskId,
                FileName = attachment.FileName,
                FileSize = attachment.FileSize,
                ContentType = attachment.ContentType,
                UploadedAt = attachment.UploadedAt
            });
        }

        [HttpGet("{attachmentId}/download")]
        public async Task<IActionResult> DownloadAttachment(int taskId, int attachmentId)
        {
            var userId = GetUserId();

            if (!await TaskBelongsToUser(taskId, userId))
            {
                return NotFound();
            }

            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId && a.TaskId == taskId);

            if (attachment == null || !System.IO.File.Exists(attachment.FilePath))
            {
                return NotFound();
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(attachment.FilePath);
            return File(bytes, attachment.ContentType ?? "application/octet-stream", attachment.FileName);
        }

        [HttpDelete("{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(int taskId, int attachmentId)
        {
            var userId = GetUserId();

            if (!await TaskBelongsToUser(taskId, userId))
            {
                return NotFound();
            }

            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId && a.TaskId == taskId);

            if (attachment == null)
            {
                return NotFound();
            }

            if (System.IO.File.Exists(attachment.FilePath))
            {
                System.IO.File.Delete(attachment.FilePath);
            }

            _context.TaskAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}