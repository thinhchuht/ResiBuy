﻿using ResiBuy.Server.Application.Queries.ReportQueries;

namespace ResiBuy.Server.Infrastructure.DbServices.ReportServices
{
    public class ReportDbService : BaseDbService<Report>, IReportDbService
    {
        private readonly ResiBuyContext _context;
        public ReportDbService(ResiBuyContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PagedResult<Report>> GetAllReports(string userId, bool? isResolved, string keyword, ReportStatus reportStatus, ReportTarget reportTarget, DateTime? startDate = null, DateTime? endDate = null,  int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Reports
                .Include(r => r.CreatedBy)
                .Include(r => r.Order).ThenInclude(o => o.Store)
                .AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                switch (reportStatus)
                {
                    case ReportStatus.None:
                        query = query.Where(r => r.TargetId == userId || r.CreatedById == userId);
                        break;

                    case ReportStatus.Created:
                        query = query.Where(r => r.CreatedById == userId);
                        break;

                    case ReportStatus.Target:
                        query = query.Where(r => r.TargetId == userId);
                        break;
                }
            }

            if (isResolved.HasValue)
            {
                query = query.Where(r => r.IsResolved == isResolved.Value);
            }

            if (reportTarget != ReportTarget.None)
            {
                    query = query.Where(r => r.ReportTarget == reportTarget);
            }

            if (!string.IsNullOrEmpty(keyword))
            {
                var lowerKeyword = keyword.ToLower();
                query = query.Where(r =>
                    (r.CreatedBy != null && r.CreatedBy.FullName.ToLower().Contains(lowerKeyword)) ||
                    (r.Order != null && r.Order.Store != null && r.Order.Store.Name.ToLower().Contains(lowerKeyword))
                );
            }

            if (startDate.HasValue)
            {
                query = query.Where(r => r.CreatedAt >= startDate.Value);
            }
            if (endDate.HasValue)
            {
                var end = endDate.Value.Date.AddDays(1);
                query = query.Where(r => r.CreatedAt < end);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderBy(r => r.IsResolved) 
                .ThenByDescending(r => r.CreatedAt) 
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Report>(items, totalCount, pageNumber, pageSize);
        }

        public async Task<Report> GetByOrderIdAsync(Guid id)
        {
            return await _context.Reports.FirstOrDefaultAsync(r => r.OrderId == id);
        }
    }
}
