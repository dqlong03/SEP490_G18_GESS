using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.MultipleExam;
using GESS.Model.TrainingProgram;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IMultipleExamRepository : IBaseRepository<MultiExam>
    {
        Task <MultiExam>CreateMultipleExamAsync(MultipleExamCreateDTO multipleExamCreateDto);
    }
}
