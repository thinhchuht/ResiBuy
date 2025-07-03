using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Init1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stores_Rooms_RoomId",
                table: "Stores");

            migrationBuilder.DropForeignKey(
                name: "FK_Stores_Rooms_RoomId1",
                table: "Stores");

            migrationBuilder.DropIndex(
                name: "IX_Stores_RoomId1",
                table: "Stores");

            migrationBuilder.DropColumn(
                name: "RoomId1",
                table: "Stores");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 2, 22, 41, 44, 884, DateTimeKind.Local).AddTicks(2404), "$2a$11$yiXSVhNIRQWM5CPNvXPgHuy41Y7iC9LaptFf4FHhUP1k4z83arpkG", new DateTime(2025, 7, 2, 22, 41, 44, 884, DateTimeKind.Local).AddTicks(2461) });

            migrationBuilder.AddForeignKey(
                name: "FK_Stores_Rooms_RoomId",
                table: "Stores",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stores_Rooms_RoomId",
                table: "Stores");

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId1",
                table: "Stores",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: "adm_df",
                columns: new[] { "CreatedAt", "PasswordHash", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 7, 2, 22, 35, 53, 298, DateTimeKind.Local).AddTicks(5406), "$2a$11$MoRxgspjGegFEZin/iKg2u602uivuNFpwanQIYGKvb0Q.y7pZ2hhO", new DateTime(2025, 7, 2, 22, 35, 53, 298, DateTimeKind.Local).AddTicks(5428) });

            migrationBuilder.CreateIndex(
                name: "IX_Stores_RoomId1",
                table: "Stores",
                column: "RoomId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Stores_Rooms_RoomId",
                table: "Stores",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Stores_Rooms_RoomId1",
                table: "Stores",
                column: "RoomId1",
                principalTable: "Rooms",
                principalColumn: "Id");
        }
    }
}
