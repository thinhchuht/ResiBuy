﻿namespace ResiBuy.Server.Infrastructure.Model
{
    public class Room
    {
        public Guid                  Id         { get; set; } 
        public string                Name       { get; set; }
        public bool                  IsActive   { get; set; }
        public Guid                  BuildingId { get; set; }
        public Building              Building   { get; set; }
        public IEnumerable<Order> Orders { get; set; }
        public IEnumerable<UserRoom> UserRooms  { get; set; }
        public IEnumerable<Store> Stores { get; set; }

        public Room(string name, Guid buildingId)
        {
            BuildingId = buildingId;
            IsActive   = true;
            Name       = name;
        }
        public Room UpdateRoom(string name, bool isActive)
        {
            Name = name;
            IsActive = isActive;
            return this;
        }

        public Room UpdateStatus()
        {
            IsActive = !IsActive;
            return this;
        }
    }
}
