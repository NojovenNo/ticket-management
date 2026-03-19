using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketMasterAPI.Data;
using TicketMasterAPI.Dtos.Tickets;
using TicketMasterAPI.Models;

namespace TicketMasterAPI.Controllers;

[ApiController]
[Route("tickets")]
[Authorize]
public class TicketsController(AppDbContext dbContext) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<TicketResponse>> Create(CreateTicketRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var ticket = new Ticket
        {
            Title = request.Title,
            Description = request.Description,
            Status = TicketStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UserId = userId.Value
        };

        dbContext.Tickets.Add(ticket);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, MapTicket(ticket));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketResponse>>> GetAll()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userId = GetCurrentUserId();

        IQueryable<Ticket> query = dbContext.Tickets.AsNoTracking();

        if (!string.Equals(role, Roles.Admin, StringComparison.OrdinalIgnoreCase))
        {
            if (userId is null)
            {
                return Unauthorized();
            }

            query = query.Where(t => t.UserId == userId.Value);
        }

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketResponse
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UserId = t.UserId
            })
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketResponse>> GetById(int id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userId = GetCurrentUserId();

        var ticket = await dbContext.Tickets.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (ticket is null)
        {
            return NotFound();
        }

        var isAdmin = string.Equals(role, Roles.Admin, StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && ticket.UserId != userId)
        {
            return Forbid();
        }

        return Ok(MapTicket(ticket));
    }

    [HttpPatch("{id:int}/close")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<TicketResponse>> CloseTicket(int id)
    {
        var ticket = await dbContext.Tickets.FirstOrDefaultAsync(t => t.Id == id);
        if (ticket is null)
        {
            return NotFound();
        }

        if (ticket.Status == TicketStatus.Closed)
        {
            return BadRequest(new { message = "Ticket is already closed." });
        }

        ticket.Status = TicketStatus.Closed;
        await dbContext.SaveChangesAsync();

        return Ok(MapTicket(ticket));
    }

    private int? GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdValue, out var userId) ? userId : null;
    }

    private static TicketResponse MapTicket(Ticket ticket) => new()
    {
        Id = ticket.Id,
        Title = ticket.Title,
        Description = ticket.Description,
        Status = ticket.Status,
        CreatedAt = ticket.CreatedAt,
        UserId = ticket.UserId
    };
}
