using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.SemestersDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.semesters
{
    public class SemestersService : BaseService<Semester>, ISemestersService
    {
        private readonly IUnitOfWork _unitOfWork;
        public SemestersService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // Lấy danh sách học kỳ hiên tại
        public async Task<IEnumerable<SemesterResponse>> GetCurrentSemestersAsync()
        {
            var currentDate = DateTime.UtcNow;

            var semesters = await _unitOfWork.SemesterRepository.GetAllAsync(s =>
                s.StartDate <= currentDate && s.EndDate >= currentDate
            );

            return semesters.Select(s => new SemesterResponse
            {
                SemesterId = s.SemesterId,
                SemesterName = s.SemesterName
            });
        }




    }

}
