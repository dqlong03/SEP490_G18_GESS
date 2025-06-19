using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.MultiExamHistories;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.TrainingProgram;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class PracticeExamRepository : BaseRepository<PracticeExam>, IPracticeExamRepository
    {
        private readonly GessDbContext _context;
        public PracticeExamRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<PracticeExam> CreatePracticeExamAsync(PracticeExamCreateDTO practiceExamCreateDto)
        {
            var practiceExam = new PracticeExam
            {
                PracExamName = practiceExamCreateDto.PracExamName,
                Duration = practiceExamCreateDto.Duration,
                TeacherId = practiceExamCreateDto.TeacherId,
                SubjectId = practiceExamCreateDto.SubjectId,
                CreateAt = practiceExamCreateDto.CreateAt,
                CategoryExamId = practiceExamCreateDto.CategoryExamId,
                SemesterId = practiceExamCreateDto.SemesterId
            };
            try
            {
                await _context.PracticeExams.AddAsync(practiceExam);
                await _context.SaveChangesAsync();
                foreach (var paper in practiceExamCreateDto.PracticeExamPaperDTO)
                {
                    var noPEPaperInPE = new NoPEPaperInPE
                    {
                        PracExamId = practiceExam.PracExamId,
                        PracExamPaperId = paper.PracExamPaperId,
                       
                    };
                    await _context.NoPEPaperInPEs.AddAsync(noPEPaperInPE);
                }
                foreach (var student in practiceExamCreateDto.StudentDTO)
                {
                    var practiceExamHistory = new PracticeExamHistory
                    {
                        PracExamId = practiceExam.PracExamId,
                        StudentId = student.StudentId,
                        CheckIn= false,
                        IsGraded = false
                    };
                    await _context.PracticeExamHistories.AddAsync(practiceExamHistory);
                }
                await _context.SaveChangesAsync();
                return practiceExam;
            }
            catch (Exception ex)
            {
               return null; // or handle the exception as needed
            }
        }
    }
    
    
}
