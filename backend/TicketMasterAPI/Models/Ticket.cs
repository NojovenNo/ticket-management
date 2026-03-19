using System.ComponentModel.DataAnnotations;

namespace TicketMasterAPI.Models;

public class Ticket
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = TicketStatus.Open;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public Usuario? User { get; set; }
}

public static class TicketStatus
{
    public const string Open = "Open";
    public const string Closed = "Closed";
}
