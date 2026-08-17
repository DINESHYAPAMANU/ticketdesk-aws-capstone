FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TicketDesk.csproj", "./"]
RUN dotnet restore "TicketDesk.csproj"
COPY . .
RUN dotnet publish "TicketDesk.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create non-root user for container security hardening
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build --chown=appuser:appuser /app/publish .
ENTRYPOINT ["dotnet", "TicketDesk.dll"]
