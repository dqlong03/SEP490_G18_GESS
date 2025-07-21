using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Exam;
using GESS.Model.Examination;
using GESS.Model.Student;
using GESS.Model.Subject;
using GESS.Repository.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class StudentRepository : BaseRepository<Student>, IStudentRepository
    {
        private readonly GessDbContext _context;
        private readonly UserManager<User> _userManager;
        public StudentRepository(GessDbContext context, UserManager<User> userManager)
    : base(context)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<StudentResponse> AddStudentAsync(Guid id, StudentCreationRequest request)
        {
            var student = new Student
            {
                UserId = id,
                EnrollDate = request.EnrollDate,
                AvatarURL = request.AvatarUrl,
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Lấy lại entity vừa thêm
            var entity = await _context.Students
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.StudentId == student.StudentId);

            return new StudentResponse
            {
                StudentId = entity.StudentId,
                UserName = student.User.UserName,
                Email = student.User.Email,
                AvatarUrl = student.AvatarURL,
                PhoneNumber = student.User.PhoneNumber,
                DateOfBirth = student.User.DateOfBirth,
                Fullname = student.User.Fullname,
                Gender = student.User.Gender,
                Code = student.User.Code,
                IsActive = student.User.IsActive,
                EnrollDate = student.EnrollDate,
            };
        }

        public Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var query = _context.ExamServices.AsQueryable();
            if (active.HasValue)
            {
                query = query.Where(e => e.User.IsActive == active.Value);
            }
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.User.Fullname.ToLower().Contains(name.ToLower()));
            }
            if (fromDate.HasValue)
            {
                query = query.Where(e => e.HireDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(e => e.HireDate <= toDate.Value);
            }
            var count = query.Count();
            if (count <= 0)
            {
                throw new InvalidOperationException("Không có dữ liệu để đếm trang.");
            }
            // Calculate total pages
            int totalPages = (int)Math.Ceiling((double)count / pageSize);
            return Task.FromResult(totalPages);
        }

        public async Task<List<StudentResponse>> GetAllStudentsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            var query = _context.Students
               .Include(t => t.User)
               .AsQueryable();

            // Filter by active status if provided
            if (active.HasValue)
            {
                query = query.Where(e => e.User.IsActive == active.Value);
            }

            // Filter by name if provided
            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.User.Fullname.ToLower().Contains(name.ToLower()));
            }

            // Filter by date range if provided
            if (fromDate.HasValue)
            {
                query = query.Where(e => e.EnrollDate >= fromDate.Value);
            }
            if (toDate.HasValue)
            {
                query = query.Where(e => e.EnrollDate <= toDate.Value);
            }

            // Pagination
            query = query.Skip((pageNumber - 1) * pageSize).Take(pageSize);

            return await query.Select(student => new StudentResponse
            {
                StudentId = student.StudentId,
                UserName = student.User.UserName,
                Email = student.User.Email,
                PhoneNumber = student.User.PhoneNumber,
                DateOfBirth = student.User.DateOfBirth,
                Fullname = student.User.Fullname,
                Gender = student.User.Gender,
                AvatarUrl = student.AvatarURL,
                IsActive = student.User.IsActive,
                Code = student.User.Code,
                EnrollDate = student.EnrollDate,
            }).ToListAsync();
        }

        public async Task<StudentResponse> GetStudentByIdAsync(Guid studentId)
        {
            var student = await _context.Students
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.StudentId == studentId);

            if (student == null) return null;

            return new StudentResponse
            {
                StudentId = student.StudentId,
                UserName = student.User.UserName,
                Email = student.User.Email,
                PhoneNumber = student.User.PhoneNumber,
                DateOfBirth = student.User.DateOfBirth,
                Gender = student.User.Gender,
                AvatarUrl = student.AvatarURL,
                IsActive = student.User.IsActive,
                EnrollDate = student.EnrollDate,
                Code = student.User.Code
            };
        }

        public async Task<List<StudentResponse>> SearchStudentsAsync(string keyword)
        {
            keyword = keyword?.ToLower() ?? "";
            var students = await _context.Students
                .Include(t => t.User)
                .Where(t =>
                    t.User.UserName.ToLower().Contains(keyword) ||
                    t.User.Email.ToLower().Contains(keyword) ||
                    t.User.Fullname.ToLower().Contains(keyword) ||
                    t.User.PhoneNumber.ToLower().Contains(keyword) ||
                    t.User.Code.ToLower().Contains(keyword)
                )
                .ToListAsync();

            return students.Select(examination => new StudentResponse
            {
                StudentId = examination.StudentId,
                UserName = examination.User.UserName,
                Email = examination.User.Email,
                PhoneNumber = examination.User.PhoneNumber,
                DateOfBirth = examination.User.DateOfBirth,
                Fullname = examination.User.Fullname,
                AvatarUrl = examination.AvatarURL,
                Gender = examination.User.Gender,
                IsActive = examination.User.IsActive,
                EnrollDate = examination.EnrollDate,
                Code = examination.User.Code
            }).ToList();
        }

        public async Task<StudentResponse> UpdateStudentAsync(Guid studentId, StudentUpdateRequest request)
        {
            var existing = await _context.Students
               .Include(t => t.User)
               .FirstOrDefaultAsync(t => t.StudentId == studentId);

            if (existing == null)
            {
                throw new Exception("Student not found");
            }

            if (existing.User == null)
            {
                throw new Exception("Associated User not found for the Student");
            }

            // Cập nhật thông tin User qua UserManager
            existing.User.UserName = request.UserName;
            existing.User.Email = request.Email;
            existing.User.PhoneNumber = request.PhoneNumber;
            existing.User.DateOfBirth = request.DateOfBirth ?? existing.User.DateOfBirth;
            existing.User.Fullname = request.Fullname;
            existing.User.Gender = request.Gender;
            existing.User.IsActive = request.IsActive;
            existing.User.Code = request.Code;
            existing.AvatarURL = request.AvatarUrl ?? existing.AvatarURL;

            var updateResult = await _userManager.UpdateAsync(existing.User);
            if (!updateResult.Succeeded)
            {
                throw new Exception(string.Join("; ", updateResult.Errors.Select(e => e.Description)));
            }

            await _context.SaveChangesAsync();

            return new StudentResponse
            {
                StudentId = existing.StudentId,
                UserName = existing.User.UserName,
                Email = existing.User.Email,
                PhoneNumber = existing.User.PhoneNumber,
                DateOfBirth = existing.User.DateOfBirth,
                Fullname = existing.User.Fullname,
                AvatarUrl = existing.AvatarURL,
                Gender = existing.User.Gender,
                IsActive = existing.User.IsActive,
                Code = existing.User.Code,
                EnrollDate = existing.EnrollDate,
            };
        }

        public Task<Student> GetStudentbyUserId(Guid userId)
        {
            var student = _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
            if (student == null)
            {
                throw new InvalidOperationException($"Student with UserId {userId} not found.");
            }
            return student;
        }

        public async Task AddStudent(Guid id, Student student)
        {
            var newStudent = new Student
            {
                StudentId = id,
                UserId = student.UserId,
                CohortId = student.CohortId,
                AvatarURL = student.AvatarURL,
                EnrollDate = student.EnrollDate
            };

            await _context.Students.AddAsync(newStudent);
            await _context.SaveChangesAsync();
        }


        public async Task<List<int>> GetAllYearOfStudentAsync(Guid studentId)
        {
            var multiExamYears = await _context.MultiExamHistories
                 .Where(meh => meh.Student.UserId == studentId)
                 .Select(meh => meh.MultiExam.CreateAt.Year)
                 .ToListAsync();

            var practiceExamYears = await _context.PracticeExamHistories
                .Where(peh => peh.Student.UserId == studentId)
                .Select(peh => peh.PracticeExam.CreateAt.Year)
                .ToListAsync();


            return multiExamYears.Concat(practiceExamYears)
                .Distinct()
                .OrderBy(y => y)
                .ToList();
        }
        //Thêm kỳ với năm 
        public async Task<List<HistoryExamOfStudentDTOResponse>> GetHistoryExamOfStudentBySubIdAsync(int? semesterId, int? year, int subjectId, Guid studentId)
        {
            // Nếu không có semesterId hoặc year, lấy năm và học kỳ mới nhất
            if (!semesterId.HasValue && !year.HasValue)
            {
                // Tìm năm mới nhất từ MultiExam và PracticeExam
                var latestMultiExamYear = await _context.MultiExamHistories
                    .Where(meh => meh.Student.UserId == studentId
                        && meh.MultiExam.SubjectId == subjectId
                        && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM)
                    .Select(meh => meh.MultiExam.CreateAt.Year)
                    .OrderByDescending(y => y)
                    .FirstOrDefaultAsync();

                var latestPracticeExamYear = await _context.PracticeExamHistories
                    .Where(peh => peh.Student.UserId == studentId
                        && peh.PracticeExam.SubjectId == subjectId
                        && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM)
                    .Select(peh => peh.PracticeExam.CreateAt.Year)
                    .OrderByDescending(y => y)
                    .FirstOrDefaultAsync();

                year = Math.Max(latestMultiExamYear, latestPracticeExamYear);
                if (year == 0 || year > DateTime.Now.Year) // Không có bài thi hoặc năm vượt quá 2025
                    return new List<HistoryExamOfStudentDTOResponse>();

                // Tìm học kỳ mới nhất trong năm mới nhất
                var latestMultiExamSemester = await _context.MultiExamHistories
                    .Where(meh => meh.Student.UserId == studentId
                        && meh.MultiExam.SubjectId == subjectId
                        && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && meh.MultiExam.CreateAt.Year == year)
                    .Select(meh => new { meh.MultiExam.SemesterId, meh.MultiExam.CreateAt })
                    .OrderByDescending(x => x.CreateAt)
                    .FirstOrDefaultAsync();

                var latestPracticeExamSemester = await _context.PracticeExamHistories
                    .Where(peh => peh.Student.UserId == studentId
                        && peh.PracticeExam.SubjectId == subjectId
                        && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && peh.PracticeExam.CreateAt.Year == year)
                    .Select(peh => new { peh.PracticeExam.SemesterId, peh.PracticeExam.CreateAt })
                    .OrderByDescending(x => x.CreateAt)
                    .FirstOrDefaultAsync();

                semesterId = latestMultiExamSemester != null && latestPracticeExamSemester != null
                    ? (latestMultiExamSemester.CreateAt > latestPracticeExamSemester.CreateAt
                        ? latestMultiExamSemester.SemesterId
                        : latestPracticeExamSemester.SemesterId)
                    : latestMultiExamSemester?.SemesterId ?? latestPracticeExamSemester?.SemesterId;

                if (!semesterId.HasValue) // Không có bài thi trong năm mới nhất
                    return new List<HistoryExamOfStudentDTOResponse>();
            }

            var multiExams = await _context.MultiExamHistories
                .Where(meh => meh.Student.UserId == studentId
                    && meh.MultiExam.SubjectId == subjectId
                    && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                    && (!semesterId.HasValue || meh.MultiExam.SemesterId == semesterId)
                    && (!year.HasValue || meh.MultiExam.CreateAt.Year == year))
                .Select(meh => new HistoryExamOfStudentDTOResponse
                {
                    ExamName = meh.MultiExam.MultiExamName,
                    ExamType = "Multi",
                    CategoryExamName = meh.MultiExam.CategoryExam.CategoryExamName,
                    Duration = meh.MultiExam.Duration,
                    SubmittedDateTime = meh.EndTime,
                    Score = meh.Score ?? 0
                })
                .ToListAsync();

            var practiceExams = await _context.PracticeExamHistories
                .Where(peh => peh.Student.UserId == studentId
                    && peh.PracticeExam.SubjectId == subjectId
                    && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                    && (!semesterId.HasValue || peh.PracticeExam.SemesterId == semesterId)
                    && (!year.HasValue || peh.PracticeExam.CreateAt.Year == year))
                .Select(peh => new HistoryExamOfStudentDTOResponse
                {
                    ExamName = peh.PracticeExam.PracExamName,
                    ExamType = "Practice",
                    CategoryExamName = peh.PracticeExam.CategoryExam.CategoryExamName,
                    Duration = peh.PracticeExam.Duration,
                    SubmittedDateTime = peh.EndTime,
                    Score = peh.Score ?? 0
                })
                .ToListAsync();

            return multiExams.Concat(practiceExams)
                .OrderBy(e => e.SubmittedDateTime)
                .ToList();
        }

        public async Task<List<AllSubjectBySemesterOfStudentDTOResponse>> GetAllSubjectBySemesterOfStudentAsync(int? semesterId, int? year, Guid userId)
        {
            // Nếu không có semesterId hoặc year, lấy năm và học kỳ mới nhất
            // Trả về năm và kỳ mới nhất
            if (!semesterId.HasValue && !year.HasValue)
            {
                // Tìm năm mới nhất từ MultiExam và PracticeExam
                var latestMultiExamYear = await _context.MultiExamHistories
                    .Where(meh => meh.Student.UserId == userId && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM)
                    .Select(meh => meh.MultiExam.CreateAt.Year)
                    .OrderByDescending(y => y)
                    .FirstOrDefaultAsync();

                var latestPracticeExamYear = await _context.PracticeExamHistories
                    .Where(peh => peh.Student.UserId == userId && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM)
                    .Select(peh => peh.PracticeExam.CreateAt.Year)
                    .OrderByDescending(y => y)
                    .FirstOrDefaultAsync();

                year = Math.Max(latestMultiExamYear, latestPracticeExamYear);
                if (year == 0 || year > DateTime.Now.Year) // Không có bài thi hoặc năm vượt quá 2025
                    return new List<AllSubjectBySemesterOfStudentDTOResponse>();

                // Tìm học kỳ mới nhất trong năm mới nhất
                var latestMultiExamSemester = await _context.MultiExamHistories
                    .Where(meh => meh.Student.UserId == userId
                        && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && meh.MultiExam.CreateAt.Year == year)
                    .Select(meh => new { meh.MultiExam.SemesterId, meh.MultiExam.CreateAt })
                    .OrderByDescending(x => x.CreateAt)
                    .FirstOrDefaultAsync();

                var latestPracticeExamSemester = await _context.PracticeExamHistories
                    .Where(peh => peh.Student.UserId == userId
                        && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && peh.PracticeExam.CreateAt.Year == year)
                    .Select(peh => new { peh.PracticeExam.SemesterId, peh.PracticeExam.CreateAt })
                    .OrderByDescending(x => x.CreateAt)
                    .FirstOrDefaultAsync();

                // Chọn học kỳ mới nhất dựa trên CreateAt
                semesterId = latestMultiExamSemester != null && latestPracticeExamSemester != null
                    ? (latestMultiExamSemester.CreateAt > latestPracticeExamSemester.CreateAt
                        ? latestMultiExamSemester.SemesterId
                        : latestPracticeExamSemester.SemesterId)
                    : latestMultiExamSemester?.SemesterId ?? latestPracticeExamSemester?.SemesterId;

                if (!semesterId.HasValue) // Không có bài thi trong năm mới nhất
                    return new List<AllSubjectBySemesterOfStudentDTOResponse>();
                return await _context.Subjects
             .Where(s => s.Classes.Any(c => c.SemesterId == semesterId
                 && c.ClassStudents.Any(cs => cs.Student.UserId == userId)
                 && (c.MultiExams.Any(me => me.MultiExamHistories.Any(meh => meh.Student.UserId == userId && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM))
                     || c.PracticeExams.Any(pe => pe.PracticeExamHistories.Any(peh => peh.Student.UserId == userId && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM)))))
             .Select(s => new AllSubjectBySemesterOfStudentDTOResponse
             {
                 Id = s.SubjectId,
                 Code = s.Course,
                 Year = year.Value,
                 SemesterId = semesterId.Value,
                 Name = s.SubjectName,
                 IsDeleted = !s.Classes.Any(c => c.Semester.IsActive)
             })
             .ToListAsync();
            }

            // Trả về năm mà nó truyền vào
            if (!semesterId.HasValue && year.HasValue)
            {
                var semesterIds = await _context.MultiExamHistories
                    .Where(meh => meh.Student.UserId == userId
                        && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                        && meh.MultiExam.CreateAt.Year == year)
                    .Select(meh => meh.MultiExam.SemesterId)
                    .Union(_context.PracticeExamHistories
                        .Where(peh => peh.Student.UserId == userId
                            && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM
                            && peh.PracticeExam.CreateAt.Year == year)
                        .Select(peh => peh.PracticeExam.SemesterId))
                    .Distinct()
                    .ToListAsync();

                if (!semesterIds.Any())
                    return new List<AllSubjectBySemesterOfStudentDTOResponse>();


                return await _context.Subjects
                    .Where(s => s.Classes.Any(c => semesterIds.Contains(c.SemesterId)
                        && c.ClassStudents.Any(cs => cs.Student.UserId == userId)
                        && (c.MultiExams.Any(me => me.MultiExamHistories.Any(meh => meh.Student.UserId == userId && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM && me.CreateAt.Year == year))
                            || c.PracticeExams.Any(pe => pe.PracticeExamHistories.Any(peh => peh.Student.UserId == userId && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM && pe.CreateAt.Year == year)))))
                    .Select(s => new AllSubjectBySemesterOfStudentDTOResponse
                    {
                        Id = s.SubjectId,
                        Code = s.Course,
                        Year = year.Value,
                        Name = s.SubjectName,
                        IsDeleted = !s.Classes.Any(c => c.Semester.IsActive)
                    })
                    .Distinct()
                    .ToListAsync();
            }

            else
            {
                // Trả về năm và kỳ nó truyền vào 
                // Truy vấn môn học dựa trên semesterId và year
                return await _context.Subjects
                    .Where(s => s.Classes.Any(c => c.SemesterId == semesterId
                        && c.ClassStudents.Any(cs => cs.Student.UserId == userId)
                        && (c.MultiExams.Any(me => me.MultiExamHistories.Any(meh => meh.Student.UserId == userId && meh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM && me.CreateAt.Year == year))
                            || c.PracticeExams.Any(pe => pe.PracticeExamHistories.Any(peh => peh.Student.UserId == userId && peh.StatusExam == PredefinedStatusExamInHistoryOfStudent.COMPLETED_EXAM && pe.CreateAt.Year == year)))))
                    .Select(s => new AllSubjectBySemesterOfStudentDTOResponse
                    {
                        Id = s.SubjectId,
                        Code = s.Course,
                        Year = year.Value,
                        SemesterId = semesterId.Value,
                        Name = s.SubjectName,
                        IsDeleted = !s.Classes.Any(c => c.Semester.IsActive)
                    })
                    .ToListAsync();
            }
        
        }

    }
}
