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
using static GESS.Model.NoQuestionInChapter.NoQuestionInChapterDTO;
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
            // 1. Validate MultiExamName
            if (string.IsNullOrWhiteSpace(multipleExamCreateDto.MultiExamName))
            {
                throw new Exception("Tên kỳ thi không được để trống!");
            }

            // 2. Validate NumberQuestion
            if (multipleExamCreateDto.NumberQuestion <= 0)
            {
                throw new Exception("Số lượng câu hỏi phải lớn hơn 0!");
            }

            // 3. Validate CreateAt
            if (multipleExamCreateDto.CreateAt == default(DateTime))
            {
                throw new Exception("Ngày tạo không được để trống!");
            }

            // 4. Validate TeacherId
            var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.TeacherId == multipleExamCreateDto.TeacherId);
            if (teacher == null)
            {
                throw new Exception("Giáo viên không tồn tại!");
            }

            // 5. Validate SubjectId
            var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.SubjectId == multipleExamCreateDto.SubjectId);
            if (subject == null)
            {
                throw new Exception("Môn học không tồn tại!");
            }

            // 6. Validate SemesterId
            var semester = await _context.Semesters.FirstOrDefaultAsync(s => s.SemesterId == multipleExamCreateDto.SemesterId);
            if (semester == null)
            {
                throw new Exception("Học kỳ không tồn tại!");
            }

            // 7. Validate NoQuestionInChapterDTO
            if (multipleExamCreateDto.NoQuestionInChapterDTO == null || !multipleExamCreateDto.NoQuestionInChapterDTO.Any())
            {
                throw new Exception("Danh sách câu hỏi theo chương không được để trống!");
            }

            // 8. Validate từng item trong NoQuestionInChapterDTO
            foreach (var noQuestion in multipleExamCreateDto.NoQuestionInChapterDTO)
            {
                // Validate NumberQuestion
                if (noQuestion.NumberQuestion <= 0)
                {
                    throw new Exception($"Số lượng câu hỏi trong chương {noQuestion.ChapterId} phải lớn hơn 0!");
                }

                // Validate ChapterId
                var chapter = await _context.Chapters.FirstOrDefaultAsync(c => c.ChapterId == noQuestion.ChapterId);
                if (chapter == null)
                {
                    throw new Exception($"Chương {noQuestion.ChapterId} không tồn tại!");
                }

                // Validate LevelQuestionId
                var levelQuestion = await _context.LevelQuestions.FirstOrDefaultAsync(l => l.LevelQuestionId == noQuestion.LevelQuestionId);
                if (levelQuestion == null)
                {
                    throw new Exception($"Cấp độ câu hỏi {noQuestion.LevelQuestionId} không tồn tại!");
                }

                // Validate số lượng câu hỏi có sẵn
                var availableQuestions = await _context.MultiQuestions
                    .Where(q => q.ChapterId == noQuestion.ChapterId && q.LevelQuestionId == noQuestion.LevelQuestionId)
                    .CountAsync();

                if (availableQuestions < noQuestion.NumberQuestion)
                {
                    throw new Exception($"Số lượng câu hỏi yêu cầu ({noQuestion.NumberQuestion}) vượt quá số lượng câu hỏi có sẵn ({availableQuestions}) trong chương {noQuestion.ChapterId} với cấp độ {noQuestion.LevelQuestionId}!");
                }
            }

            // 9. Validate tổng số câu hỏi
            var totalRequestedQuestions = multipleExamCreateDto.NoQuestionInChapterDTO.Sum(nq => nq.NumberQuestion);
            if (totalRequestedQuestions != multipleExamCreateDto.NumberQuestion)
            {
                throw new Exception($"Tổng số câu hỏi trong danh sách ({totalRequestedQuestions}) phải bằng số lượng câu hỏi của kỳ thi ({multipleExamCreateDto.NumberQuestion})!");
            }

            // 10. Validate trùng tên kỳ thi trong cùng học kỳ và năm
            var existingExamWithSameName = await _context.MultiExams
                .Where(e => e.MultiExamName == multipleExamCreateDto.MultiExamName 
                           && e.SemesterId == multipleExamCreateDto.SemesterId 
                           && e.CreateAt.Year == multipleExamCreateDto.CreateAt.Year
                           && e.CategoryExamId == 2) // Final exam
                .FirstOrDefaultAsync();

            if (existingExamWithSameName != null)
            {
                throw new Exception($"Đã tồn tại kỳ thi với tên '{multipleExamCreateDto.MultiExamName}' trong học kỳ này!");
            }

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
                Status = "Chưa mở ca"
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
                // 1. Validate PracExamName
                if (string.IsNullOrWhiteSpace(finalPracExamCreateDto.PracExamName))
                {
                    throw new Exception("Tên kỳ thi không được để trống!");
                }

                if (finalPracExamCreateDto.PracExamName.Length > 100)
                {
                    throw new Exception("Tên kỳ thi không được vượt quá 100 ký tự!");
                }

                // 2. Validate TeacherId
                var teacher = await _context.Teachers.FirstOrDefaultAsync(t => t.TeacherId == finalPracExamCreateDto.TeacherId);
                if (teacher == null)
                {
                    throw new Exception("Giáo viên không tồn tại!");
                }

                // 3. Validate SubjectId
                var subject = await _context.Subjects.FirstOrDefaultAsync(s => s.SubjectId == finalPracExamCreateDto.SubjectId);
                if (subject == null)
                {
                    throw new Exception("Môn học không tồn tại!");
                }

                // 4. Validate SemesterId
                var semester = await _context.Semesters.FirstOrDefaultAsync(s => s.SemesterId == finalPracExamCreateDto.SemesterId);
                if (semester == null)
                {
                    throw new Exception("Học kỳ không tồn tại!");
                }

                // 5. Validate PracticeExamPaperDTO
                if (finalPracExamCreateDto.PracticeExamPaperDTO == null || !finalPracExamCreateDto.PracticeExamPaperDTO.Any())
                {
                    throw new Exception("Danh sách đề thi không được để trống!");
                }

                // 6. Validate từng ExamPaperId
                foreach (var paper in finalPracExamCreateDto.PracticeExamPaperDTO)
                {
                    var examPaper = await _context.PracticeExamPapers
                        .FirstOrDefaultAsync(ep => ep.PracExamPaperId == paper.PracExamPaperId);
                    
                    if (examPaper == null)
                    {
                        throw new Exception($"Đề thi với ID {paper.PracExamPaperId} không tồn tại!");
                    }

                    // Kiểm tra xem đề thi có thuộc về môn học và học kỳ đã chọn không
                    if (examPaper.SubjectId != finalPracExamCreateDto.SubjectId)
                    {
                        throw new Exception($"Đề thi {paper.PracExamPaperId} không thuộc về môn học đã chọn!");
                    }

                    if (examPaper.SemesterId != finalPracExamCreateDto.SemesterId)
                    {
                        throw new Exception($"Đề thi {paper.PracExamPaperId} không thuộc về học kỳ đã chọn!");
                    }
                }

                // 7. Validate trùng tên kỳ thi trong cùng học kỳ và năm
                var existingPracExamWithSameName = await _context.PracticeExams
                    .Where(e => e.PracExamName == finalPracExamCreateDto.PracExamName 
                               && e.SemesterId == finalPracExamCreateDto.SemesterId 
                               && e.CreateAt.Year == DateTime.Now.Year
                               && e.CategoryExamId == 2) // Final exam
                    .FirstOrDefaultAsync();

                if (existingPracExamWithSameName != null)
                {
                    throw new Exception($"Đã tồn tại kỳ thi với tên '{finalPracExamCreateDto.PracExamName}' trong học kỳ này!");
                }

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
                    Status = "Chưa mở ca"
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
                throw; // Re-throw để service layer có thể xử lý
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
                CreateAt = examPaper.CreateAt,
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
                    NumberQuestion = nq.NumberQuestion,
                    ChapterName = _context.Chapters
                        .Where(c => c.ChapterId == nq.ChapterId)
                        .Select(c => c.ChapterName)
                        .FirstOrDefault(),
                    LevelName = _context.LevelQuestions
                        .Where(l => l.LevelQuestionId == nq.LevelQuestionId)
                        .Select(l => l.LevelQuestionName)
                        .FirstOrDefault()

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
