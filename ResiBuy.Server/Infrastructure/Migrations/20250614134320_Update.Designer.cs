﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ResiBuy.Server.Infrastructure;

#nullable disable

namespace ResiBuy.Server.Infrastructure.Migrations
{
    [DbContext(typeof(ResiBuyContext))]
    [Migration("20250614134320_Update")]
    partial class Update
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.16")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Area", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Areas");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Building", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("AreaId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("AreaId");

                    b.ToTable("Buildings");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Cart", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId")
                        .IsUnique()
                        .HasFilter("[UserId] IS NOT NULL");

                    b.ToTable("Carts");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.CartItem", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("CartId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("ProductId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CartId");

                    b.HasIndex("ProductId");

                    b.ToTable("CartItems");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Category", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Status")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.CostData", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Key")
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)");

                    b.Property<Guid>("ProductId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("ProductId");

                    b.ToTable("CostData");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Order", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreateAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("PaymentStatus")
                        .HasColumnType("int");

                    b.Property<Guid?>("ShipperId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<Guid>("StoreId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<decimal>("TotalPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTime>("UpdateAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<Guid?>("VoucherId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("ShipperId");

                    b.HasIndex("StoreId");

                    b.HasIndex("UserId");

                    b.HasIndex("VoucherId");

                    b.ToTable("Orders");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.OrderItem", b =>
                {
                    b.Property<Guid>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("OrderId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)");

                    b.Property<Guid>("ProductId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.HasIndex("OrderId");

                    b.HasIndex("ProductId");

                    b.ToTable("OrderItems");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Product", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("CategoryId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Describe")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Discount")
                        .HasColumnType("int");

                    b.Property<bool>("IsOutOfStock")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("StoreId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime2");

                    b.Property<float>("Weight")
                        .HasColumnType("real");

                    b.HasKey("Id");

                    b.HasIndex("CategoryId");

                    b.HasIndex("StoreId");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.ProductImage", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ImgUrl")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("ProductId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("ThumbUrl")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("ProductId");

                    b.ToTable("ProductImgs");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.RefreshToken", b =>
                {
                    b.Property<string>("Token")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("ExpiryDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsRevoked")
                        .HasColumnType("bit");

                    b.Property<string>("ReasonRevoked")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ReplacedByToken")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("RevokedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Token");

                    b.HasIndex("UserId");

                    b.ToTable("RefreshTokens");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Report", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("CreatedById")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("OrderId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Title")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("CreatedById");

                    b.HasIndex("OrderId");

                    b.ToTable("Reports");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Room", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("BuildingId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("BuildingId");

                    b.ToTable("Rooms");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Shipper", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("EndWorkTime")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsOnline")
                        .HasColumnType("bit");

                    b.Property<Guid>("LastLocationId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("ReportCount")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartWorkTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("LastLocationId");

                    b.HasIndex("UserId")
                        .IsUnique()
                        .HasFilter("[UserId] IS NOT NULL");

                    b.ToTable("Shippers");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Store", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsLocked")
                        .HasColumnType("bit");

                    b.Property<bool>("IsOpen")
                        .HasColumnType("bit");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("OwnerId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("ReportCount")
                        .HasColumnType("int");

                    b.Property<Guid>("RoomId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("OwnerId");

                    b.HasIndex("RoomId");

                    b.ToTable("Stores");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.UncostData", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("CostDataId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Key")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("CostDataId");

                    b.ToTable("UncostData");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.User", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("DateOfBirth")
                        .HasColumnType("datetime2");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("FullName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("IdentityNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsLocked")
                        .HasColumnType("bit");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("Roles")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.ToTable("Users");

                    b.HasData(
                        new
                        {
                            Id = "adm_df",
                            CreatedAt = new DateTime(2025, 6, 14, 20, 43, 20, 163, DateTimeKind.Local).AddTicks(8180),
                            DateOfBirth = new DateTime(1990, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Email = "admin@123",
                            EmailConfirmed = true,
                            FullName = "Administrator",
                            IdentityNumber = "admin",
                            IsLocked = false,
                            PasswordHash = "$2a$11$JE2ws0YkLNdm5MyCugBVCOwdHoDJPIBhORwBG2Tnp/LGBP2NCZave",
                            PhoneNumber = "admin",
                            PhoneNumberConfirmed = true,
                            Roles = "[\"ADMIN\"]",
                            UpdatedAt = new DateTime(2025, 6, 14, 20, 43, 20, 163, DateTimeKind.Local).AddTicks(8192)
                        });
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.UserRoom", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<Guid>("RoomId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("UserId", "RoomId");

                    b.HasIndex("RoomId");

                    b.ToTable("UserRooms");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.UserVoucher", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<Guid>("VoucherId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("UserId", "VoucherId");

                    b.HasIndex("VoucherId");

                    b.ToTable("UserVouchers");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Voucher", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<decimal>("DiscountAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("datetime2");

                    b.Property<bool>("IsActive")
                        .HasColumnType("bit");

                    b.Property<decimal>("MaxDiscountPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("MinOrderPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime2");

                    b.Property<Guid>("StoreId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("Type")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("StoreId");

                    b.ToTable("Vouchers");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Building", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Area", "Area")
                        .WithMany("Buildings")
                        .HasForeignKey("AreaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Area");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Cart", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "User")
                        .WithOne("Cart")
                        .HasForeignKey("ResiBuy.Server.Infrastructure.Model.Cart", "UserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.Navigation("User");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.CartItem", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Cart", "Cart")
                        .WithMany("CartItems")
                        .HasForeignKey("CartId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Product", "Product")
                        .WithMany("CartItems")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Cart");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.CostData", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Product", "Product")
                        .WithMany("CostData")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Product");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Order", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Shipper", "Shipper")
                        .WithMany("Orders")
                        .HasForeignKey("ShipperId")
                        .OnDelete(DeleteBehavior.NoAction);

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Store", "Store")
                        .WithMany("Orders")
                        .HasForeignKey("StoreId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Voucher", "Voucher")
                        .WithMany("Orders")
                        .HasForeignKey("VoucherId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("Shipper");

                    b.Navigation("Store");

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.OrderItem", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Order", "Order")
                        .WithMany("Items")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Product", "Product")
                        .WithMany("OrderItems")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Order");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Product", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Category", "Category")
                        .WithMany("Products")
                        .HasForeignKey("CategoryId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Store", "Store")
                        .WithMany("Products")
                        .HasForeignKey("StoreId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Category");

                    b.Navigation("Store");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.ProductImage", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Product", "Product")
                        .WithMany("ProductImgs")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Product");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.RefreshToken", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Report", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "CreatedBy")
                        .WithMany("Reports")
                        .HasForeignKey("CreatedById")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Order", "Order")
                        .WithMany("Reports")
                        .HasForeignKey("OrderId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("CreatedBy");

                    b.Navigation("Order");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Room", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Building", "Building")
                        .WithMany("Rooms")
                        .HasForeignKey("BuildingId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Building");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Shipper", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Area", "LastLocation")
                        .WithMany("Shippers")
                        .HasForeignKey("LastLocationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "User")
                        .WithOne()
                        .HasForeignKey("ResiBuy.Server.Infrastructure.Model.Shipper", "UserId")
                        .OnDelete(DeleteBehavior.NoAction);

                    b.Navigation("LastLocation");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Store", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Room", "Room")
                        .WithMany()
                        .HasForeignKey("RoomId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Owner");

                    b.Navigation("Room");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.UncostData", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.CostData", "CostData")
                        .WithMany("UncostData")
                        .HasForeignKey("CostDataId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("CostData");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.UserRoom", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Room", "Room")
                        .WithMany("UserRooms")
                        .HasForeignKey("RoomId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "User")
                        .WithMany("UserRooms")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Room");

                    b.Navigation("User");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.UserVoucher", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.User", "User")
                        .WithMany("UserVouchers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Voucher", "Voucher")
                        .WithMany("UserVouchers")
                        .HasForeignKey("VoucherId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Voucher", b =>
                {
                    b.HasOne("ResiBuy.Server.Infrastructure.Model.Store", "Store")
                        .WithMany("Vouchers")
                        .HasForeignKey("StoreId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Store");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Area", b =>
                {
                    b.Navigation("Buildings");

                    b.Navigation("Shippers");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Building", b =>
                {
                    b.Navigation("Rooms");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Cart", b =>
                {
                    b.Navigation("CartItems");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Category", b =>
                {
                    b.Navigation("Products");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.CostData", b =>
                {
                    b.Navigation("UncostData");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Order", b =>
                {
                    b.Navigation("Items");

                    b.Navigation("Reports");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Product", b =>
                {
                    b.Navigation("CartItems");

                    b.Navigation("CostData");

                    b.Navigation("OrderItems");

                    b.Navigation("ProductImgs");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Room", b =>
                {
                    b.Navigation("UserRooms");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Shipper", b =>
                {
                    b.Navigation("Orders");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Store", b =>
                {
                    b.Navigation("Orders");

                    b.Navigation("Products");

                    b.Navigation("Vouchers");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.User", b =>
                {
                    b.Navigation("Cart");

                    b.Navigation("Reports");

                    b.Navigation("UserRooms");

                    b.Navigation("UserVouchers");
                });

            modelBuilder.Entity("ResiBuy.Server.Infrastructure.Model.Voucher", b =>
                {
                    b.Navigation("Orders");

                    b.Navigation("UserVouchers");
                });
#pragma warning restore 612, 618
        }
    }
}
