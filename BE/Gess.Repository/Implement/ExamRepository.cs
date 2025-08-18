using Gess.Repository.Infrastructures;
using GESS.Common;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.Exam;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Implement
{
    public class ExamRepository : IExamRepository
    {
        private readonly GessDbContext _context;
        public ExamRepository(GessDbContext context)
        {
            _context = context;
        }

        public async Task<(List<ExamListResponse> Data, int TotalCount)> GetTeacherExamsAsync(
            Guid teacherId,
            int pageNumber,
            int pageSize,
            int? majorId,
            int? semesterId,
            int? subjectId,
            // string? gradeComponent,
            string? examType,
            string? searchName)
        {
            var multipleExamsQuery = _context.MultiExams
                .Where(e => e.TeacherId == teacherId)
                .Where(e => !majorId.HasValue || e.Teacher.MajorId == majorId)
                .Where(e => !semesterId.HasValue || e.SemesterId == semesterId)
                .Where(e => !subjectId.HasValue || e.SubjectId == subjectId)
                // .Where(e => string.IsNullOrEmpty(gradeComponent) || e.GradeComponent == gradeComponent)
                .Where(e => string.IsNullOrEmpty(searchName) || e.MultiExamName.Contains(searchName))
                .Select(e => new ExamListResponse
                {
                    ExamId = e.MultiExamId,
                    SemesterName = e.Semester.SemesterName,
                    ExamName = e.MultiExamName,
                    ExamType = e.CategoryExam.CategoryExamName,
                    //StatusExam = e.MultiExamHistories.Any(),
                    StatusExam = e.Status,
                    CreateDate = e.CreateAt
                });

            var practiceExamsQuery = _context.PracticeExams
                .Where(e => e.TeacherId == teacherId)
                .Where(e => !majorId.HasValue || e.Teacher.MajorId == majorId)
                .Where(e => !semesterId.HasValue || e.SemesterId == semesterId)
                .Where(e => !subjectId.HasValue || e.SubjectId == subjectId)
                .Where(e => string.IsNullOrEmpty(searchName) || e.PracExamName.Contains(searchName))
                .Select(e => new ExamListResponse
                {
                    ExamId = e.PracExamId,
                    SemesterName = e.Semester.SemesterName,
                    ExamName = e.PracExamName,
                    ExamType = e.CategoryExam.CategoryExamName,
                    //StatusExam = e.PracticeExamHistories.Any(),
                    StatusExam = e.Status,
                    CreateDate = e.CreateAt
                });

            var allExamsQuery = multipleExamsQuery.Concat(practiceExamsQuery);

            if (!string.IsNullOrEmpty(examType))
            {
                allExamsQuery = allExamsQuery.Where(e => e.ExamType == examType);
            }

            var totalCount = await allExamsQuery.CountAsync();
            var data = await allExamsQuery
                .OrderByDescending(e => e.CreateDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (data, totalCount);
        }

        public async Task<bool> UpdatePracticeExamAsync(PracticeExamUpdateDTO dto)
        {
            var exam = await _context.PracticeExams.FirstOrDefaultAsync(e => e.PracExamId == dto.PracExamId);
            if (exam == null || exam.Status.ToLower().Trim() != PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()) // chỉ cho sửa khi chưa thi
                return false;

            exam.PracExamName = dto.PracExamName;
            exam.Duration = dto.Duration;
            exam.CreateAt = dto.CreateAt;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.SemesterId = dto.SemesterId;
            // Cập nhật các trường khác nếu cần

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMultiExamAsync(MultiExamUpdateDTO dto)
        {
            var exam = await _context.MultiExams.FirstOrDefaultAsync(e => e.MultiExamId == dto.MultiExamId);
            if (exam == null || exam.Status.ToLower() != "chưa thi") // chỉ cho sửa khi chưa thi
                return false;

            exam.MultiExamName = dto.MultiExamName;
            exam.NumberQuestion = dto.NumberQuestion;
            exam.Duration = dto.Duration;
            exam.CreateAt = dto.CreateAt;
            exam.CategoryExamId = dto.CategoryExamId;
            exam.SubjectId = dto.SubjectId;
            exam.SemesterId = dto.SemesterId;
            // Cập nhật các trường khác nếu cần

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ExamListOfStudentResponse>> GetAllMultiExamOfStudentAsync(ExamFilterRequest request)
        {
            if (request.StudentId == Guid.Empty)
                return new List<ExamListOfStudentResponse>();

            // Lấy danh sách MultiExamHistory PENDING_EXAM
            var multiExamHistories = await _context.MultiExamHistories
                .Where(meh => meh.StudentId == request.StudentId)
                .Include(meh => meh.MultiExam)
                    .ThenInclude(me => me.CategoryExam)
                .Include(meh => meh.MultiExam)
                    .ThenInclude(me => me.Semester)
                .Include(meh => meh.MultiExam)
                    .ThenInclude(me => me.Subject)
                .Include(meh => meh.ExamSlotRoom)
                    .ThenInclude(esr => esr.ExamSlot)
                .Include(meh => meh.ExamSlotRoom)
                    .ThenInclude(esr => esr.Room)
                .Where(meh => meh.StatusExam.ToLower().Trim()
                             == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim()|| meh.StatusExam.ToLower().Trim()
                             == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
                .ToListAsync();

            var result = new List<ExamListOfStudentResponse>();

            foreach (var meh in multiExamHistories)
            {
                if (meh.ExamSlotRoom == null)
                {
                    // kiểm tra trạng thái từ MultiExam
                    bool isOpen = string.Equals(
                        meh.MultiExam?.Status?.Trim(),
                        "Đang mở ca",
                        StringComparison.OrdinalIgnoreCase
                    );

                    if (isOpen)
                    {
                        result.Add(new ExamListOfStudentResponse
                        {
                            ExamId = meh.MultiExamId,
                            ExamName = meh.MultiExam?.MultiExamName,
                            SubjectName = meh.MultiExam?.Subject?.SubjectName,
                            CategoryExamName = meh.MultiExam?.CategoryExam?.CategoryExamName,
                            Status = meh.StatusExam,
                            Duration = meh.MultiExam?.Duration ?? 0,
                            // Format ngày rõ ràng hơn, tránh null
                            ExamDate = (meh.MultiExam?.StartDay?.ToString("dd/MM/yyyy") ?? "")
                                        + " - " +
                                       (meh.MultiExam?.EndDay?.ToString("dd/MM/yyyy") ?? "")
                        });
                    }
                }
                else
                {
                    // kiểm tra trạng thái từ ExamSlotRoom
                    if (meh.ExamSlotRoom.Status == 1)
                    {
                        result.Add(new ExamListOfStudentResponse
                        {
                            ExamId = meh.MultiExamId,
                            ExamName = meh.MultiExam?.MultiExamName,
                            ExamSlotName = meh.ExamSlotRoom.ExamSlot?.SlotName,
                            SubjectName = meh.MultiExam?.Subject?.SubjectName,
                            CategoryExamName = meh.MultiExam?.CategoryExam?.CategoryExamName,
                            Status = meh.StatusExam,
                            RoomName = meh.ExamSlotRoom.Room?.RoomName,
                            ExamDate = meh.ExamSlotRoom.ExamDate.ToString("dd/MM/yyyy"),
                            Duration = meh.MultiExam?.Duration ?? 0,
                            StartTime = meh.ExamSlotRoom.ExamSlot.StartTime,
                            EndTime = meh.ExamSlotRoom.ExamSlot.EndTime
                        });
                    }
                }
            }

            return result;
        }



        public async Task<List<ExamListOfStudentResponse>> GetAllPracExamOfStudentAsync(ExamFilterRequest request)
        {
            if (request.StudentId == Guid.Empty)
                return new List<ExamListOfStudentResponse>();

            // Lấy danh sách PracExamHistory PENDING_EXAM
            var pracExamHistories = await _context.PracticeExamHistories
                .Where(peh => peh.StudentId == request.StudentId)
                .Include(peh => peh.PracticeExam)
                    .ThenInclude(pe => pe.CategoryExam)
                .Include(peh => peh.PracticeExam)
                    .ThenInclude(pe => pe.Semester)
                .Include(peh => peh.PracticeExam)
                    .ThenInclude(pe => pe.Subject)
                .Include(peh => peh.ExamSlotRoom)
                    .ThenInclude(esr => esr.ExamSlot)
                .Include(peh => peh.ExamSlotRoom)
                    .ThenInclude(esr => esr.Room)
                .Where(meh => meh.StatusExam.ToLower().Trim()
                             == PredefinedStatusExamInHistoryOfStudent.PENDING_EXAM.ToLower().Trim() || meh.StatusExam.ToLower().Trim()
                             == PredefinedStatusExamInHistoryOfStudent.IN_PROGRESS_EXAM.ToLower().Trim())
                .ToListAsync();

            var result = new List<ExamListOfStudentResponse>();

            foreach (var peh in pracExamHistories)
            {
                if (peh.ExamSlotRoom == null)
                {
                    // kiểm tra trạng thái từ PracExam
                    bool isOpen = string.Equals(
                        peh.PracticeExam?.Status?.Trim(),
                        "Đang mở ca",
                        StringComparison.OrdinalIgnoreCase
                    );

                    if (isOpen)
                    {
                        result.Add(new ExamListOfStudentResponse
                        {
                            ExamId = peh.PracExamId,
                            ExamName = peh.PracticeExam?.PracExamName,
                            SubjectName = peh.PracticeExam?.Subject?.SubjectName,
                            CategoryExamName = peh.PracticeExam?.CategoryExam?.CategoryExamName,
                            Status = peh.StatusExam,
                            Duration = peh.PracticeExam?.Duration ?? 0,
                            ExamDate = (peh.PracticeExam?.StartDay?.ToString("dd/MM/yyyy") ?? "")
                                        + " - " +
                                       (peh.PracticeExam?.EndDay?.ToString("dd/MM/yyyy") ?? "")
                        });
                    }
                }
                else
                {
                    // kiểm tra trạng thái từ ExamSlotRoom
                    if (peh.ExamSlotRoom.Status == 1)
                    {
                        result.Add(new ExamListOfStudentResponse
                        {
                            ExamId = peh.PracExamId,
                            ExamName = peh.PracticeExam?.PracExamName,
                            ExamSlotName = peh.ExamSlotRoom.ExamSlot?.SlotName,
                            SubjectName = peh.PracticeExam?.Subject?.SubjectName,
                            CategoryExamName = peh.PracticeExam?.CategoryExam?.CategoryExamName,
                            Status = peh.StatusExam,
                            RoomName = peh.ExamSlotRoom.Room?.RoomName,
                            ExamDate = peh.ExamSlotRoom.ExamDate.ToString("dd/MM/yyyy"),
                            Duration = peh.PracticeExam?.Duration ?? 0,
                            StartTime = peh.ExamSlotRoom.ExamSlot.StartTime,
                            EndTime = peh.ExamSlotRoom.ExamSlot.EndTime
                        });
                    }
                }
            }

            return result;
        }



        public async Task<ExamStatusCheckListResponseDTO> CheckExamStatusAsync(ExamStatusCheckRequestDTO request)
        {
            var result = new ExamStatusCheckListResponseDTO();

            // Kiểm tra MultiExam nếu ExamType = "Multi" hoặc null
            if (string.IsNullOrEmpty(request.ExamType) || request.ExamType.Equals("Multi", StringComparison.OrdinalIgnoreCase))
            {
                var multiExams = await _context.MultiExams
                    .Include(m => m.CategoryExam)
                    .Where(m => request.ExamIds.Contains(m.MultiExamId))
                    .ToListAsync();

                foreach (var exam in multiExams)
                {
                    string status = "";
                    
                    // Kiểm tra nếu là bài thi cuối kỳ
                    if (exam.CategoryExam?.CategoryExamName == PredefinedCategoryExam.Final_EXAM_CATEGORY)
                    {
                        // Bài thi cuối kỳ - check status từ ExamSlotRoom
                        var examSlotRoom = await _context.ExamSlotRooms
                            .Where(esr => esr.MultiExamId == exam.MultiExamId)
                            .FirstOrDefaultAsync();
                        
                        if (examSlotRoom != null)
                        {
                            status = GetExamSlotRoomStatusText(examSlotRoom.Status);
                        }
                        else
                        {
                            status = "Chưa có ca thi";
                        }
                    }
                    else
                    {
                        // Bài thi giữa kỳ - check status từ MultiExam
                        status = exam.Status ?? "";
                    }
                    
                    result.Exams.Add(new ExamStatusCheckResponseDTO
                    {
                        ExamId = exam.MultiExamId,
                        ExamName = exam.MultiExamName,
                        ExamType = "MultiExam",
                        Status = status
                    });
                }
            }

            // Kiểm tra PracticeExam nếu ExamType = "Practice" hoặc null
            if (string.IsNullOrEmpty(request.ExamType) || request.ExamType.Equals("Practice", StringComparison.OrdinalIgnoreCase))
            {
                var practiceExams = await _context.PracticeExams
                    .Include(p => p.CategoryExam)
                    .Where(p => request.ExamIds.Contains(p.PracExamId))
                    .ToListAsync();

                foreach (var exam in practiceExams)
                {
                    string status = "";
                    
                    // Kiểm tra nếu là bài thi cuối kỳ
                    if (exam.CategoryExam?.CategoryExamName == PredefinedCategoryExam.Final_EXAM_CATEGORY)
                    {
                        // Bài thi cuối kỳ - check status từ ExamSlotRoom
                        var examSlotRoom = await _context.ExamSlotRooms
                            .Where(esr => esr.PracticeExamId == exam.PracExamId)
                            .FirstOrDefaultAsync();
                        
                        if (examSlotRoom != null)
                        {
                            status = GetExamSlotRoomStatusText(examSlotRoom.Status);
                        }
                        else
                        {
                            status = "Chưa có ca thi";
                        }
                    }
                    else
                    {
                        // Bài thi giữa kỳ - check status từ PracticeExam
                        status = exam.Status ?? "";
                    }
                    
                    result.Exams.Add(new ExamStatusCheckResponseDTO
                    {
                        ExamId = exam.PracExamId,
                        ExamName = exam.PracExamName,
                        ExamType = "PracticeExam",
                        Status = status
                    });
                }
            }

            return result;
        }

        /// <summary>
        /// Chuyển đổi status int của ExamSlotRoom sang text mô tả
        /// </summary>
        /// <param name="status">Status int từ ExamSlotRoom</param>
        /// <returns>Text mô tả trạng thái</returns>
        private static string GetExamSlotRoomStatusText(int status)
        {
            return status switch
            {
                0 => "Chưa mở ca",
                1 => "Đang mở ca", 
                2 => "Đã đóng ca",
                _ => "Không xác định"
            };
        }
    }
}
