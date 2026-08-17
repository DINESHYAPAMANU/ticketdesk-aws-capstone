using AutoMapper;
using TicketDesk.DTOs.Attachment;
using TicketDesk.DTOs.Auth;
using TicketDesk.DTOs.Comment;
using TicketDesk.DTOs.Ticket;
using TicketDesk.Models;

namespace TicketDesk.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, AuthResponseDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

        CreateMap<Ticket, TicketDto>()
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy != null ? $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : string.Empty))
            .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => src.AssignedTo != null ? $"{src.AssignedTo.FirstName} {src.AssignedTo.LastName}" : null))
            .ForMember(dest => dest.CommentsCount, opt => opt.MapFrom(src => src.Comments != null ? src.Comments.Count : 0))
            .ForMember(dest => dest.HasAttachment, opt => opt.MapFrom(src => src.Attachment != null));

        CreateMap<Ticket, TicketDetailDto>()
            .IncludeBase<Ticket, TicketDto>()
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments))
            .ForMember(dest => dest.Attachment, opt => opt.MapFrom(src => src.Attachment));

        CreateMap<CreateTicketDto, Ticket>();
        CreateMap<UpdateTicketDto, Ticket>();

        CreateMap<Comment, CommentDto>()
            .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : string.Empty));

        CreateMap<CreateCommentDto, Comment>();

        CreateMap<Attachment, AttachmentDto>();
    }
}
