using System.ComponentModel.DataAnnotations;

namespace TicketMasterAPI.Dtos.Tickets;

public class CreateTicketRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
}
