using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models;

namespace TaskManagement.API.Controllers
{
    public class CommentCreateDto
    {
        public string Comment { get; set; } = string.Empty;
    }

    public class CommentResponseDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    [ApiController]
    [Route("api/tasks/{taskId}/comments")]
    [Authorize]
    public class TaskCommentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskCommentsController(AppDbContext context)
        {
            _context = context;
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
        public async Task<ActionResult<IEnumerable<CommentResponseDto>>> GetComments(int taskId)
        {
            var userId = GetUserId();

            if (!await TaskBelongsToUser(taskId, userId))
            {
                return NotFound();
            }

            var comments = await _context.TaskComments
                .Where(c => c.TaskId == taskId)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    Username = c.User.Username,
                    Comment = c.Comment,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult<CommentResponseDto>> AddComment(int taskId, CommentCreateDto dto)
        {
            var userId = GetUserId();

            if (!await TaskBelongsToUser(taskId, userId))
            {
                return NotFound();
            }

            var comment = new TaskComment
            {
                TaskId = taskId,
                UserId = userId,
                Comment = dto.Comment
            };

            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);

            return CreatedAtAction(nameof(GetComments), new { taskId }, new CommentResponseDto
            {
                Id = comment.Id,
                TaskId = comment.TaskId,
                UserId = comment.UserId,
                Username = user!.Username,
                Comment = comment.Comment,
                CreatedAt = comment.CreatedAt
            });
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(int taskId, int commentId)
        {
            var userId = GetUserId();

            var comment = await _context.TaskComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.TaskId == taskId && c.UserId == userId);

            if (comment == null)
            {
                return NotFound();
            }

            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
