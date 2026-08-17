using FluentValidation;
using TicketDesk.DTOs.Ticket;

namespace TicketDesk.Validators;

public class AssignTicketDtoValidator : AbstractValidator<AssignTicketDto>
{
    public AssignTicketDtoValidator()
    {
        RuleFor(x => x.AssignedToId)
            .GreaterThan(0).WithMessage("A valid target User ID is required for ticket assignment.");
    }
}
