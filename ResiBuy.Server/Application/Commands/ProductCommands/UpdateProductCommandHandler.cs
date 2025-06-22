using ResiBuy.Server.Application.Commands.ProductCommands.DTOs.Update;

namespace ResiBuy.Server.Application.Commands.ProductCommands
{
    public record UpdateProductCommand(UpdateProductDto ProductDto) : IRequest<ResponseModel>;

    public class UpdateProductCommandHandler(IProductDbService productDbService, IImageDbService imageDbService) : IRequestHandler<UpdateProductCommand, ResponseModel>
    {

        public async Task<ResponseModel> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var dto = command.ProductDto;
                var product = await productDbService.GetByIdAsync(dto.Id);

                if (product == null)
                    return ResponseModel.FailureResponse($"Product {dto.Id} không tồn tại");

                product.UpdateProduct(dto.Name, dto.Describe, dto.Discount, dto.CategoryId, dto.IsOutOfStock);

                var existingDetails = product.ProductDetails.ToDictionary(d => d.Id);
                var allDataSets = new List<HashSet<string>>();

                foreach (var detailDto in dto.ProductDetails)
                {
                    var currentSet = new HashSet<string>();

                    if (detailDto.AdditionalData != null && detailDto.AdditionalData.Any())
                    {

                        var duplicates = detailDto.AdditionalData
                            .GroupBy(a => new { a.Key, a.Value })
                            .Where(g => g.Count() > 1)
                            .Select(g => $"({g.Key.Key}, {g.Key.Value})")
                            .ToList();

                        if (duplicates.Any())
                        {
                            var msg = string.Join(", ", duplicates);
                            return ResponseModel.FailureResponse($"Dữ liệu AdditionalData bị trùng trong một sản phẩm chi tiết: {msg}");
                        }


                        currentSet = detailDto.AdditionalData
                            .Select(a => $"{a.Key}|{a.Value}")
                            .ToHashSet();

                        if (allDataSets.Any(set => set.SetEquals(currentSet)))
                        {
                            var msg = string.Join(", ", currentSet);
                            return ResponseModel.FailureResponse($"Dữ liệu AdditionalData bị trùng hoàn toàn giữa các sản phẩm chi tiết: {msg}");
                        }

                        allDataSets.Add(currentSet);
                    }

                    ProductDetail detail;

                    if (detailDto.Id == 0 || !existingDetails.ContainsKey(detailDto.Id))
                    {
                        detail = new ProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock);
                        detail.AdditionalData = detailDto.AdditionalData?
                            .Select(a => new AdditionalData(a.Key, a.Value))
                            .ToList();
                        product.ProductDetails.Add(detail);
                        continue;
                    }

                    detail = existingDetails[detailDto.Id];
                    detail.UpdateProductDetail(detailDto.Price, detailDto.Weight, detailDto.IsOutOfStock);

                    if (detailDto.AdditionalData != null)
                    {
                        var existingAdds = detail.AdditionalData.ToDictionary(a => a.Id);

                        foreach (var addDto in detailDto.AdditionalData)
                        {
                            if (addDto.Id == 0 || !existingAdds.ContainsKey(addDto.Id))
                            {
                                detail.AdditionalData.Add(new AdditionalData(addDto.Key, addDto.Value));
                            }
                            else
                            {
                                var add = existingAdds[addDto.Id];
                                add.Key = addDto.Key;
                                add.Value = addDto.Value;
                            }
                        }

                        var dtoAddIds = detailDto.AdditionalData.Select(a => a.Id).ToHashSet();
                        detail.AdditionalData.RemoveAll(a => a.Id != 0 && !dtoAddIds.Contains(a.Id));
                    }

                    if (string.IsNullOrEmpty(detailDto.Image?.Id))
                    {

                        if (detail.Image != null)
                        {
                            await imageDbService.DeleteAsync(detail.Image);
                            detail.Image = null;
                        }
                    }
                    else
                    {

                        if (detail.Image == null || detail.Image.Id != detailDto.Image.Id)
                        {
                            if (detail.Image != null)
                            {
                                await imageDbService.DeleteAsync(detail.Image);
                            }

                            var newImage = new Image();
                            newImage.CreateImage(
                                detailDto.Image.Id,
                                detailDto.Image.Url,
                                detailDto.Image.ThumbUrl,
                                detailDto.Image.Name
                            );
                            detail.Image = newImage;
                        }
                        else
                        {
                            detail.Image.UpdateImage(detailDto.Image.Url, detailDto.Image.ThumbUrl, detailDto.Image.Name);
                        }
                    }
                }

                var dtoDetailIds = dto.ProductDetails.Select(d => d.Id).ToHashSet();
                var toRemoveDetails = product.ProductDetails
                    .Where(d => !dtoDetailIds.Contains(d.Id))
                    .ToList();

                foreach (var removeDetail in toRemoveDetails)
                {
                    if (removeDetail.OrderItems == null || !removeDetail.OrderItems.Any())
                        product.ProductDetails.Remove(removeDetail);
                }

                var result = await productDbService.UpdateAsync(product);
                return ResponseModel.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionErrorCode.RepositoryError, ex.Message);
            }

        }
    }

}
