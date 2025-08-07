using Gess.Repository.Infrastructures;
using GESS.Entity.Entities;
using GESS.Model.ExamSlot;
using GESS.Model.ExamSlotCreateDTO;
using GESS.Model.RoomDTO;
using GESS.Model.Subject;
using GESS.Model.Teacher;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IExamSlotRepository
    {
        Task<bool> AddExamToExamSlotAsync(int examSlotId, int examId, string examType);
        Task<bool> ChangeStatusExamSlot(int examSlotId, string examType);
        Task<IEnumerable<TeacherCreationFinalRequest>> CheckTeacherExistAsync(List<ExistTeacherDTO> teachers);
        Task<int> CountPageExamSlotsAsync(ExamSlotFilterRequest filterRequest, int pageSize);
        Task<IEnumerable<ExamDTO>> GetAllExamsAsync(int semesterId, int subjectId, string examType, int year);
        Task<IEnumerable<ExamSlotResponse>> GetAllExamSlotsPaginationAsync(ExamSlotFilterRequest filterRequest, int pageSize, int pageIndex);
        Task<IEnumerable<GradeTeacherResponse>> GetAllGradeTeacherAsync(int majorId, int subjectId);
        Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync();
        Task<IEnumerable<SubjectDTODDL>> GetAllSubjectsByMajorIdAsync(int majorId);
        Task<ExamSlotDetail> GetExamSlotByIdAsync(int examSlotId);
        bool IsRoomAvailable(int roomId, DateTime slotStart, DateTime slotEnd);
        Task<bool> SaveExamSlotsAsync(List<GeneratedExamSlot> examSlots);
    }
}
