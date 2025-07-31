using ResiBuy.Server.Infrastructure.DbServices.ProductDetailDbServices;
using ResiBuy.Server.Infrastructure.DbServices.ReviewDbServices;
using ResiBuy.Server.Infrastructure.Model.DTOs.ReviewDtos;

namespace ResiBuy.Server.Application.Commands.ReviewCommands
{
    public record CreateReviewCommand(CreateReviewDto Dto) : IRequest<ResponseModel>;
    public class CreateReviewCommandHandler(IReviewDbService reviewDbService, IProductDetailDbService productDetailDbService,
        IUserDbService userDbService, INotificationService notificationService) : IRequestHandler<CreateReviewCommand, ResponseModel>
    {
        public async Task<ResponseModel> Handle(CreateReviewCommand command, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(command.Dto.UserId)) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Thiếu Id người dùng");
            if (command.Dto.Rate < 0 || command.Dto.Rate > 5) throw new CustomException(ExceptionErrorCode.ValidationFailed, "Đánh giá không hợp lệ");
            var user = await userDbService.GetUserById(command.Dto.UserId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại người dùng");
            var productDetail = await productDetailDbService.GetByIdAsync(command.Dto.ProductDetailId) ?? throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không tồn tại chi tiết sản phẩm");
            var createdReview = await reviewDbService.GetUserReview(command.Dto.UserId, command.Dto.ProductDetailId);
            if (createdReview != null)
            {
                createdReview.Rate = command.Dto.Rate;
                createdReview.Comment = command.Dto.Comment;
                createdReview.IsAnonymous = command.Dto.IsAnonymous;
                createdReview.UpdatedAt = DateTime.Now;
                await reviewDbService.UpdateAsync(createdReview);
            }
            else
            {
                var review = new Review(command.Dto.Rate, command.Dto.Comment, command.Dto.IsAnonymous, command.Dto.UserId, command.Dto.ProductDetailId);
                createdReview = await reviewDbService.CreateAsync(review);
            }

            await notificationService.SendNotificationAsync(Constants.ReviewAdded,
                new ReviewQueryResult
                (
                     createdReview.Id,
                new
                {
                    Id = productDetail.Id,
                    ProductId = productDetail.Product.Id,
                    Name = productDetail.Product.Name,
                    AdditionalData = productDetail.AdditionalData.Select(ad => new AddtionalDataQueryResult(ad.Id, ad.Key, ad.Value)),
                },
               createdReview.Rate,
               createdReview.Comment,
               createdReview.IsAnonymous ? null :
                new
                {
                    Name = user.FullName,
                    Avatar = user.Avatar == null ? null : new AvatarQueryResult(user.Avatar.Id, user.Avatar.Name, user.Avatar.Url, user.Avatar.ThumbUrl),
                },
               createdReview.IsAnonymous,
               createdReview.CreatedAt,
               createdReview.UpdatedAt),
                Constants.AllHubGroup, null, false);
            return ResponseModel.SuccessResponse();
        }
    }
}