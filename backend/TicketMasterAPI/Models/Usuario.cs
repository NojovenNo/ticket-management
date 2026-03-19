using System.ComponentModel.DataAnnotations;

namespace TicketMasterAPI.Models;

public class Usuario
{
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = Roles.User;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}

public static class Roles
{
    public const string Admin = "Admin";
    public const string User = "User";
}
