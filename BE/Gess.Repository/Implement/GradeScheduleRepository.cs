using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.PracticeTestQuestions;
using GESS.Model.QuestionPracExam;
using GESS.Model.Student;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class GradeScheduleRepository : IGradeScheduleRepository
    {

        private readonly GessDbContext _context;
        public GradeScheduleRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<int> CountExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze)
        {
            int pageNumber = _context.ExamSlotRooms
                .Where(e => e.ExamGradedId == teacherId && e.SubjectId == subjectId && e.IsGraded == statusExam && e.SemesterId == semesterId && e.PracticeExam.StartDay.Year == year)
                .Count();
            pageNumber = (int)Math.Ceiling((double)pageNumber / pagesze);
            return await Task.FromResult(pageNumber);
        }

        public async Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(Guid teacherId, int subjectId, int statusExam, int semesterId, int year, int pagesze, int pageindex)
        {
            var exams = await _context.ExamSlotRooms
                .Where(e => e.ExamGradedId == teacherId && e.SubjectId == subjectId && e.IsGraded == statusExam && e.SemesterId == semesterId && e.PracticeExam.StartDay.Year == year)
                .Skip((pageindex - 1) * pagesze)
                .Take(pagesze)
                .Select(e => new ExamNeedGrade
                {
                    ExamSlotRoomId = e.ExamSlotRoomId,
                    ExamId = e.PracticeExam.PracExamId,
                    ExamName = e.PracticeExam.PracExamName,
                    SubjectName = e.Subject.SubjectName,
                    SemesterId = e.SemesterId,
                    ExamDate = e.PracticeExam.StartDay,
                    IsGrade = e.IsGraded,
                })
                .ToListAsync();
            if (exams == null || !exams.Any())
            {
                return Enumerable.Empty<ExamNeedGrade>();
            }
            return exams;
        }

        public async Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeAsync(Guid teacherId, int examId)
        {
            var students = await _context.ExamSlotRooms
                .Where(e => e.ExamGradedId == teacherId && e.PracticeExam.PracExamId == examId)
                .SelectMany(e => e.StudentExamSlotRooms)
                .Select(s => new StudentGradeDTO
                {
                    Id = s.StudentId,
                    FullName = s.Student.User.Fullname,
                    Code = s.Student.User.Code,
                    AvatarURL = s.Student.AvatarURL,
                }).ToListAsync();
            if (students == null || !students.Any())
            {
                return Enumerable.Empty<StudentGradeDTO>();
            }
            for (int i = 0; i < students.Count; i++)
            {
                var isGrade = _context.PracticeExamHistories
                    .Where(p => p.StudentId == students[i].Id && p.PracticeExam.PracExamId == examId)
                    .FirstOrDefault();
                if (isGrade.IsGraded == null|| isGrade.IsGraded)
                {
                    students[i].IsGraded = 0; 
                    students[i].Grade = null;
                }
                else
                {
                    students[i].IsGraded = 1;
                    students[i].Grade = isGrade.Score;
                }
            }  
            return students;
        }

        public async Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId)
        {
            var submissions = await _context.PracticeExamHistories
                .Where(p => p.StudentId == studentId && p.PracticeExam.PracExamId == examId && p.IsGraded == false)
                .Select(p => new StudentSubmission
                {
                   PracExamHistoryId = p.PracExamHistoryId,
                   StudentId = p.StudentId,
                   StudentCode = p.Student.User.Code,
                   FullName = p.Student.User.Fullname,

                }).FirstOrDefaultAsync();
            if (submissions == null)
            {
                return null;
            }
            var questions = await _context.QuestionPracExams
                .Where(q => q.PracExamHistoryId == submissions.PracExamHistoryId)
                .Select(q => new QuestionPracExamDTO
                {
                    PracticeQuestionId = q.PracticeQuestionId,
                    QuestionContent= q.PracticeQuestion.Content,
                    Answer = q.Answer,
                    Score = q.PracticeExamHistory.PracticeExamPaper.PracticeTestQuestions
                    .Where(ptq => ptq.PracticeQuestionId == q.PracticeQuestionId)
                    .Select(ptq => ptq.Score)
                    .FirstOrDefault(),
                    GradingCriteria = q.PracticeQuestion.PracticeAnswer.GradingCriteria,
                }).ToListAsync();
            submissions.QuestionPracExamDTO = questions;
            return submissions;
        }
    }
}
