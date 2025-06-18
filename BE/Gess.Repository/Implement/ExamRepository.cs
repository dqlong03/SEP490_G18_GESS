using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Exam;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ExamRepository : IExamRepository
    {
        private readonly GessDbContext _context;
        public ExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
            int? subjectId,
           // string? gradeComponent,
            string? examType,
            string? searchName)
        {
            var multipleExamsQuery = _context.MultiExams
                .Where(e => e.TeacherId == teacherId)
                .Where(e => !majorId.HasValue || e.Teacher.MajorId == majorId)
                .Where(e => !semesterId.HasValue || e.SemesterId == semesterId)
                .Where(e => !subjectId.HasValue || e.SubjectId == subjectId)
               // .Where(e => string.IsNullOrEmpty(gradeComponent) || e.GradeComponent == gradeComponent)
                .Where(e => string.IsNullOrEmpty(searchName) || e.MultiExamName.Contains(searchName))
                .Select(e => new ExamListResponse
                {
                    ExamId = e.MultiExamId,
                    SemesterName = e.Semester.SemesterName,
                    ExamName = e.MultiExamName,
                    ExamType = e.CategoryExam.CategoryExamName,
                    //StatusExam = e.MultiExamHistories.Any(),
                    StatusExam = e.Status,
                    CreateDate = e.CreateAt
                });

            var practiceExamsQuery = _context.PracticeExams
                .Where(e => e.TeacherId == teacherId)
                .Where(e => !majorId.HasValue || e.Teacher.MajorId == majorId)
                .Where(e => !semesterId.HasValue || e.SemesterId == semesterId)
                .Where(e => !subjectId.HasValue || e.SubjectId == subjectId)
                .Where(e => string.IsNullOrEmpty(searchName) || e.PracExamName.Contains(searchName))
                .Select(e => new ExamListResponse
                {
                    ExamId = e.PracExamId,
                    SemesterName = e.Semester.SemesterName,
                    ExamName = e.PracExamName,
                    ExamType = e.CategoryExam.CategoryExamName,
                    //StatusExam = e.PracticeExamHistories.Any(),
                    StatusExam = e.Status,
                    CreateDate = e.CreateAt
                });

            var allExamsQuery = multipleExamsQuery.Concat(practiceExamsQuery);

            if (!string.IsNullOrEmpty(examType))
            {
                allExamsQuery = allExamsQuery.Where(e => e.ExamType == examType);
            }

            var totalCount = await allExamsQuery.CountAsync();
            var data = await allExamsQuery
                .OrderByDescending(e => e.CreateDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        public async Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO dto)
        {
            var exam = await _context.PracticeExams.FirstOrDefaultAsync(e => e.PracExamId == dto.PracExamId);
            if (exam == null || exam.Status.ToLower() != "chưa thi") // chỉ cho sửa khi chưa thi
                return false;

            exam.PracExamName = dto.PracExamName;
            exam.Duration = dto.Duration;
            exam.CreateAt = dto.CreateAt;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.SemesterId = dto.SemesterId;
            // Cập nhật các trường khác nếu cần

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMultiExamAsync(MultiExamUpdateDTO dto)
        {
            var exam = await _context.MultiExams.FirstOrDefaultAsync(e => e.MultiExamId == dto.MultiExamId);
            if (exam == null || exam.Status.ToLower() != "chưa thi") // chỉ cho sửa khi chưa thi
                return false;

            exam.MultiExamName = dto.MultiExamName;
            exam.NumberQuestion = dto.NumberQuestion;
            exam.Duration = dto.Duration;
            exam.CreateAt = dto.CreateAt;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.SemesterId = dto.SemesterId;
            // Cập nhật các trường khác nếu cần

            await _context.SaveChangesAsync();
            return true;
        }


    }
}
