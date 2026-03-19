using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TicketMasterAPI.Data;
using TicketMasterAPI.Dtos.Auth;
using TicketMasterAPI.Models;
using TicketMasterAPI.Services;

namespace TicketMasterAPI.Controllers;

[ApiController]
[Route("")]
public class AuthController(AppDbContext dbContext, PasswordService passwordService, JwtTokenService jwtTokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var normalizedRole = request.Role.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase)
            ? Roles.Admin
            : Roles.User;

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await dbContext.Usuarios.AnyAsync(u => u.Email == email);
        if (exists)
        {
            return Conflict(new { message = "Email already registered." });
        }

        var user = new Usuario
        {
            Email = email,
            Password = passwordService.HashPassword(request.Password),
            Role = normalizedRole
        };

        dbContext.Usuarios.Add(user);
        await dbContext.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Email = user.Email,
            Role = user.Role,
            Token = jwtTokenService.GenerateToken(user)
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !passwordService.VerifyPassword(request.Password, user.Password))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new AuthResponse
        {
            Email = user.Email,
            Role = user.Role,
            Token = jwtTokenService.GenerateToken(user)
        });
    }
}
