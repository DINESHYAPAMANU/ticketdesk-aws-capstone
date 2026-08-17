using FluentValidation;
using TicketDesk.DTOs.Ticket;

namespace TicketDesk.Validators;

public class CreateTicketDtoValidator : AbstractValidator<CreateTicketDto>
{
    public CreateTicketDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Ticket title is required.")
            .MaximumLength(150).WithMessage("Title must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Ticket description is required.");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid category specified.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid priority level specified.");
    }
}
