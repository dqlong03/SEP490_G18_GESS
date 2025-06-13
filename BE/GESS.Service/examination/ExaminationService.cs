using GESS.Entity.Entities;
using Gess.Repository.Infrastructures;
using GESS.Model.Examination;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GESS.Common;

namespace GESS.Service.examination
{
    public class ExaminationService : IExaminationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;


        public ExaminationService(IUnitOfWork unitOfWork, UserManager<User> userManager,
            RoleManager<IdentityRole<Guid>> roleManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<ExaminationResponse> AddExaminationAsync(ExaminationCreationRequest request)
        {

            var defaultPassword = "Abc123@";
            // 1. Tạo user
            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                DateOfBirth = request.DateOfBirth,
                Fullname = request.Fullname,
                Gender = request.Gender,
                IsActive = request.IsActive
            };

            var result = await _userManager.CreateAsync(user, defaultPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            // 2. Đảm bảo role "Teacher" tồn tại
            if (!await _roleManager.RoleExistsAsync(PredefinedRole.EXAMINATION_ROLE))
            {
                await _roleManager.CreateAsync(new IdentityRole<Guid>(PredefinedRole.EXAMINATION_ROLE));
            }

            // 3. Gán role cho user
            await _userManager.AddToRoleAsync(user, PredefinedRole.EXAMINATION_ROLE);

            return await _unitOfWork.ExaminationRepository.AddExaminationAsync(user.Id, request);
        }

        public async Task<int> CountPageAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageSize)
        {
            var count = await _unitOfWork.ExaminationRepository.CountPageAsync(active, name, fromDate, toDate, pageSize);
            if (count <= 0)
            {
                throw new Exception("Không có dữ liệu để đếm trang.");
            }
            return count;
        }

        public async Task DeleteExaminationAsync(Guid examinationId)
        {
            await _unitOfWork.ExaminationRepository.DeleteExaminationAsync(examinationId);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<ExaminationResponse>> GetAllExaminationsAsync(bool? active, string? name, DateTime? fromDate, DateTime? toDate, int pageNumber, int pageSize)
        {
            //Code logic
            return await _unitOfWork.ExaminationRepository.GetAllExaminationsAsync(active, name, fromDate, toDate, pageNumber, pageSize);
        }

        public async Task<ExaminationResponse> GetExaminationByIdAsync(Guid examinationId)
        {
            var examination = await _unitOfWork.ExaminationRepository.GetExaminationByIdAsync(examinationId);
            if (examination == null) throw new Exception("Examination not found");
            return examination;
        }

        public async Task<List<ExaminationResponse>> ImportExaminationsFromExcelAsync(IFormFile file)
        {
            throw new NotImplementedException();
        }

        public async Task<List<ExaminationResponse>> SearchExaminationsAsync(string keyword)
        {
            return await _unitOfWork.ExaminationRepository.SearchExaminationsAsync(keyword);
        }

        public async Task<ExaminationResponse> UpdateExaminationAsync(Guid examinationId, ExaminationUpdateRequest request)
        {
            await _unitOfWork.ExaminationRepository.UpdateExaminationAsync(examinationId, request);
            await _unitOfWork.SaveChangesAsync();
            var examination = await _unitOfWork.ExaminationRepository.GetExaminationByIdAsync(examinationId);
            if (examination == null) throw new Exception("Examination not found");
            return examination;
        }
    }
}
