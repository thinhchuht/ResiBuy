﻿namespace ResiBuy.Server.Application.Queries.BuildingQueries
{
    public record GetAllBuildingsQuery() : IRequest<ResponseModel>;
    public class GetAllBuildingsQueryHandler(IBuildingDbService BuildingDbService) : IRequestHandler<GetAllBuildingsQuery, ResponseModel>
    {
        public async Task<ResponseModel> Handle(GetAllBuildingsQuery query, CancellationToken cancellationToken)
        {
            var buildings = await BuildingDbService.GetAllAsync();
            return ResponseModel.SuccessResponse(buildings);
        }
    }
}
