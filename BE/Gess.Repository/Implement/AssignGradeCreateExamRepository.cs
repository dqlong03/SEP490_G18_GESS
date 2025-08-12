using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GESS.Repository.Implement
{
    public class AssignGradeCreateExamRepository : IAssignGradeCreateExamRepository
    {
        private readonly GessDbContext _context;
        public AssignGradeCreateExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public bool AddTeacherToSubject(Guid teacherId, int subjectId)
        {
            // Validate input parameters
            if (teacherId == Guid.Empty)
            {
                return false;
            }
            
            if (subjectId <= 0)
            {
                return false;
            }
            
            // Check if assignment already exists
            var checkExist = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            
            if (checkExist!=null)
            {
                if(!checkExist.IsActiveSubjectTeacher)
                {
                   checkExist.IsActiveSubjectTeacher = true;
                    try
                    {
                        _context.SubjectTeachers.Update(checkExist);
                        _context.SaveChanges();
                        return true;
                    }
                    catch (Exception)
                    {
                        return false;
                    }
                }
                return false;
            }
            
            var subjectTeacher = new SubjectTeacher
            {   
                TeacherId = teacherId,
                SubjectId = subjectId,
                IsGradeTeacher = false,
                IsCreateExamTeacher = false,
                IsActiveSubjectTeacher = true
            };
            try
            {
                _context.SubjectTeachers.Add(subjectTeacher);
                _context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool AssignRoleCreateExam(Guid teacherId, int subjectId)
        {
            // Validate input parameters
            if (teacherId == Guid.Empty)
            {
                return false;
            }
            
            if (subjectId <= 0)
            {
                return false;
            }
            
            var subjectTeacher = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            if (subjectTeacher == null)
            {
                return false;
            }
            
            // Check if assignment is active
            if (!subjectTeacher.IsActiveSubjectTeacher)
            {
                return false;
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
                _context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;

            }
        }

        public bool AssignRoleGradeExam(Guid teacherId, int subjectId)
        {
            var subjectTeacher = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            if (subjectTeacher == null)
            {
                return false;
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
                _context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;

            }
        }

        public int CountPageNumberTeacherHaveSubject(int subjectId, string? textSearch, int pageSize)
        {
            var query = _context.SubjectTeachers
                .Where(st => st.SubjectId == subjectId)
                .Select(st => new
                {
                    st.Teacher.User.Fullname,
                    st.Teacher.User.UserName,
                    st.Teacher.User.Code
                });

            if (!string.IsNullOrWhiteSpace(textSearch))
            {
                string searchLower = textSearch.ToLower();
                query = query.Where(t =>
                    t.Fullname.ToLower().Contains(searchLower) ||
                    t.UserName.ToLower().Contains(searchLower) ||
                    t.Code.ToLower().Contains(searchLower));
            }

            int totalRecords = query.Count();
            return (int)Math.Ceiling((double)totalRecords / pageSize);
        }


        public bool DeleteTeacherFromSubject(Guid teacherId, int subjectId)
        {
            var subjectTeacher = _context.SubjectTeachers
                .FirstOrDefault(st => st.TeacherId == teacherId && st.SubjectId == subjectId);
            if (subjectTeacher == null)
            {
                return false;
            }

            // Kiểm tra xem giảng viên có đang chấm thi trong kỳ hiện tại không
            // Lấy kỳ và năm mới nhất từ danh sách chấm thi của giảng viên
            var teacherGradingAssignments = _context.ExamSlotRooms
                .Where(esr => esr.ExamGradedId == teacherId)
                .OrderByDescending(esr => esr.ExamDate.Year)
                .ThenByDescending(esr => esr.SemesterId)
                .Select(esr => new { esr.ExamDate.Year, esr.SemesterId })
                .FirstOrDefault();
            
            if (teacherGradingAssignments != null)
            {
                // Kiểm tra xem giảng viên có đang chấm thi trong kỳ mới nhất không
                var hasGradingAssignment = _context.ExamSlotRooms
                    .Any(esr => esr.ExamGradedId == teacherId && 
                                esr.SemesterId == teacherGradingAssignments.SemesterId &&
                                esr.SubjectId == subjectId &&
                                esr.ExamDate.Year == teacherGradingAssignments.Year);
                
                if (hasGradingAssignment)
                {
                    return false; // Không cho phép xóa vì giảng viên đang chấm thi trong kỳ hiện tại
                }
            }

            try
            {
                subjectTeacher.IsActiveSubjectTeacher = false;
                _context.SubjectTeachers.Update(subjectTeacher);
                _context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId, string? textSearch = null)
        {
            // Kiểm tra teacher có tồn tại không
            var teacher = await _context.Teachers
                .Where(t => t.TeacherId == teacherId)
                .Select(t => new { t.MajorId })
                .FirstOrDefaultAsync();

            if (teacher == null)
            {
                return Enumerable.Empty<SubjectDTO>();
            }

            // Lấy chương trình đào tạo theo ngành
            var trainingProgram = await _context.TrainingPrograms
                .Where(tp => tp.MajorId == teacher.MajorId)
                .OrderBy(tp => tp.StartDate)
                .Select(tp => new { tp.TrainProId })
                .FirstOrDefaultAsync();

            if (trainingProgram == null)
            {
                return Enumerable.Empty<SubjectDTO>();
            }

            // Lấy danh sách môn học
            var query = _context.SubjectTrainingPrograms
                .Where(s => s.TrainProId == trainingProgram.TrainProId)
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
                .Where(st => st.SubjectId == subjectId && st.IsActiveSubjectTeacher)
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
                    IsActive = st.Teacher.User.IsActive,
                    IsGraded = st.IsGradeTeacher,
                    IsCreateExam = st.IsCreateExamTeacher
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
                .Where(t => t.MajorId == majorId)
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
