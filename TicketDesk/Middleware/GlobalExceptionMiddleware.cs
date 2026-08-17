using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace TicketDesk.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred while processing request {Method} {Path}", context.Request.Method, context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errors) = exception switch
        {
            KeyNotFoundException keyNotFound => ((int)HttpStatusCode.NotFound, keyNotFound.Message, null),
            UnauthorizedAccessException unauthorized => ((int)HttpStatusCode.Unauthorized, unauthorized.Message, null),
            InvalidOperationException invalidOp => ((int)HttpStatusCode.BadRequest, invalidOp.Message, null),
            ArgumentException argEx => ((int)HttpStatusCode.BadRequest, argEx.Message, null),
            FluentValidation.ValidationException valEx => ((int)HttpStatusCode.BadRequest, "Validation failed.", (object?)valEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage })),
            _ => ((int)HttpStatusCode.InternalServerError, $"{exception.GetType().FullName}: {exception.Message} | Stack: {exception.StackTrace} | Inner: {exception.InnerException?.ToString()}", null)
        };

        context.Response.StatusCode = statusCode;

        var response = new ErrorResponse
        {
            StatusCode = statusCode,
            Message = message,
            Errors = errors,
            Timestamp = DateTime.UtcNow
        };

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
    }
}

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? Errors { get; set; }
    public DateTime Timestamp { get; set; }
}

public static class GlobalExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
