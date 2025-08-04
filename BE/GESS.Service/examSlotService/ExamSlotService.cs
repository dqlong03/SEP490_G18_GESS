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

        public async Task<IEnumerable<TeacherCreationFinalRequest>> CheckTeacherExist(List<ExistTeacherDTO> teachers)
        {
            var teacherIds = await _unitOfWork.ExamSlotRepository.CheckTeacherExistAsync(teachers);
            if (teacherIds == null || !teacherIds.Any())
            {
                return new List<TeacherCreationFinalRequest>();
            }
            return teacherIds;
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

        public bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd)
        {
            return _unitOfWork.ExamSlotRepository.IsRoomAvailable(roomId, slotStart, slotEnd);
        }

        public async Task<bool> SaveExamSlotsAsync(List<GeneratedExamSlot> examSlots)
        {
            return await _unitOfWork.ExamSlotRepository.SaveExamSlotsAsync(examSlots);
        }
    }
}
