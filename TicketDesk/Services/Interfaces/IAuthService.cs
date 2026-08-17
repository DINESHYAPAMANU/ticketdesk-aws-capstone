using TicketDesk.DTOs.Auth;

namespace TicketDesk.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
}
