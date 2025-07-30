using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Chapter;
using GESS.Model.MultipleExam;
using GESS.Model.NoQuestionInChapter;
using GESS.Model.PracticeExam;
using GESS.Model.PracticeExamPaper;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GESS.Repository.Implement
{
    public class FinaExamRepository : IFinaExamRepository
    {
        private readonly GessDbContext _context;
        public FinaExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<int> CountPageNumberFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageSize)
        {
            int totalRecords;

            if (type == 1)
            {
                var query = _context.MultiExams
                    .Where(e => e.SubjectId == subjectId && e.CategoryExamId == 2);

                if (!string.IsNullOrEmpty(textSearch))
                {
                    query = query.Where(e => e.MultiExamName.Contains(textSearch));
                }

                if (semesterId.HasValue)
                {
                    query = query.Where(e => e.SemesterId == semesterId.Value);
                }

                if (year.HasValue)
                {
                    query = query.Where(e => e.CreateAt.Year == year.Value);
                }

                totalRecords = await query.CountAsync();
            }
            else
            {
                var query = _context.PracticeExams
                    .Where(e => e.SubjectId == subjectId && e.CategoryExamId == 2);

                if (!string.IsNullOrEmpty(textSearch))
                {
                    query = query.Where(e => e.PracExamName.Contains(textSearch));
                }

                if (semesterId.HasValue)
                {
                    query = query.Where(e => e.SemesterId == semesterId.Value);
                }

                if (year.HasValue)
                {
                    query = query.Where(e => e.CreateAt.Year == year.Value);
                }

                totalRecords = await query.CountAsync();
            }
            return (int)Math.Ceiling((double)totalRecords / pageSize);
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
                CategoryExamId = 2,
                SemesterId = multipleExamCreateDto.SemesterId,
                TeacherId = multipleExamCreateDto.TeacherId,
                CreateAt = multipleExamCreateDto.CreateAt,
                IsPublish = true,
                ClassId = 1
            };

            try
            {
                await _context.MultiExams.AddAsync(multiExam);
                await _context.SaveChangesAsync();

                var finalExamsToAdd = new List<FinalExam>();
                foreach (var noQuestion in multipleExamCreateDto.NoQuestionInChapterDTO)
                {
                    var questions = await _context.MultiQuestions
                        .Where(q => q.ChapterId == noQuestion.ChapterId && q.LevelQuestionId == noQuestion.LevelQuestionId)
                        .OrderBy(q => Guid.NewGuid())
                        .Take(noQuestion.NumberQuestion)
                        .ToListAsync();

                    foreach (var question in questions)
                    {
                        finalExamsToAdd.Add(new FinalExam
                        {
                            MultiExamId = multiExam.MultiExamId,
                            MultiQuestionId = question.MultiQuestionId
                        });
                    }
                }

                await _context.FinalExam.AddRangeAsync(finalExamsToAdd);

                var noQuestionInChaptersToAdd = multipleExamCreateDto.NoQuestionInChapterDTO
                    .Select(dto => new NoQuestionInChapter
                    {
                        MultiExamId = multiExam.MultiExamId,
                        ChapterId = dto.ChapterId,
                        LevelQuestionId = dto.LevelQuestionId,
                        NumberQuestion = dto.NumberQuestion
                    }).ToList();

                await _context.NoQuestionInChapters.AddRangeAsync(noQuestionInChaptersToAdd);

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

        public async Task<List<FinalExamListDTO>> GetAllFinalExam(int subjectId, int? semesterId, int? year, int type, string? textSearch, int pageNumber, int pageSize)
        {
            if (type == 1)
            {
               var query = _context.MultiExams
                    .Where(e => e.SubjectId == subjectId && e.CategoryExamId == 2)
                    .Select(e => new FinalExamListDTO
                    {
                        ExamId = e.MultiExamId,
                        ExamName = e.MultiExamName,
                        SemesterName = e.Semester.SemesterName,
                        SubjectName = e.Subject.SubjectName,
                        Year = e.CreateAt.Year,
                        SemesterId = e.SemesterId,
                        ExamType = 1 // 1 for multiple choice exam
                    });
                if (!string.IsNullOrEmpty(textSearch))
                {
                    query = query.Where(e => e.ExamName.Contains(textSearch));
                }
                if (semesterId.HasValue)
                {
                    query = query.Where(e => e.SemesterId == semesterId);
                }
                if (year.HasValue) {
                    query = query.Where(e => e.Year == year.Value);
                }
                var finalMultiExams = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return finalMultiExams ?? new List<FinalExamListDTO>();
            }
            else
            {
                var query = _context.PracticeExams
                    .Where(e => e.SubjectId == subjectId && e.CategoryExamId == 2)
                    .Select(e => new FinalExamListDTO
                    {
                        ExamId = e.PracExamId,
                        ExamName = e.PracExamName,
                        SemesterName = e.Semester.SemesterName,
                        SubjectName = e.Subject.SubjectName,
                        Year = e.CreateAt.Year,
                        SemesterId = e.SemesterId,
                        ExamType = 2 // 2 for practice exam
                    });
                if (!string.IsNullOrEmpty(textSearch))
                {
                    query = query.Where(e => e.ExamName.Contains(textSearch));
                }
                if (semesterId.HasValue)
                {
                    query = query.Where(e => e.SemesterId == semesterId);
                }
                if (year.HasValue)
                {
                    query = query.Where(e => e.Year == year.Value);
                }
                var finalPracExams = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
                return finalPracExams ?? new List<FinalExamListDTO>();
            }
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

        public async Task<List<ExamPaperDTO>> GetAllFinalExamPaper(int subjectId, int semesterId, int year)
        {
            var examPapers = await _context.PracticeExamPapers
                .Where(e => e.SubjectId == subjectId && e.SemesterId == semesterId && e.CategoryExamId == 2 &&e.CreateAt.Year==year)
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
                .Include(e => e.Semester) // ✅ Include thêm Semester
                .Include(e => e.Subject)  // ✅ Include thêm Subject
                .Include(e => e.PracticeTestQuestions)
                    .ThenInclude(q => q.PracticeQuestion)
                        .ThenInclude(pq => pq.PracticeAnswer) // ✅ Nếu cần lấy AnswerContent
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
                Questions = examPaper.PracticeTestQuestions.Select(q => new LPracticeExamQuestionDetailDTO
                {
                    QuestionOrder = q.QuestionOrder,
                    Content = q.PracticeQuestion.Content,
                    AnswerContent = q.PracticeQuestion.PracticeAnswer?.AnswerContent,
                    Score = q.Score
                }).ToList()
            };

            return examPaperDetail;
        }


        public async Task<MultipleExamResponseDTO> ViewMultiFinalExamDetail(int examId)
        {
            var multiExam = await _context.MultiExams
                .Include(e => e.Subject)                          
                .Include(e => e.Semester)                        
                .Include(e => e.Teacher)                         
                    .ThenInclude(t => t.User)                   
                .Include(e => e.NoQuestionInChapters)           
                .Include(e => e.FinalExams)                       
                    .ThenInclude(fe => fe.MultiQuestion)          
                .FirstOrDefaultAsync(e => e.MultiExamId == examId);

            if (multiExam == null)
            {
                throw new Exception("Multiple exam not found.");
            }

            var response = new MultipleExamResponseDTO
            {
                MultiExamId = multiExam.MultiExamId,
                MultiExamName = multiExam.MultiExamName,
                SubjectName = multiExam.Subject.SubjectName,
                SemesterName = multiExam.Semester.SemesterName,
                TeacherId = multiExam.TeacherId,
                TeacherName = multiExam.Teacher.User.Fullname,
                NoQuestionInChapterDTO = multiExam.NoQuestionInChapters.Select(nq => new NoQuestionInChapterDTO
                {
                    ChapterId = nq.ChapterId,
                    LevelQuestionId = nq.LevelQuestionId,
                    NumberQuestion = nq.NumberQuestion
                }).ToList(),
            };

            return response;
        }


        public async Task<PracticeExamResponeDTO> ViewPracFinalExamDetail(int examId)
        {
            var pracExam = await _context.PracticeExams
                .Include(e => e.Subject)                           // ✅ Include Subject
                .Include(e => e.Semester)                          // ✅ Include Semester
                .Include(e => e.Teacher)                           // ✅ Include Teacher
                    .ThenInclude(t => t.User)                      // ✅ Include Teacher.User
                .Include(e => e.NoPEPaperInPEs)
                    .ThenInclude(p => p.PracticeExamPaper)         // ✅ Include PracticeExamPaper
                .FirstOrDefaultAsync(e => e.PracExamId == examId);

            if (pracExam == null)
            {
                throw new Exception("Practice exam not found.");
            }

            var response = new PracticeExamResponeDTO
            {
                ExamId = pracExam.PracExamId,
                PracExamName = pracExam.PracExamName,
                SubjectId = pracExam.SubjectId,
                SubjectName = pracExam.Subject.SubjectName,
                SemesterId = pracExam.SemesterId,
                SemesterName = pracExam.Semester.SemesterName,
                TeacherId = pracExam.TeacherId,
                TeacherName = pracExam.Teacher.User.Fullname,
                PracticeExamPaperDTO = pracExam.NoPEPaperInPEs.Select(p => new PracticeExamPaperDTO
                {
                    PracExamPaperId = p.PracticeExamPaper.PracExamPaperId,
                    PracExamPaperName = p.PracticeExamPaper.PracExamPaperName
                }).ToList()
            };

            return response;
        }

    }
}
