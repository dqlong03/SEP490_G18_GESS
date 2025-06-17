using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.Major;
using GESS.Model.MultipleExam;
using GESS.Model.Subject;
using GESS.Model.TrainingProgram;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GESS.Service.multipleExam
{
    public class MultipleExamService : BaseService<MultiExam>, IMultipleExamService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MultipleExamService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<MultipleExamCreateDTO> CreateMultipleExamAsync(MultipleExamCreateDTO multipleExamCreateDto)
        {
            var multipleExam = await _unitOfWork.MultipleExamRepository.CreateMultipleExamAsync(multipleExamCreateDto);
            if (multipleExam == null)
            {
                throw new Exception("Lỗi khi tạo bài kiểm tra trắc nghiệm.");
            }
            return multipleExamCreateDto;

        }
    }

}
