namespace ResiBuy.Server.Application.Commands.ImageCommand
{
    public record CreateImageCommand(
       string Url,
       string ThumbUrl,
       string Name
   ) : IRequest<Image>;

    public class CreateImageCommandHandler : IRequestHandler<CreateImageCommand, Image>
    {
        private readonly ResiBuyContext _context;

        public CreateImageCommandHandler(ResiBuyContext context)
        {
            _context = context;
        }

        public async Task<Image> Handle(CreateImageCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra đầu vào
            if (string.IsNullOrWhiteSpace(request.Url))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Url ảnh không được để trống");
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Tên ảnh không được để trống");

            // Tạo Image mới với Id tự sinh
            var image = new Image();
            image.CreateImage(
                id: Guid.NewGuid().ToString(), // Tự động sinh Id
                url: request.Url,
                thumbUrl: request.ThumbUrl ?? string.Empty, // Nếu ThumbUrl null, gán chuỗi rỗng
                name: request.Name
            );

            // Thêm vào database
            _context.Images.Add(image);
            await _context.SaveChangesAsync(cancellationToken);

            return image;
        }
    }
}