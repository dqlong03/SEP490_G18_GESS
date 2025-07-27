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

        public async Task<IEnumerable<SubjectDTO>> GetAllSubjectsByTeacherId(Guid teacherId)
        {
            var majorId = await _context.Teachers
                .Where(t => t.TeacherId == teacherId)
                .Select(t => t.MajorId).FirstAsync();
            //get traning program by majorid
            var trainingProgramId = await _context.TrainingPrograms
                .Where(tp => tp.MajorId == majorId)
                .OrderBy(tp => tp.StartDate)
                .Select(tp => tp.TrainProId)
                .FirstAsync();
            //get all subjects by training program id
            var subjects = await _context.SubjectTrainingPrograms
                .Where(s => s.TrainProId == trainingProgramId)
                .Select(s => new SubjectDTO
                {
                    SubjectId = s.SubjectId,
                    SubjectName = s.Subject.SubjectName,
                    NoCredits = s.Subject.NoCredits,
                    Description = s.Subject.Description,
                    Course = s.Subject.Course
                })
                .ToListAsync();
            if (subjects == null || !subjects.Any())
            {
                return Enumerable.Empty<SubjectDTO>();
            }
            return subjects;
        }

        public async Task<IEnumerable<TeacherResponse>> GetAllTeacherHaveSubject(int subjectId)
        {
            var teachers = await _context.SubjectTeachers
                .Where(st => st.SubjectId == subjectId)
                .Select(st => new TeacherResponse
                {
                    TeacherId = st.Teacher.TeacherId,
                    UserName = st.Teacher.User.UserName,
                    Email = st.Teacher.User.Email,
                    PhoneNumber = st.Teacher.User.PhoneNumber,
                    MajorId = st.Teacher.MajorId,
                    Fullname = st.Teacher.User.Fullname
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
