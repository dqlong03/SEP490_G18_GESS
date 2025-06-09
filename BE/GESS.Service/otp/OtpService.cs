using Gess.Repository.Infrastructures;
using GESS.Model.Email;
using GESS.Service.email;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.otp
{
    public class OtpService : IOtpService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly EmailService _emailService;
        private readonly IUnitOfWork _unitOfWork;
        public OtpService(IMemoryCache memoryCache, EmailService emailService, IUnitOfWork unitOfWork)
        {
            _memoryCache = memoryCache;
            _emailService = emailService;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> SendOtpAsync(string email)
        {
            if (string.IsNullOrEmpty(email)) return false;
            bool isEmailRegistered = await _unitOfWork.UserRepository.IsEmailRegisteredAsync(email);
            if (!isEmailRegistered)
            {
                Console.WriteLine($"Email {email} is not registered.");
                return false;
            }
            string otp = GenerateOtp();
            DateTime expiryTime = DateTime.UtcNow.AddMinutes(5);

            try
            {
                await _emailService.SendOtpEmailAsync(email, otp);
                _memoryCache.Set(email, new OtpDTO
                {
                    Email = email,
                    Otp = otp,
                    ExpiryTime = expiryTime
                }, TimeSpan.FromMinutes(5));
                Console.WriteLine($"OTP sent successfully to {email}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending OTP to {email}: {ex.Message}, StackTrace: {ex.StackTrace}");
                return false;
            }
        }

        public bool VerifyOtp(VerifyOtpDTO verifyOtpDTO)
        {
            if (verifyOtpDTO == null || string.IsNullOrEmpty(verifyOtpDTO.Email) || string.IsNullOrEmpty(verifyOtpDTO.Otp))
                return false;

            if (_memoryCache.TryGetValue(verifyOtpDTO.Email, out OtpDTO otpModel))
            {
                if (otpModel.ExpiryTime >= DateTime.UtcNow && otpModel.Otp == verifyOtpDTO.Otp)
                {
                    _memoryCache.Remove(verifyOtpDTO.Email); // Xóa OTP sau khi xác minh

                   
                    _memoryCache.Set("otp_verified_" + verifyOtpDTO.Email, true, TimeSpan.FromMinutes(2));

                    return true;
                }
            }

            return false;
        }



        private string GenerateOtp()
        {
            var rand = new Random();
            return rand.Next(100000, 999999).ToString(); // 6 chữ số
        }
    }
}
