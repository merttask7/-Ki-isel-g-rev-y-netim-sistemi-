using System.ComponentModel.DataAnnotations;
using TaskManagement.API.Models;

namespace TaskManagement.API.DTOs
{
    public class TaskCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public TaskPriority Priority { get; set; } = TaskPriority.Normal;

        public DateTime? DueDate { get; set; }

        public int? CategoryId { get; set; }
    }

    public class TaskUpdateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public TaskPriority? Priority { get; set; }

        public TaskItemStatus? Status { get; set; }

        public DateTime? DueDate { get; set; }

        public int? CategoryId { get; set; }
    }

    public class TaskResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TaskPriority Priority { get; set; }
        public TaskItemStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }
}