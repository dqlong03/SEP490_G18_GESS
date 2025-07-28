using GESS.Entity.Contexts;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace GESS.Repository.Implement
{
    public class AssignGradeCreateExamRepository : IAssignGradeCreateExamRepository
    {
        private readonly GessDbContext _context;
        public AssignGradeCreateExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<bool> AssignRoleCreateExam(Guid teacherId, int subjectId)
        {
            var subjectTeacher = await _context.SubjectTeachers
                .FirstOrDefaultAsync(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            if (subjectTeacher == null)
            {
                return false; // Teacher is not assigned to this subject
            }
            if (subjectTeacher.IsCreateExamTeacher)
            {
                subjectTeacher.IsCreateExamTeacher = false;
            }
            else
            {
                subjectTeacher.IsCreateExamTeacher = true;
            }
            try
            {
                _context.SubjectTeachers.Update(subjectTeacher);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;

            }
        }

        public async Task<bool> AssignRoleGradeExam(Guid teacherId, int subjectId)
        {
            var subjectTeacher = await _context.SubjectTeachers
                .FirstOrDefaultAsync(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            if (subjectTeacher == null)
            {
                return false; // Teacher is not assigned to this subject
            }
            if (subjectTeacher.IsGradeTeacher)
            {
                subjectTeacher.IsGradeTeacher = false;
            }
            else
            {
                subjectTeacher.IsGradeTeacher = true;
            }
            try
            {
                _context.SubjectTeachers.Update(subjectTeacher);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;

            }
        }

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId, string? textSearch = null)
        {
            var majorId = await _context.Teachers
                .Where(t => t.TeacherId == teacherId)
                .Select(t => t.MajorId)
                .FirstAsync();

            // Lấy chương trình đào tạo theo ngành
            var trainingProgramId = await _context.TrainingPrograms
                .Where(tp => tp.MajorId == majorId)
                .OrderBy(tp => tp.StartDate)
                .Select(tp => tp.TrainProId)
                .FirstAsync();

            // Lấy danh sách môn học
            var query = _context.SubjectTrainingPrograms
                .Where(s => s.TrainProId == trainingProgramId)
                .Select(s => new SubjectDTO
                {
                    SubjectId = s.SubjectId,
                    SubjectName = s.Subject.SubjectName,
                    NoCredits = s.Subject.NoCredits,
                    Description = s.Subject.Description,
                    Course = s.Subject.Course
                });

            // Áp dụng tìm kiếm nếu có
            if (!string.IsNullOrWhiteSpace(textSearch))
            {
                string searchLower = textSearch.ToLower();
                query = query.Where(s => s.SubjectName.ToLower().Contains(searchLower));
            }

            var subjects = await query.ToListAsync();

            if (subjects == null || !subjects.Any())
            {
                return Enumerable.Empty<SubjectDTO>();
            }

            return subjects;
        }


        public async Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId, string? textSearch = null, int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.SubjectTeachers
                .Where(st => st.SubjectId == subjectId)
                .Select(st => new TeacherResponse
                {
                    TeacherId = st.Teacher.TeacherId,
                    UserName = st.Teacher.User.UserName,
                    Email = st.Teacher.User.Email,
                    PhoneNumber = st.Teacher.User.PhoneNumber,
                    MajorId = st.Teacher.MajorId,
                    Fullname = st.Teacher.User.Fullname,
                    Code = st.Teacher.User.Code,
                    DateOfBirth = st.Teacher.User.DateOfBirth,
                    Gender = st.Teacher.User.Gender,
                    HireDate = st.Teacher.HireDate,
                    IsActive = st.Teacher.User.IsActive
                });

            // Áp dụng tìm kiếm nếu có
            if (!string.IsNullOrWhiteSpace(textSearch))
            {
                string searchLower = textSearch.ToLower();
                query = query.Where(t =>
                    t.Fullname.ToLower().Contains(searchLower) ||
                    t.UserName.ToLower().Contains(searchLower) ||
                    t.Code.ToLower().Contains(searchLower));
            }

            // Phân trang
            var teachers = await query
                .OrderBy(t => t.Fullname) // Có thể thay đổi theo nhu cầu
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return teachers;
        }


        public async Task<IEnumerable<TeacherResponse>> GetAllTeacherInMajor(Guid teacherId)
        {
            var majorId = await _context.Teachers
                .Where(t => t.TeacherId == teacherId)
                .Select(t => t.MajorId)
                .FirstOrDefaultAsync();
            var teachers = await _context.Teachers
                .Where(t => t.MajorId == majorId && t.TeacherId != teacherId)
                .Select(t => new TeacherResponse
                {
                    TeacherId = t.TeacherId,
                    UserName = t.User.UserName,
                    Email = t.User.Email,
                    PhoneNumber = t.User.PhoneNumber,
                    MajorId = t.MajorId,
                    Fullname = t.User.Fullname,
                    Code = t.User.Code,
                    DateOfBirth = t.User.DateOfBirth,
                    Gender = t.User.Gender,
                    HireDate = t.HireDate,
                    IsActive = t.User.IsActive
                })
                .ToListAsync();
            if (teachers == null || !teachers.Any())
                {
                return Enumerable.Empty<TeacherResponse>();
            }
            return teachers;
        }
    }
}
