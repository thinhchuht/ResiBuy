﻿namespace ResiBuy.Server.Application.Queries.AreaQueries
{
    public record GetAllAreasQuery() : IRequest<ResponseModel>;
    public class GetAllAreasQueryHandler(IAreaDbService AreaDbService) : IRequestHandler<GetAllAreasQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllAreasQuery query, CancellationToken cancellationToken)
        {
            var areas = await AreaDbService.GetAllAreaAsync();
            return ResponseModel.SuccessResponse(areas);
        }
    }
}
