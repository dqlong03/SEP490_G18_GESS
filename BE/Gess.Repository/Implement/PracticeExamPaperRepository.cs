using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.PracticeExamPaper;
using GESS.Repository.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace GESS.Repository.Implement
{
    public class PracticeExamPaperRepository : BaseRepository<PracticeExamPaper>, IPracticeExamPaperRepository
    {
        private readonly GessDbContext _context;

        public PracticeExamPaperRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<ExamPaperListDTO>> GetAllExamPaperListAsync(
            string? searchName = null,
            int? subjectId = null,
            int? semesterId = null,
            int? categoryExamId = null,
            int page = 1,
            int pageSize = 5
        )
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 5;

            var query = _context.PracticeExamPapers
                .Include(x => x.CategoryExam)
                .Include(x => x.Subject)
                .Include(x => x.Semester)
                .AsNoTracking() // Tối ưu hóa nếu không cần theo dõi thay đổi
                .AsQueryable();

            // Áp dụng các bộ lọc
            if (!string.IsNullOrWhiteSpace(searchName))
            {
                query = query.Where(x => x.PracExamPaperName.Contains(searchName));
            }
            if (subjectId.HasValue)
            {
                query = query.Where(x => x.SubjectId == subjectId.Value);
            }
            if (semesterId.HasValue)
            {
                query = query.Where(x => x.SemesterId == semesterId.Value);
            }
            if (categoryExamId.HasValue)
            {
                query = query.Where(x => x.CategoryExamId == categoryExamId.Value); // Đảm bảo ánh xạ đúng
            }

            // Đếm tổng số bản ghi trước khi phân trang
            var totalItems = await query.CountAsync();

            // Áp dụng phân trang
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ExamPaperListDTO
                {
                    PracExamPaperId = x.PracExamPaperId,
                    PracExamPaperName = x.PracExamPaperName,
                    NumberQuestion = x.NumberQuestion,
                    CreateAt = x.CreateAt,
                    Status = x.Status,
                    CreateBy = x.CreateBy,
                    CategoryExamName = x.CategoryExam.CategoryExamName,
                    SubjectName = x.Subject.SubjectName,
                    SemesterName = x.Semester.SemesterName
                })
                .ToListAsync();

            return items;
        }

        public async Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int? categoryExamId = null, int pageSize = 5)
        {
            if (pageSize < 1) pageSize = 5;

            var query = _context.PracticeExamPapers
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(x => x.PracExamPaperName.Contains(name));
            }
            if (subjectId.HasValue)
            {
                query = query.Where(x => x.SubjectId == subjectId.Value);
            }
            if (semesterId.HasValue)
            {
                query = query.Where(x => x.SemesterId == semesterId.Value);
            }
            if (categoryExamId.HasValue)
            {
                query = query.Where(x => x.CategoryExamId == categoryExamId.Value);
            }

            var totalItems = await query.CountAsync();
            return (int)Math.Ceiling((double)totalItems / pageSize);
        }

    }
}
