using FluentValidation;
using TicketDesk.DTOs.Comment;

namespace TicketDesk.Validators;

public class CreateCommentDtoValidator : AbstractValidator<CreateCommentDto>
{
    public CreateCommentDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content cannot be empty.")
            .MaximumLength(1000).WithMessage("Comment content must not exceed 1000 characters.");
    }
}
