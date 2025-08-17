using GESS.Entity.Entities;
using GESS.Model.ExamSlot;
using GESS.Model.ExamSlotCreateDTO;
using GESS.Model.ExamSlotRoomDTO;
using GESS.Model.Major;
using GESS.Model.RoomDTO;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.examSlotService
{
    public interface IExamSlotService : IBaseService<ExamSlot>
    {
        Task<bool> AddExamToExamSlot(int examSlotId, int examId, string examType);
        Task<string> AddGradeTeacherToExamSlot(ExamSlotRoomListGrade gradeTeacherRequest);
        Task<string> AddTeacherToExamSlotRoom(ExamSlotRoomList examSlotRoomList);
        Task<bool> ChangeStatusExamSlot(int examSlotId, string examType);
        Task <IEnumerable<TeacherCreationFinalRequest>>CheckTeacherExist(List<ExistTeacherDTO> teachers);
        Task <int> CountPageExamSlots(ExamSlotFilterRequest filterRequest, int pageSize);
        Task<IEnumerable<ExamDTO>> GetAllExams(int semesterId, int subjectId, string examType, int year);
        Task<IEnumerable<ExamSlotDTO>> GetAllExamSlotsAsync();
        Task <IEnumerable<ExamSlotResponse>>GetAllExamSlotsPagination(ExamSlotFilterRequest filterRequest, int pageSize, int pageIndex);
        Task <IEnumerable<GradeTeacherResponse>>GetAllGradeTeacher(int majorId, int subjectId);
        Task<IEnumerable<MajorDTODDL>> GetAllMajor();
        Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync();
        Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorId(int majorId);
        Task <ExamSlotDetail> GetExamSlotById(int examSlotId);
        bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd);
        Task<ExamSlotCheck> IsTeacherAvailable(ExamSlotCheck examSlotCheck);
        Task<bool> SaveExamSlotsAsync(List<GeneratedExamSlot> examSlots);
    }
}
