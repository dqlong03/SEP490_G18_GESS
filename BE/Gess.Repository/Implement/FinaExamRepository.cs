using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace GESS.Repository.Implement
{
    public class FinaExamRepository : IFinaExamRepository
    {
        private readonly GessDbContext _context;
        public FinaExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<FinalMultipleExamCreateDTO> CreateFinalMultipleExamAsync(FinalMultipleExamCreateDTO multipleExamCreateDto)
        {
            
            var multiExam = new MultiExam
            {
                MultiExamName = multipleExamCreateDto.MultiExamName,
                NumberQuestion = multipleExamCreateDto.NumberQuestion,
                SubjectId = multipleExamCreateDto.SubjectId,
                Duration = 0,
                StartDay = DateTime.Now,
                EndDay = DateTime.Now,
                CategoryExamId = 2,//Mac dinh la cuoi ky
                SemesterId = multipleExamCreateDto.SemesterId,
                TeacherId = multipleExamCreateDto.TeacherId,
                CreateAt = multipleExamCreateDto.CreateAt,
                IsPublish = true,
                ClassId = 1 // Mac dinh id 1 la lop ao
            };

            try
            {
                await _context.MultiExams.AddAsync(multiExam);
                await _context.SaveChangesAsync();
                foreach (var noQuestion in multipleExamCreateDto.NoQuestionInChapterDTO)
                {
                    //chon ngau nhien noQuestion.NumberQuestion theo chapter va level
                    var questions = await _context.MultiQuestions
                        .Where(q => q.ChapterId == noQuestion.ChapterId && q.LevelQuestionId == noQuestion.LevelQuestionId)
                        .OrderBy(q => Guid.NewGuid())
                        .Take(noQuestion.NumberQuestion)
                        .ToListAsync();
                    //add cac cau hoi tren vao bang FinalExam
                    foreach (var question in questions)
                    {
                        var finalExam = new FinalExam
                        {
                            MultiExamId = multiExam.MultiExamId,
                            MultiQuestionId = question.MultiQuestionId,
                        };
                        await _context.FinalExam.AddAsync(finalExam);
                        await _context.SaveChangesAsync();
                    }
                }
                await _context.SaveChangesAsync();
                
                return new FinalMultipleExamCreateDTO
                {
                    MultiExamName = multiExam.MultiExamName,
                    NumberQuestion = multiExam.NumberQuestion,
                    CreateAt = multiExam.CreateAt,
                    TeacherId = multipleExamCreateDto.TeacherId,
                    SubjectId = multiExam.SubjectId,
                    SemesterId = multiExam.SemesterId
                };
            }
            catch (Exception ex)
            {
                throw new Exception("Error creating multiple exam: " + ex.Message);
            }
        }

        public async Task<FinalPracticeExamCreateDTO?> CreateFinalPracExamAsync(FinalPracticeExamCreateDTO finalPracExamCreateDto)
        {
            try
            {
                var pracExam = new PracticeExam
                {
                    PracExamName = finalPracExamCreateDto.PracExamName,
                    SubjectId = finalPracExamCreateDto.SubjectId,
                    Duration = 0,
                    StartDay = DateTime.Now,
                    EndDay = DateTime.Now,
                    CategoryExamId = 2, // Mặc định là cuối kỳ
                    SemesterId = finalPracExamCreateDto.SemesterId,
                    TeacherId = finalPracExamCreateDto.TeacherId,
                    CreateAt = DateTime.Now,
                    ClassId = 1 // Mặc định lớp ảo
                };

                await _context.PracticeExams.AddAsync(pracExam);
                await _context.SaveChangesAsync();

                foreach (var paper in finalPracExamCreateDto.PracticeExamPaperDTO)
                {
                    var examPaper = new NoPEPaperInPE
                    {
                        PracExamPaperId = paper.PracExamPaperId,
                        PracExamId = pracExam.PracExamId
                    };
                    await _context.NoPEPaperInPEs.AddAsync(examPaper); 
                }

                await _context.SaveChangesAsync();

                return new FinalPracticeExamCreateDTO
                {
                    PracExamName = pracExam.PracExamName,
                    TeacherId = pracExam.TeacherId,
                    SubjectId = pracExam.SubjectId,
                    SemesterId = pracExam.SemesterId
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi tạo FinalPracticeExam: " + ex.Message);
                return null;
            }
        }


        public async Task<List<ChapterInClassDTO>> GetAllChapterBySubjectId(int subjectId)
        {
            var chapters = await _context.Chapters
                .Where(c => c.SubjectId == subjectId)
                .Select(c => new ChapterInClassDTO
                {
                    
                    ChapterId= c.ChapterId,
                    ChapterName = c.ChapterName,
                    Description = c.Description
                })
                .ToListAsync();
            return chapters ?? new List<ChapterInClassDTO>();
        }

        public async Task<List<ExamPaperDTO>> GetAllFinalExamPaper(int subjectId, int semesterId)
        {
            var examPapers = await _context.PracticeExamPapers
                .Where(e => e.SubjectId == subjectId && e.SemesterId == semesterId && e.CategoryExamId == 2) // CategoryExamId 2 for final exams
                .Select(e => new ExamPaperDTO
                {
                    PracExamPaperId = e.PracExamPaperId,
                    PracExamPaperName = e.PracExamPaperName,
                    SemesterName = e.Semester.SemesterName

                })
                .ToListAsync();
            return examPapers ?? new List<ExamPaperDTO>();
        }

        public async Task<List<SubjectDTO>> GetAllMajorByTeacherId(Guid teacherId)
        {
            // get all subject id by teacher id in subjectteacher
            var subjectIds = await _context.SubjectTeachers
                .Where(st => st.TeacherId == teacherId && st.IsCreateExamTeacher)
                .Select(st => st.SubjectId)
                .ToListAsync();
            // get all subjects by subject ids
            var subjects = await _context.Subjects
                .Where(s => subjectIds.Contains(s.SubjectId))
                .Select(s => new SubjectDTO
                {
                    SubjectId = s.SubjectId,
                    SubjectName = s.SubjectName,
                    Course = s.Course,
                    Description = s.Description,
                    NoCredits = s.NoCredits
                })
                .ToListAsync();
            return subjects ?? new List<SubjectDTO>();
        }

        public async Task<PracticeExamPaperDetailDTO> ViewFinalExamPaperDetail(int examPaperId)
        {
            var examPaper = await _context.PracticeExamPapers
                .Include(e => e.PracticeTestQuestions)
                .ThenInclude(q => q.PracticeQuestion)
                .FirstOrDefaultAsync(e => e.PracExamPaperId == examPaperId);
            if (examPaper == null)
            {
                throw new Exception("Exam paper not found.");
            }
            var examPaperDetail = new PracticeExamPaperDetailDTO
            {
                PracExamPaperId = examPaper.PracExamPaperId,
                PracExamPaperName = examPaper.PracExamPaperName,
                SemesterName = examPaper.Semester.SemesterName,
                SubjectName = examPaper.Subject.SubjectName,
                Questions = examPaper.PracticeTestQuestions.Select(q => new Model.PracticeExamPaper.PracticeExamQuestionDetailDTO
                {
                    QuestionOrder = q.QuestionOrder,
                    Content = q.PracticeQuestion.Content,
                    AnswerContent = q.PracticeQuestion.PracticeAnswer?.AnswerContent,
                    Score = q.Score
                }).ToList()
            };
            return examPaperDetail;
        }
    }
}
