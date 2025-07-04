﻿using ResiBuy.Server.Infrastructure.DbServices.CategoryDbServices;

namespace ResiBuy.Server.Application.Queries.CategoryQueries
{
    public record GetCategoieByIdQuery(Guid Id) : IRequest<ResponseModel>;

    public class GetCategoieByIdQueryHandler(ICategoryDbService CategoryDbService)
        : IRequestHandler<GetCategoieByIdQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetCategoieByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id == Guid.Empty)
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Không được bỏ trống Id danh mục");

            var category = await CategoryDbService.GetByIdAsync(query.Id);
            if (category == null)
                throw new CustomException(ExceptionErrorCode.NotFound, "Không tìm thấy danh mục");

            return ResponseModel.SuccessResponse(category);
        }
    }
}
