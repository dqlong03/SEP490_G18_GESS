using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GESS.Repository.Implement
{
    public class SubjectRepository : BaseRepository<Subject>, ISubjectRepository
    {
        private readonly GessDbContext _context;
        public SubjectRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> AddSubjectToTrainingProgramAsync(int trainingProgramId, int subjectId)
        {
            var trainingProgram = _context.TrainingPrograms.Find(trainingProgramId);
            if (trainingProgram == null)
            {
                throw new KeyNotFoundException("Không tìm thấy chương trình đào tạo.");
            }
            var subject = _context.Subjects.Find(subjectId);
            if (subject == null)
            {
                throw new KeyNotFoundException("Không tìm thấy môn học.");
            }
            // Kiểm tra xem môn học đã được thêm vào chương trình đào tạo chưa
            var existingEntry = _context.SubjectTrainingPrograms
                .FirstOrDefault(stp => stp.TrainProId == trainingProgramId && stp.SubjectId == subjectId);
            if (existingEntry != null)
            {
                throw new InvalidOperationException("Môn học đã được thêm vào chương trình đào tạo.");
            }
            // Thêm môn học vào chương trình đào tạo
            var subjectTrainingProgram = new SubjectTrainingProgram
            {
                TrainProId = trainingProgramId,
                SubjectId = subjectId
            };
            _context.SubjectTrainingPrograms.Add(subjectTrainingProgram);
            return await _context.SaveChangesAsync().ContinueWith(t => t.Result > 0);
        }

        public async Task<int> CountPageAsync(string? name, int pageSize)
        {
            var query = _context.Subjects.AsQueryable();
            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(m =>
                    m.SubjectName.ToLower().Contains(loweredName) ||
                    m.Description.ToLower().Contains(loweredName));
            }
            // Count total records
            var count = await query.CountAsync();
            if (count <= 0)
            {
                throw new InvalidOperationException("Không có dữ liệu để đếm trang.");
            }
            // Calculate total pages
            int totalPages = (int)Math.Ceiling((double)count / pageSize);
            return totalPages;
        }

        public async Task<Subject> CreateSubjectAsync(SubjectCreateDTO subjectCreateDTO)
        {
            var subject = new Subject
            {
                SubjectName = subjectCreateDTO.SubjectName,
                Description = subjectCreateDTO.Description,
                Course = subjectCreateDTO.Course,
                NoCredits = subjectCreateDTO.NoCredits
            };
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();
            return await Task.FromResult(subject);
        }

        public async Task<IEnumerable<Subject>> GetAllSubjectsAsync(string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            IQueryable<Subject> query = _context.Subjects;

            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(m =>
                    m.SubjectName.ToLower().Contains(loweredName) ||
                    m.Description.ToLower().Contains(loweredName));
            }
            // Apply pagination
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.ToListAsync();

        }

        public async Task<IEnumerable<Subject>> GetAllSubjectsByMajorId(int? majorId)
        {
            if (!majorId.HasValue)
                return new List<Subject>();

            var newestTrainingProgram = await _context.TrainingPrograms
                .Where(tp => tp.MajorId == majorId)
                .OrderByDescending(tp => tp.StartDate)
                .FirstOrDefaultAsync();

            if (newestTrainingProgram == null)
                return new List<Subject>();

            var subjects = await _context.SubjectTrainingPrograms
                .Where(stp => stp.TrainProId == newestTrainingProgram.TrainProId)
                .Select(stp => stp.Subject)
                .Distinct()
                .ToListAsync();

            return subjects;
        }


        public async Task<IEnumerable<Subject>> GetSubjectsInTrainingProgramAsync(int trainingProgramId, string? name = null, int pageNumber = 1, int pageSize = 10)
        {
            var trainingProgram = await _context.TrainingPrograms
                .Include(tp => tp.SubjectTrainingPrograms)
                .ThenInclude(stp => stp.Subject)
                .FirstOrDefaultAsync(tp => tp.TrainProId == trainingProgramId);
            if (trainingProgram == null)
            {
                throw new KeyNotFoundException("Không tìm thấy chương trình đào tạo.");
            }
            var subjects = trainingProgram.SubjectTrainingPrograms.Select(stp => stp.Subject).AsQueryable();
            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                subjects = subjects.Where(s =>
                    s.SubjectName.ToLower().Contains(loweredName) ||
                    s.Description.ToLower().Contains(loweredName));
            }
            // Apply pagination
            subjects = subjects.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            return await Task.FromResult(subjects.ToList());
        }

        public async Task<bool> RemoveSubjectFromTrainingProgramAsync(int trainingProgramId, int subjectId)
        {
            var trainingProgram = _context.TrainingPrograms.Find(trainingProgramId);
            if (trainingProgram == null)
            {
                throw new KeyNotFoundException("Không tìm thấy chương trình đào tạo.");
            }
            var subject = _context.Subjects.Find(subjectId);
            if (subject == null)
            {
                throw new KeyNotFoundException("Không tìm thấy môn học.");
            }
            // Tìm kiếm môn học trong bảng trung gian SubjectTrainingProgram
            var subjectTrainingProgram = _context.SubjectTrainingPrograms
                .FirstOrDefault(stp => stp.TrainProId == trainingProgramId && stp.SubjectId == subjectId);
            if (subjectTrainingProgram == null)
            {
                throw new InvalidOperationException("Môn học không được liên kết với chương trình đào tạo.");
            }
            // Xóa môn học khỏi chương trình đào tạo
            _context.SubjectTrainingPrograms.Remove(subjectTrainingProgram);
            return await _context.SaveChangesAsync().ContinueWith(t => t.Result > 0);
        }

        public async Task<Subject> UpdateSubjectAsync(int subjectId, SubjectDTO subjectUpdateDTO)
        {
            var subject =  _context.Subjects.Find(subjectId);
            if (subject == null)
            {
                throw new KeyNotFoundException("Không tìm thấy môn học.");
            }
            subject.SubjectName = subjectUpdateDTO.SubjectName;
            subject.Description = subjectUpdateDTO.Description;
            subject.Course = subjectUpdateDTO.Course;
            subject.NoCredits = subjectUpdateDTO.NoCredits;
            _context.Subjects.Update(subject);
            await _context.SaveChangesAsync();
            return await Task.FromResult(subject);
        }
        // ThaiNH_add_UpdateMark&UserProfile_Begin
        public async Task<Subject?> GetSubjectBySubIdAsync(int subjectId)
        {
            return await _context.Subjects
                .Where(s => s.SubjectId == subjectId)
                .FirstOrDefaultAsync();
        }
        // ThaiNH_add_UpdateMark&UserProfile_End

    }


}
