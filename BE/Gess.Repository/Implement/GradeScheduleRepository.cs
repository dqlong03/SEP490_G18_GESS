using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.GradeSchedule;
using GESS.Model.PracticeQuestionDTO;
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

        public async Task<int> CountExamNeedGradeByTeacherIdAsync(
          Guid teacherId,
          int? subjectId,
          int? statusExam,
          int? semesterId,
          int? year,
          int? pagesze,
          int? pageindex)
        {
            int pageSize = pagesze ?? 10;

            var query = _context.ExamSlotRooms
                .Where(e => e.ExamGradedId == teacherId);

            if (subjectId.HasValue)
                query = query.Where(e => e.SubjectId == subjectId);

            if (statusExam.HasValue)
                query = query.Where(e => e.IsGraded == statusExam);

            if (semesterId.HasValue)
                query = query.Where(e => e.SemesterId == semesterId);

            if (year.HasValue)
                query = query.Where(e => e.PracticeExam.StartDay.HasValue && e.PracticeExam.StartDay.Value.Year == year);

            int totalCount = await query.CountAsync();
            int pageNumber = (int)Math.Ceiling((double)totalCount / pageSize);

            return pageNumber;
        }

        public async Task<IEnumerable<ExamNeedGrade>> GetExamNeedGradeByTeacherIdAsync(
          Guid teacherId,
          int? subjectId,
          int? statusExam,
          int? semesterId,
          int? year,
          int? pagesze,
          int? pageindex)
        {
            int pageSize = pagesze ?? 10;
            int pageIndex = pageindex ?? 1;

            var query = _context.ExamSlotRooms
                .Where(e => e.ExamGradedId == teacherId);

            if (subjectId.HasValue)
                query = query.Where(e => e.SubjectId == subjectId);

            if (statusExam.HasValue)
                query = query.Where(e => e.IsGraded == statusExam);

            if (semesterId.HasValue)
                query = query.Where(e => e.SemesterId == semesterId);

            if (year.HasValue)
                query = query.Where(e => e.PracticeExam.StartDay.HasValue && e.PracticeExam.StartDay.Value.Year == year);

            var exams = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
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


        public async Task<IEnumerable<ExamNeedGradeMidTerm>> GetExamNeedGradeByTeacherIdMidTermAsync(
            Guid teacherId, int classID, int semesterId, int year, int pagesize, int pageindex)
        {
            var multiExamQuery = _context.MultiExams
                .Where(x => x.TeacherId == teacherId
                         && x.ClassId == classID
                         && x.Status == "Đã đóng ca"
                         && x.SemesterId == semesterId
                         && x.StartDay.HasValue && x.StartDay.Value.Year == year)
                .Select(x => new ExamNeedGradeMidTerm
                {
                    ExamId = x.MultiExamId,
                    ExamName = x.MultiExamName,
                    ExamType = 1,
                    ClassId = x.ClassId,
                    IsGrade = x.IsGraded,
                    SemesterId = x.SemesterId
                });

            var pracExamQuery = _context.PracticeExams
                .Where(x => x.TeacherId == teacherId
                         && x.ClassId == classID
                         && x.Status == "Đã đóng ca"
                         && x.SemesterId == semesterId
                         && x.StartDay.HasValue && x.StartDay.Value.Year == year)
                .Select(x => new ExamNeedGradeMidTerm
                {
                    ExamId = x.PracExamId,
                    ExamName = x.PracExamName,
                    ExamType = 2,
                    ClassId = x.ClassId,
                    IsGrade = x.IsGraded,
                    SemesterId = x.SemesterId
                });

            var combinedQuery = multiExamQuery.Union(pracExamQuery);

            var result = await combinedQuery.ToListAsync();
            return result;
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

        public async Task<IEnumerable<StudentGradeDTO>> GetStudentsInExamNeedGradeMidTermAsync(Guid teacherId, int classID, int examType)
        {
            if (examType == 1)
            {
                var examIds = await _context.MultiExams
                    .Where(x => x.TeacherId == teacherId && x.ClassId == classID)
                    .Select(x => x.MultiExamId)
                    .ToListAsync();

                var students = await _context.MultiExamHistories
                    .Where(h => examIds.Contains(h.MultiExamId))
                    .Select(h => new StudentGradeDTO
                    {
                        Id = h.StudentId,
                        FullName = h.Student.User.Fullname,
                        Code = h.Student.User.Code,
                        AvatarURL = h.Student.AvatarURL,
                    })
                    .Distinct()
                    .ToListAsync();

                return students;
            }
            else if (examType == 2)
            {
                var examIds = await _context.PracticeExams
                    .Where(x => x.TeacherId == teacherId && x.ClassId == classID)
                    .Select(x => x.PracExamId)
                    .ToListAsync();

                var students = await _context.PracticeExamHistories
                    .Where(h => examIds.Contains(h.PracExamId))
                    .Select(h => new StudentGradeDTO
                    {
                        Id = h.StudentId,
                        FullName = h.Student.User.Fullname,
                        Code = h.Student.User.Code,
                        AvatarURL = h.Student.AvatarURL,
                    })
                    .Distinct()
                    .ToListAsync();

                return students;
            }

            return Enumerable.Empty<StudentGradeDTO>();
        }


        public async Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeAsync(Guid teacherId, int examId, Guid studentId)
        {
            var submissions = await _context.PracticeExamHistories
                .Where(p => p.StudentId == studentId && p.PracticeExam.ExamSlotRoom.ExamSlotRoomId == examId)
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
                    GradedScore = q.Score,
                    GradingCriteria = q.PracticeQuestion.PracticeAnswer.GradingCriteria,
                }).ToListAsync();
            submissions.QuestionPracExamDTO = questions;
            return submissions;
        }

        public async Task<StudentSubmissionMultiExam> GetSubmissionOfStudentInExamNeedGradeMidTermMulti(Guid teacherId, int examId, Guid studentId)
        {
            var submission = await _context.MultiExamHistories
                .Where(p => p.StudentId == studentId && p.MultiExam.MultiExamId == examId)
                .Select(p => new StudentSubmissionMultiExam
                {
                    MultiExamHistoryId = p.ExamHistoryId,
                    StudentId = p.StudentId,
                    StudentCode = p.Student.User.Code,
                    FullName = p.Student.User.Fullname,
                }).FirstOrDefaultAsync();

            if (submission == null) return null;

            var questions = await _context.QuestionMultiExams
                .Where(q => q.MultiExamHistoryId == submission.MultiExamHistoryId)
                .Select(q => new QuestionMultiExamDTO
                {
                    MultipleQuestionId = q.MultiQuestionId,
                    QuestionContent = q.MultiQuestion.Content,
                    StudentAnswer = q.Answer,
                    Order = q.QuestionOrder,
                    Answers = q.MultiQuestion.MultiAnswers
                        .Select(a => new MultipleAnswerDTO
                        {
                            AnswerId = a.AnswerId,
                            AnswerContent = a.AnswerContent,
                            IsCorrect = a.IsCorrect
                        }).ToList()
                }).ToListAsync();

            submission.QuestionMultiExamDTO = questions;
            return submission;
        }

        public async Task<StudentSubmission> GetSubmissionOfStudentInExamNeedGradeMidTerm(Guid teacherId, int examId, Guid studentId)
        {
            var submissions = await _context.PracticeExamHistories
                .Where(p => p.StudentId == studentId && p.PracticeExam.PracExamId == examId)
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
                    QuestionContent = q.PracticeQuestion.Content,
                    Answer = q.Answer,
                    Score = q.PracticeExamHistory.PracticeExamPaper.PracticeTestQuestions
                    .Where(ptq => ptq.PracticeQuestionId == q.PracticeQuestionId)
                    .Select(ptq => ptq.Score)
                    .FirstOrDefault(),
                    GradedScore = q.Score,
                    GradingCriteria = q.PracticeQuestion.PracticeAnswer.GradingCriteria,
                }).ToListAsync();
            submissions.QuestionPracExamDTO = questions;
            return submissions;
        }
        public async Task<bool> GradeSubmission(Guid teacherId, int examId, Guid studentId, QuestionPracExamDTO questionPracExamDTO)
        {
            // Tìm bài làm của học sinh trong đề thi
            var submission = await _context.PracticeExamHistories
                .Where(p => p.StudentId == studentId
                            && p.PracticeExam.PracExamId == examId)
                .Select(p => new
                {
                    p.PracExamHistoryId,
                    p.PracExamPaperId
                }).FirstOrDefaultAsync();

            if (submission == null)
            {
                return false;
            }

            // Lấy câu hỏi cần chấm điểm
            var question = await _context.QuestionPracExams
                .FirstOrDefaultAsync(q => q.PracExamHistoryId == submission.PracExamHistoryId
                                          && q.PracticeQuestionId == questionPracExamDTO.PracticeQuestionId);

            if (question == null)
            {
                return false;
            }

            // Cập nhật điểm
            question.Score = questionPracExamDTO.GradedScore;
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
