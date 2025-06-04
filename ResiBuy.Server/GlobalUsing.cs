global using MediatR;
global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Metadata.Builders;
global using Microsoft.IdentityModel.Tokens;
global using ResiBuy.Server.Application.Commands.UserCommands;
global using ResiBuy.Server.Application.Queries.UserQueries;
global using ResiBuy.Server.Common;
global using ResiBuy.Server.Configuration;
global using ResiBuy.Server.Extensions;
global using ResiBuy.Server.Infrastructure;
global using ResiBuy.Server.Infrastructure.Model;
global using ResiBuy.Server.Infrastructure.Model.DTOs;
global using ResiBuy.Server.Infrastructure.Services.BaseDbServices;
global using ResiBuy.Server.Infrastructure.Services.UserRoomServices;
global using ResiBuy.Server.Infrastructure.Services.UserServices;
global using System.IdentityModel.Tokens.Jwt;
global using System.Security.Claims;
global using System.Security.Cryptography;
global using System.Text;
global using System.Text.Json.Serialization;
















