global using MediatR;
global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.SignalR;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;
global using Microsoft.IdentityModel.Tokens;
global using Microsoft.OpenApi.Models;
global using ResiBuy.Server.Application.Commands.AreaCommands;
global using ResiBuy.Server.Application.Commands.BuildingCommands;
global using ResiBuy.Server.Application.Commands.RoomCommands;
global using ResiBuy.Server.Application.Commands.UserCommands;
global using ResiBuy.Server.Application.Queries.AreaQueries;
global using ResiBuy.Server.Application.Queries.BuildingQueries;
global using ResiBuy.Server.Application.Queries.RoomQueries;
global using ResiBuy.Server.Application.Queries.UserQueries;
global using ResiBuy.Server.Common;
global using ResiBuy.Server.Configuration;
global using ResiBuy.Server.Extensions;
global using ResiBuy.Server.Hubs;
global using ResiBuy.Server.Infrastructure;
global using ResiBuy.Server.Infrastructure.DbServices.AreaDbServices;
global using ResiBuy.Server.Infrastructure.DbServices.BaseDbServices;
global using ResiBuy.Server.Infrastructure.DbServices.BuildingDbServices;
global using ResiBuy.Server.Infrastructure.DbServices.RoomDbServices;
global using ResiBuy.Server.Infrastructure.DbServices.UserDbServices;
global using ResiBuy.Server.Infrastructure.DbServices.UserRoomDbServices;
global using ResiBuy.Server.Infrastructure.Model;
global using ResiBuy.Server.Infrastructure.Model.Dtos;
global using ResiBuy.Server.Services.HubServices;
global using System.IdentityModel.Tokens.Jwt;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;
global using System.Text.Json.Serialization;
global using static ResiBuy.Server.Application.Queries.QueryResults;

































