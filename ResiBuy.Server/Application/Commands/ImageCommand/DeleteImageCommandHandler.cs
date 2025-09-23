namespace ResiBuy.Server.Application.Commands.ImageCommand
{
    public record DeleteImageCommand(string Id) : IRequest;

    public class DeleteImageCommandHandler : IRequestHandler<DeleteImageCommand>
    {
        private readonly ResiBuyContext _context;

        public DeleteImageCommandHandler(ResiBuyContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteImageCommand request, CancellationToken cancellationToken)
        {
            // Kiểm tra đầu vào
            if (string.IsNullOrWhiteSpace(request.Id))
                throw new CustomException(ExceptionErrorCode.ValidationFailed, "Id ảnh không được để trống");

            // Tìm ảnh theo Id
            var image = await _context.Images.FindAsync(request.Id, cancellationToken)
                ?? throw new CustomException(ExceptionErrorCode.NotFound, $"Ảnh với Id {request.Id} không tồn tại");

            // Xóa ảnh
            _context.Images.Remove(image);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}