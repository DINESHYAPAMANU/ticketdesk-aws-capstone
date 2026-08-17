using FluentValidation;
using TicketDesk.DTOs.Comment;

namespace TicketDesk.Validators;

public class UpdateCommentDtoValidator : AbstractValidator<UpdateCommentDto>
{
    public UpdateCommentDtoValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Comment content cannot be empty.")
            .MaximumLength(1000).WithMessage("Comment content must not exceed 1000 characters.");
    }
}
