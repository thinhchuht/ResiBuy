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
            if (await reviewDbService.CheckIfUserReviewed(command.Dto.UserId, command.Dto.ProductDetailId))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Người dùng đã đánh giá sản phẩm này, vui lòng sửa đánh giá cũ.");
            var review = new Review(command.Dto.Rate, command.Dto.Comment, command.Dto.IsAnonymous, command.Dto.UserId, command.Dto.ProductDetailId);
            await reviewDbService.UpdateAsync(review);
            await notificationService.SendNotificationAsync(Constants.ReviewAdded,
                new ReviewQueryResult
                (
                      review.Id,
                new
                {
                    Id = review.ProductDetail.Id,
                    Name = review.ProductDetail.Product.Name,
                    AdditionalData =  review.ProductDetail.AdditionalData.Select(ad => new AddtionalDataQueryResult(ad.Id, ad.Key, ad.Value)),
                },
                review.Rate,
                review.Comment,
                review.IsAnonymous ? null :
                new
                {
                    Name = review.User.FullName,
                    Avatar = new AvatarQueryResult(review.User.Avatar.Id, review.User.Avatar.Name, review.User.Avatar.Url, review.User.Avatar.ThumbUrl),
                },
                review.IsAnonymous,
                review.CreatedAt),
                Constants.AllHubGroup);
            return ResponseModel.SuccessResponse();
        }
    }
}