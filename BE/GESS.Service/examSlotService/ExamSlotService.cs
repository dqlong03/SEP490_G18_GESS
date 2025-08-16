using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlot;
using GESS.Model.ExamSlotCreateDTO;
using GESS.Model.Major;
using GESS.Model.RoomDTO;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examSlotService
{
    public class ExamSlotService : BaseService<ExamSlot>, IExamSlotService
    {
        private readonly IUnitOfWork _unitOfWork;
        public ExamSlotService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> AddExamToExamSlot(int examSlotId, int examId, string examType)
        {
            return await _unitOfWork.ExamSlotRepository.AddExamToExamSlotAsync(examSlotId, examId, examType);
        }

        public async Task<string> AddGradeTeacherToExamSlot(ExamSlotRoomListGrade gradeTeacherRequest)
        {
            var result = await _unitOfWork.ExamSlotRepository.AddGradeTeacherToExamSlotAsync(gradeTeacherRequest);
            return result;
        }

        public async  Task<string> AddTeacherToExamSlotRoom(ExamSlotRoomList examSlotRoomList)
        {
            var result = await _unitOfWork.ExamSlotRepository.AddTeacherToExamSlotRoomAsync(examSlotRoomList);
            return result;
        }

        public async Task<bool> ChangeStatusExamSlot(int examSlotId, string examType)
        {
            var examSlot = await _unitOfWork.ExamSlotRepository.ChangeStatusExamSlot(examSlotId, examType);
            return examSlot;
        }

        public async Task<IEnumerable<TeacherCreationFinalRequest>> CheckTeacherExist(List<ExistTeacherDTO> teachers)
        {
            var teacherIds = await _unitOfWork.ExamSlotRepository.CheckTeacherExistAsync(teachers);
            if (teacherIds == null || !teacherIds.Any())
            {
                return new List<TeacherCreationFinalRequest>();
            }
            return teacherIds;
        }

        public async Task<int> CountPageExamSlots(ExamSlotFilterRequest filterRequest, int pageSize)
        {
            var pageCount = await _unitOfWork.ExamSlotRepository.CountPageExamSlotsAsync(filterRequest, pageSize);
            return pageCount;
        }

        public async Task<IEnumerable<ExamDTO>> GetAllExams(int semesterId, int subjectId, string examType, int year)
        {
            var exams = await _unitOfWork.ExamSlotRepository.GetAllExamsAsync(semesterId, subjectId, examType, year);
            if (exams == null || !exams.Any())
            {
                return new List<ExamDTO>();
            }
            return exams;
        }

        public async Task<IEnumerable<ExamSlotDTO>> GetAllExamSlotsAsync()
        {
            var examSlots = await _unitOfWork.BaseRepository<ExamSlot>().GetAllAsync();
            if (examSlots == null || !examSlots.Any())
            {
                return new List<ExamSlotDTO>();
            }
            var examSlotDtos = examSlots.Select(slot => new ExamSlotDTO
            {
                ExamSlotId = slot.ExamSlotId,
                StartTime = slot.StartTime,
                EndTime = slot.EndTime,
                SlotName = slot.SlotName
            });
            return examSlotDtos;
        }

        public async Task<IEnumerable<ExamSlotResponse>> GetAllExamSlotsPagination(ExamSlotFilterRequest filterRequest, int pageSize, int pageIndex)
        {
            var examSlots = await _unitOfWork.ExamSlotRepository.GetAllExamSlotsPaginationAsync(filterRequest, pageSize, pageIndex);
            if (examSlots == null || !examSlots.Any())
            {
                return new List<ExamSlotResponse>();
            }
            return examSlots;
        }

        public async Task<IEnumerable<GradeTeacherResponse>> GetAllGradeTeacher(int majorId, int subjectId)
        {
            var gradeTeachers = await _unitOfWork.ExamSlotRepository.GetAllGradeTeacherAsync(majorId, subjectId);
            if (gradeTeachers == null || !gradeTeachers.Any())
            {
                return new List<GradeTeacherResponse>();
            }
            return gradeTeachers;
        }

        public async Task<IEnumerable<MajorDTODDL>> GetAllMajor()
        {
            var majors = await _unitOfWork.BaseRepository<Major>().GetAllAsync();
            if (majors == null || !majors.Any())
            {
                return new List<MajorDTODDL>();
            }
            var majorDtos = majors.Select(major => new MajorDTODDL
            {
                MajorId = major.MajorId,
                MajorName = major.MajorName
            });
            return majorDtos;
        }

        public async Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync()
        {
            var rooms = await _unitOfWork.ExamSlotRepository.GetAllRoomsAsync();
            if (rooms == null || !rooms.Any())
            {
                return new List<RoomListDTO>();
            }
            return rooms;
        }

        public async Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorId(int majorId)
        {
            var subjects = await _unitOfWork.ExamSlotRepository.GetAllSubjectsByMajorIdAsync(majorId);
            if (subjects == null || !subjects.Any())
            {
                return new List<SubjectDTODDL>();
            }
            return subjects;
        }

        public async Task<ExamSlotDetail> GetExamSlotById(int examSlotId)
        {
            var examSlot = await _unitOfWork.ExamSlotRepository.GetExamSlotByIdAsync(examSlotId);
            if (examSlot == null)
            {
                return null;
            }
            return examSlot;
        }

        public bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd)
        {
            return _unitOfWork.ExamSlotRepository.IsRoomAvailable(roomId, slotStart, slotEnd);
        }

        public async Task<ExamSlotCheck> IsTeacherAvailable(ExamSlotCheck examSlotCheck)
        {
            var result = await _unitOfWork.ExamSlotRepository.IsTeacherAvailableAsync(examSlotCheck);
            if (result == null)
            {
                return new ExamSlotCheck();
            }
            return result;
        }

        public async Task<bool> SaveExamSlotsAsync(List<GeneratedExamSlot> examSlots)
        {
            return await _unitOfWork.ExamSlotRepository.SaveExamSlotsAsync(examSlots);
        }
    }
}
