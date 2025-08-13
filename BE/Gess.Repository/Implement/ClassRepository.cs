using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.Class;
using GESS.Model.GradeComponent;
using GESS.Model.Subject;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ClassRepository : BaseRepository<Class>, IClassRepository
    {
        private readonly GessDbContext _context;
        public ClassRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }



        //
        public async Task<IEnumerable<StudentExamScoreDTO>> GetStudentScoresByExamAsync(int examId, int examType)
        {
            if (examType == 1)
            {
                // Multiple choice
                return await (from meh in _context.MultiExamHistories
                              join s in _context.Students on meh.StudentId equals s.StudentId
                              join u in _context.Users on s.UserId equals u.Id
                              where meh.MultiExamId == examId
                              select new StudentExamScoreDTO
                              {
                                  StudentId = s.StudentId,
                                  FullName = u.Fullname,
                                  Code = u.Code,
                                  Score = meh.Score
                              }).ToListAsync();
            }
            else if (examType == 2)
            {
                // Essay
                return await (from peh in _context.PracticeExamHistories
                              join s in _context.Students on peh.StudentId equals s.StudentId
                              join u in _context.Users on s.UserId equals u.Id
                              where peh.PracExamId == examId
                              select new StudentExamScoreDTO
                              {
                                  StudentId = s.StudentId,
                                  FullName = u.Fullname,
                                  Code = u.Code,
                                  Score = peh.Score
                              }).ToListAsync();
            }
            else
            {
                return new List<StudentExamScoreDTO>();
            }
        }






        //Lấy subjectId theo classId
        public async Task<int?> GetSubjectIdByClassIdAsync(int classId)
        {
            return await _context.Classes
                .Where(c => c.ClassId == classId)
                .Select(c => (int?)c.SubjectId)
                .FirstOrDefaultAsync();
        }

        //Lấy danh sách học sinh theo id lớp học
        public async Task<IEnumerable<StudentInClassDTO>> GetStudentsByClassIdAsync(int classId)
        {

            var students = await _context.ClassStudents
                .Where(cs => cs.ClassId == classId)
                .Select(cs => new StudentInClassDTO
                {
                    StudentId = cs.Student.StudentId,
                    FullName = cs.Student.User.Fullname,
                    AvatarURL = cs.Student.AvatarURL,
                    Code = cs.Student.User.Code
                })
                .ToListAsync();

            try
            {
                // Validate input
                if (classId <= 0)
                    throw new ArgumentException("ClassId phải lớn hơn 0", nameof(classId));
                     students = await _context.ClassStudents
                    .Where(cs => cs.ClassId == classId)
                    .Select(cs => new StudentInClassDTO
                    {
                        StudentId = cs.Student.StudentId,
                        FullName = cs.Student.User.Fullname,
                        AvatarURL = cs.Student.AvatarURL,
                        Code = cs.Student.User.Code
                    })
                    .ToListAsync();

                return students;
            }
            catch (ArgumentException ex)
            {
                throw;
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Lỗi thao tác database: {ex.Message}", ex);
            }
            catch (Microsoft.Data.SqlClient.SqlException ex)
            {
                throw new InvalidOperationException($"Lỗi kết nối database: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi lấy danh sách học sinh: {ex.Message}", ex);
            }
        }

        //Lấy danh sách các GradeComponent theo id lớp học
        public async Task<IEnumerable<GradeComponentDTO>> GetGradeComponentsByClassIdAsync(int classId)
        {
            // Lấy subjectId từ classId
            var subjectId = await _context.Classes
                .Where(c => c.ClassId == classId)
                .Select(c => c.SubjectId)
                .FirstOrDefaultAsync();

            if (subjectId == 0)
                return new List<GradeComponentDTO>();

            // Lấy các CategoryExam liên kết với subjectId
            var gradeComponents = await (from ces in _context.CategoryExamSubjects
                                         join ce in _context.CategoryExams on ces.CategoryExamId equals ce.CategoryExamId
                                         where ces.SubjectId == subjectId
                                               && !EF.Functions.Like(ce.CategoryExamName.ToLower(), Common.PredefinedCategoryExam.Final_EXAM_CATEGORY)
                                         select new GradeComponentDTO
                                         {
                                             CategoryExamId = ce.CategoryExamId,
                                             CategoryExamName = ce.CategoryExamName
                                         }).Distinct().ToListAsync();


            return gradeComponents;
        }

        //Lấy danh sách chương theo id lớp học
        public async Task<IEnumerable<ChapterInClassDTO>> GetChaptersByClassIdAsync(int classId)
        {
            var chapters = await (from c in _context.Classes
                                  join ch in _context.Chapters on c.SubjectId equals ch.SubjectId
                                  where c.ClassId == classId
                                  select new ChapterInClassDTO
                                  {
                                      ChapterId = ch.ChapterId,
                                      ChapterName = ch.ChapterName,
                                      Description = ch.Description
                                  }).ToListAsync();

            return chapters;
        }


        //Lay ra chi tiet lop học: học sinh trong lớp + các bài kiếm tra của lớp
        public async Task<ClassDetailResponseDTO?> GetClassDetailAsync(int classId)
        {
            var classEntity = await _context.Classes
                .Include(c => c.ClassStudents)
                    .ThenInclude(cs => cs.Student)
                        .ThenInclude(s => s.User)
                .Include(c => c.MultiExams)
                    .ThenInclude(e => e.CategoryExam)
                .Include(c => c.PracticeExams)
                    .ThenInclude(e => e.CategoryExam)
                .FirstOrDefaultAsync(c => c.ClassId == classId);

            if (classEntity == null)
                return null;

            var students = classEntity.ClassStudents
                .Select(cs => new StudentInClassDTO
                {
                    StudentId = cs.Student.StudentId,
                    FullName = cs.Student.User.Fullname,
                    AvatarURL = cs.Student.AvatarURL,
                    Code = cs.Student.User.Code
                }).ToList();

            // Lọc các bài kiểm tra KHÔNG phải "cuối kỳ"
            var multiExams = classEntity.MultiExams
                .Where(e => e.CategoryExam == null ||
                            !e.CategoryExam.CategoryExamName.ToLower().Contains("cuối kỳ"))
                .Select(e =>
                {
                    var histories = _context.MultiExamHistories.Where(h => h.MultiExamId == e.MultiExamId).ToList();
                    var isCompleted = histories.Any(h => h.IsGrade == true);
                    return new ExamInClassDTO
                    {
                        ExamId = e.MultiExamId,
                        ExamName = e.MultiExamName,
                        GradeComponent = e.CategoryExam?.CategoryExamName ?? "",
                        IsGraded = e.IsGraded == 1 ? "Đã chấm" : "Chưa chấm",
                        StudentCount = histories.Count,
                        Duration = e.Duration,
                        QuestionCount = e.NumberQuestion,
                        ExamType = "Multiple", // Loại bài thi
                        Status = e.Status
                    };
                });

            var practiceExams = classEntity.PracticeExams
                .Where(e => e.CategoryExam == null ||
                            !e.CategoryExam.CategoryExamName.ToLower().Contains("cuối kỳ"))
                .Select(e =>
                {
                    var histories = _context.PracticeExamHistories.Where(h => h.PracExamId == e.PracExamId).ToList();
                    var isCompleted = histories.Any(h => h.IsGraded == true);
                    var questionCount = _context.NoPEPaperInPEs.Count(n => n.PracExamId == e.PracExamId);

                    return new ExamInClassDTO
                    {
                        ExamId = e.PracExamId,
                        ExamName = e.PracExamName,
                        GradeComponent = e.CategoryExam?.CategoryExamName ?? "",
                        IsGraded = e.IsGraded == 1 ? "Đã chấm" : "Chưa chấm",
                        StudentCount = histories.Count,
                        Duration = e.Duration,
                        ExamType = "Practice", // Loại bài thi
                        Status = e.Status,
                        QuestionCount = questionCount
                    };
                });

            var exams = multiExams.Concat(practiceExams).ToList();

            return new ClassDetailResponseDTO
            {
                ClassId = classEntity.ClassId,
                ClassName = classEntity.ClassName,
                Students = students,
                Exams = exams
            };
        }

        public Task<bool> ClassExistsAsync(string className)
        {
            var exists = _context.Classes.AnyAsync(c => c.ClassName == className);
            return exists;
        }

        public async Task<int> CountStudentsInClassAsync(int classId)
        {
            return await _context.ClassStudents
                .Where(cs => cs.ClassId == classId)
                .Select(cs => cs.StudentId) // lọc ra student
                .Distinct()                 // nếu có thể trùng lặp
                .CountAsync();
        }


        public async Task<IEnumerable<ClassListDTO>> GetAllClassAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5)
        {
            try
            {
                // Validate pagination parameters
                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1) pageSize = 5;
                
                // Check for potential overflow
                if (pageNumber > int.MaxValue / pageSize)
                {
                    throw new ArgumentException("Page hoặc pageSize quá lớn, có thể gây overflow");
                }

                var query = _context.Classes
                    .Include(c => c.Subject)
                    .Include(c => c.Semester)
                    .Include(c => c.ClassStudents)
                    .AsQueryable();

            // Lọc theo tên lớp, môn, kỳ nếu có
            if (!string.IsNullOrWhiteSpace(name))
            {
                var lowered = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(lowered) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(lowered)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(lowered))
                );
            }

            // Lọc theo SubjectId nếu có
            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            // Lọc theo SemesterId nếu có
            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            query = query
                .OrderByDescending(c => c.ClassId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            var result = await query.ToListAsync();

            return result.Select(c => new ClassListDTO
            {
                ClassId = c.ClassId,
                ClassName = c.ClassName,
                SubjectName = c.Subject?.SubjectName ?? "",
                SemesterName = c.Semester?.SemesterName ?? "",
                StudentCount = c.ClassStudents?.Count ?? 0
            });
            }
            catch (ArgumentException ex)
            {
                throw;
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Lỗi thao tác database: {ex.Message}", ex);
            }
            catch (Microsoft.Data.SqlClient.SqlException ex)
            {
                throw new InvalidOperationException($"Lỗi kết nối database: {ex.Message}", ex);
            }
            catch (TimeoutException ex)
            {
                throw new TimeoutException($"Timeout khi truy vấn database: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi lấy danh sách lớp học: {ex.Message}", ex);
            }
        }



        public async Task<IEnumerable<Class>> GetAllClassesAsync()
        {
            var classes = _context.Classes.Include(c => c.Subject).Include(c => c.Teacher).Include(c => c.Semester)
                 .ToListAsync();
            return await classes;
        }
        public async Task<int> CountPageAsync(string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5)
        {
            IQueryable<Class> query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester);

            if (!string.IsNullOrWhiteSpace(name))
            {
                var loweredName = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(loweredName) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(loweredName)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(loweredName)));
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            var totalCount = await query.CountAsync();
            return (int)Math.Ceiling((double)totalCount / pageSize);
        }


        public async Task<IEnumerable<ClassListDTO>> GetAllClassByTeacherIdAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageNumber = 1, int pageSize = 5, int? year = null)
        {
            var query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Include(c => c.ClassStudents)
                .Where(c => c.TeacherId == teacherId) // lọc theo giáo viên
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var lowered = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(lowered) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(lowered)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(lowered))
                );
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            if (year.HasValue)
            {
                query = query.Where(c => c.CreatedDate.HasValue && c.CreatedDate.Value.Year == year.Value);
            }


            query = query
                .OrderByDescending(c => c.ClassId)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            var result = await query.ToListAsync();

            return result.Select(c => new ClassListDTO
            {
                ClassId = c.ClassId,
                ClassName = c.ClassName,
                SubjectName = c.Subject?.SubjectName ?? "",
                SemesterName = c.Semester?.SemesterName ?? "",
                StudentCount = c.ClassStudents?.Count ?? 0
            });
        }
        public async Task<int> CountPageByTeacherAsync(Guid teacherId, string? name = null, int? subjectId = null, int? semesterId = null, int pageSize = 5, int? year = null)
        {
            var query = _context.Classes
                .Include(c => c.Subject)
                .Include(c => c.Semester)
                .Where(c => c.TeacherId == teacherId)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                var lowered = name.ToLower();
                query = query.Where(c =>
                    c.ClassName.ToLower().Contains(lowered) ||
                    (c.Subject != null && c.Subject.SubjectName.ToLower().Contains(lowered)) ||
                    (c.Semester != null && c.Semester.SemesterName.ToLower().Contains(lowered)));
            }

            if (subjectId.HasValue)
            {
                query = query.Where(c => c.SubjectId == subjectId.Value);
            }

            if (semesterId.HasValue)
            {
                query = query.Where(c => c.SemesterId == semesterId.Value);
            }

            if (year.HasValue)
            {
                query = query.Where(c => c.CreatedDate.HasValue && c.CreatedDate.Value.Year == year.Value);
            }

            var totalCount = await query.CountAsync();
            return (int)Math.Ceiling((double)totalCount / pageSize);
        }
        public async Task<bool> CheckIfStudentInClassAsync(int classId, Guid studentId)
        {
            return await _context.ClassStudents
                .AnyAsync(cs => cs.ClassId == classId && cs.StudentId == studentId);
        }

        // Override CreateAsync to add validation
        public new async Task CreateAsync(Class entity)
        {
            try
            {
                // Validate TeacherId
                if (entity.TeacherId != Guid.Empty)
                {
                    var teacherExists = await _context.Teachers.AnyAsync(t => t.TeacherId == entity.TeacherId);
                    if (!teacherExists)
                        throw new ArgumentException($"Teacher với ID {entity.TeacherId} không tồn tại", nameof(entity.TeacherId));
                }

                // Validate SubjectId
                if (entity.SubjectId > 0)
                {
                    var subjectExists = await _context.Subjects.AnyAsync(s => s.SubjectId == entity.SubjectId);
                    if (!subjectExists)
                        throw new ArgumentException($"Subject với ID {entity.SubjectId} không tồn tại", nameof(entity.SubjectId));
                }

                // Validate SemesterId
                if (entity.SemesterId > 0)
                {
                    var semesterExists = await _context.Semesters.AnyAsync(s => s.SemesterId == entity.SemesterId);
                    if (!semesterExists)
                        throw new ArgumentException($"Semester với ID {entity.SemesterId} không tồn tại", nameof(entity.SemesterId));
                }

                // Validate ClassName is not empty
                if (string.IsNullOrWhiteSpace(entity.ClassName))
                    throw new ArgumentException("Tên lớp không được để trống", nameof(entity.ClassName));

                // Validate ClassName is unique
                var existingClass = await _context.Classes.AnyAsync(c => c.ClassName == entity.ClassName);
                if (existingClass)
                    throw new ArgumentException($"Tên lớp '{entity.ClassName}' đã tồn tại", nameof(entity.ClassName));

                // Call base CreateAsync
                await base.CreateAsync(entity);
            }
            catch (ArgumentException ex)
            {
                throw;
            }
            catch (InvalidOperationException ex)
            {
                throw new InvalidOperationException($"Lỗi thao tác database: {ex.Message}", ex);
            }
            catch (Microsoft.Data.SqlClient.SqlException ex)
            {
                throw new InvalidOperationException($"Lỗi kết nối database: {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi không xác định khi tạo lớp học: {ex.Message}", ex);
            }
        }


        // Gess.Repository/Implement/ClassRepository.cs
        public async Task<IEnumerable<SubjectListDTO>> GetSubjectsByTeacherIdAsync(Guid teacherId)
        {
            var result = await (from st in _context.SubjectTeachers
                                join s in _context.Subjects on st.SubjectId equals s.SubjectId
                                where st.TeacherId == teacherId
                                select new SubjectListDTO
                                {
                                    SubjectId = s.SubjectId,
                                    SubjectName = s.SubjectName
                                })
                                .Distinct()
                                .ToListAsync();
            return result;
        }


    }
}
