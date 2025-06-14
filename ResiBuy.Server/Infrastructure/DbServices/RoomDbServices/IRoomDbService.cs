﻿using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;

namespace ResiBuy.Server.Infrastructure.DbServices.RoomDbServices
{
    public interface IRoomDbService: IBaseDbService<Room>
    {
        Task<IEnumerable<Room>> GetAllRoomsAsync();
        Task<IEnumerable<Room>> GetBatchAsync(IEnumerable<Guid> Ids);
        Task<Room> CreateAsync(Guid buildingId, string name);
        Task<Room> GetByRoomNameAndBuildingIdAsync(Guid buildingId, string name);
    }
}