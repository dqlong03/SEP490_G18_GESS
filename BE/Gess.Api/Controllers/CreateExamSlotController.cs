using DocumentFormat.OpenXml.Wordprocessing;
using GESS.Model.ExamSlotCreateDTO;
using GESS.Model.MultipleExam;
using GESS.Model.PracticeExam;
using GESS.Model.RoomDTO;
using GESS.Model.Student;
using GESS.Model.Teacher;
using GESS.Service.assignGradeCreateExam;
using GESS.Service.examSlotService;
using GESS.Service.finalPracExam;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using static GESS.Model.PracticeExam.PracticeExamCreateDTO;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreateExamSlotController : ControllerBase
    {
        private readonly IExamSlotService _examSlotService;
        public CreateExamSlotController(IExamSlotService examSlotService)
        {
            _examSlotService = examSlotService;

        }
        //API to gte all major 
        [HttpGet("GetAllMajor")]
        public async Task<IActionResult> GetAllMajor()
        {
            var result = await _examSlotService.GetAllMajor();
            if (result == null)
            {
                return NotFound("No majors found.");
            }
            return Ok(result);
        }
        //API to get all subjects by major id
        [HttpGet("GetAllSubjectsByMajorId/{majorId}")]
        public async Task<IActionResult> GetAllSubjectsByMajorId(int majorId)
        {
            var subjects = await _examSlotService.GetAllSubjectsByMajorId(majorId);
            if (subjects == null)
            {
                return NotFound("No majors found.");
            }
            return Ok(subjects);

        }
        //API to get all  rooms available
        [HttpGet("GetAllRooms")]
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await _examSlotService.GetAllRoomsAsync();
            if (rooms == null || !rooms.Any())
            {
                return NotFound("No rooms found.");
            }
            return Ok(rooms);
        }
        //API to get all grade teacher by major id and subject id
        [HttpGet("GetAllGradeTeacher/{majorId}/{subjectId}")]
        public async Task<IActionResult> GetAllGradeTeacher(int majorId, int subjectId)
        {
            var result = await _examSlotService.GetAllGradeTeacher(majorId, subjectId);
            if (result == null || !result.Any())
            {
                return NotFound("No grade teachers found.");
            }
            return Ok(result);
        }
        //API to check exist list teacher in system and create new teacher if not exist
        [HttpGet("CheckTeacherExist")]
        public async Task<IActionResult> CheckTeacherExist([FromQuery] List<ExistTeacherDTO> teachers)
        {
            if (teachers == null || !teachers.Any())
            {
                return BadRequest("No teachers provided.");
            }
            var existingTeachers = await _examSlotService.CheckTeacherExist(teachers);
            if (existingTeachers.Any())
            {
                return NotFound("No existing teachers found.");
            }

            return Ok(existingTeachers);
        }
        [HttpPost("SaveExamSlot")]
        public async Task<IActionResult> SaveExamSlot([FromBody] List<GeneratedExamSlot> examSlots)
        {
            if (examSlots == null || !examSlots.Any())
            {
                return BadRequest("No exam slots provided.");
            }
            var result = await _examSlotService.SaveExamSlotsAsync(examSlots);
            if (result)
            {
                return Ok("Exam slots saved successfully.");
            }
            else
            {
                return StatusCode(500, "An error occurred while saving exam slots.");
            }
        }

        [HttpPost("CalculateExamSlot")]
        public async Task<IActionResult> CalculateExamSlot([FromBody] ExamSlotCreateDTO examSlotCreateDTO)
        {
            if (examSlotCreateDTO.students == null || !examSlotCreateDTO.students.Any())
                return BadRequest("No students provided.");
            if (examSlotCreateDTO.rooms == null || !examSlotCreateDTO.rooms.Any())
                return BadRequest("No rooms provided.");

            List<GeneratedExamSlot> examSlots = null;

            if (examSlotCreateDTO.OptimizedBySlotExam)
            {
                examSlots = OptimizeBySlot(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByRoom)
            {
                examSlots = OptimizeByRoom(examSlotCreateDTO);
            }
            else
            {
                return BadRequest("No optimization method selected.");
            }

            if (examSlots != null && !examSlots.Any())
            {
                return NotFound("No exam slots generated.");
            }
            return Ok(examSlots);
        }
        //API to save exam slot
        private List<GeneratedExamSlot> OptimizeBySlot(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);

            // Chuẩn hoá mốc thời gian trong ngày
            var startDateLocal = dto.StartDate.ToLocalTime().Date;
            var startTod = dto.StartTimeInDay.ToLocalTime().TimeOfDay;
            var endTod = dto.EndTimeInDay.ToLocalTime().TimeOfDay;

            // Bảo vệ cấu hình: giờ kết thúc phải > giờ bắt đầu
            if (endTod <= startTod)
                throw new ArgumentException("EndTimeInDay must be after StartTimeInDay.");

            DateTime currentDay = startDateLocal;
            DateTime slotStartTime = currentDay.Add(startTod);
            DateTime slotEndTimeInDay = currentDay.Add(endTod);

            int slotCounter = 1;

            while (remainingStudents.Any())
            {
                // Nếu start đã quá giờ kết thúc trong ngày -> sang ngày mới
                if (slotStartTime >= slotEndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    slotStartTime = currentDay.Add(startTod);
                    slotEndTimeInDay = currentDay.Add(endTod);
                }

                // EndTime = StartTime + Duration (KHÔNG cộng RelaxationTime)
                DateTime slotEndTime = slotStartTime.AddMinutes(dto.Duration);

                // Nếu ca này sẽ tràn qua giờ kết thúc trong ngày -> sang ngày mới và thử lại
                // Dùng '>' để cho phép kết thúc ĐÚNG vào giờ kết thúc ngày.
                if (slotEndTime > slotEndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    slotStartTime = currentDay.Add(startTod);
                    slotEndTimeInDay = currentDay.Add(endTod);
                    continue; // quan trọng: bỏ vòng này, sang ngày mới rồi tính lại
                }

                // Tìm phòng trống cho khoảng [slotStartTime, slotEndTime)
                var availableRooms = dto.rooms
                    .Where(r => IsRoomAvailable(r, slotStartTime, slotEndTime))
                    .ToList();

                if (!availableRooms.Any())
                {
                    // Không có phòng: nhảy sang cửa sổ kế (Duration + RelaxationTime)
                    slotStartTime = slotStartTime.AddMinutes(dto.Duration + dto.RelaxationTime);
                    continue;
                }

                var roomExamSlots = new List<RoomExamSlot>();

                foreach (var room in availableRooms)
                {
                    if (!remainingStudents.Any()) break;

                    var studentsInRoom = new List<StudentAddDto>();
                    for (int i = 0; i < room.Capacity && remainingStudents.Any(); i++)
                        studentsInRoom.Add(remainingStudents.Dequeue());

                    if (studentsInRoom.Count > 0)
                    {
                        roomExamSlots.Add(new RoomExamSlot
                        {
                            RoomId = room.RoomId,
                            Students = studentsInRoom
                        });
                    }
                }

                if (roomExamSlots.Count == 0)
                {
                    // Không ai được xếp (ví dụ capacity = 0) -> nhảy cửa sổ kế
                    slotStartTime = slotStartTime.AddMinutes(dto.Duration + dto.RelaxationTime);
                    continue;
                }

                // Tạo slot thi hợp lệ
                result.Add(new GeneratedExamSlot
                {
                    SubjectId = dto.subjectId,
                    Status = "Chưa gán bài thi",
                    MultiOrPractice = dto.ExamType == 1 ? "Multiple" : "Practice",
                    SlotName = $"Ca {slotCounter++}:" + $" {dto.slotName}",
                    SemesterId = dto.semesterId,
                    Date = currentDay,
                    StartTime = slotStartTime,
                    EndTime = slotEndTime,
                    Rooms = roomExamSlots
                });

                // Nhảy sang slot kế tiếp: end + Relaxation
                slotStartTime = slotEndTime.AddMinutes(dto.RelaxationTime);
            }

            return result;
        }

        private bool IsRoomAvailable(RoomListDTO room, DateTime slotStart, DateTime slotEnd)
        {
            return _examSlotService.IsRoomAvailable(room.RoomId, slotStart, slotEnd);
        }
        private List<GeneratedExamSlot> OptimizeByRoom(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);

            int slotCounter = 1;
            DateTime currentDay = dto.StartDate.ToLocalTime().Date;

            // Sắp xếp phòng theo capacity giảm dần
            var sortedRooms = dto.rooms.OrderByDescending(r => r.Capacity).ToList();

            while (remainingStudents.Any())
            {
                bool assignedInThisDay = false; // Check xem có xếp được sinh viên trong ngày này không

                // Lặp qua từng phòng
                foreach (var room in sortedRooms)
                {
                    // Lặp qua tất cả slot trong ngày
                    DateTime slotStartTime = currentDay.Add(dto.StartTimeInDay.ToLocalTime().TimeOfDay);
                    DateTime slotEndTimeInDay = currentDay.Add(dto.EndTimeInDay.ToLocalTime().TimeOfDay);

                    while (slotStartTime < slotEndTimeInDay && remainingStudents.Any())
                    {
                        // EndTime chỉ tính theo Duration
                        DateTime slotEndTime = slotStartTime.AddMinutes(dto.Duration);

                        // Nếu EndTime vượt quá giới hạn trong ngày thì break
                        if (slotEndTime > slotEndTimeInDay)
                            break;

                        // Kiểm tra phòng trống ở slot này
                        if (!IsRoomAvailable(room, slotStartTime, slotEndTime))
                        {
                            // sang slot kế tiếp: EndTime + Relaxation
                            slotStartTime = slotStartTime.AddMinutes(dto.Duration + dto.RelaxationTime);
                            continue;
                        }

                        // Nhét sinh viên vào phòng
                        var studentsInRoom = new List<StudentAddDto>();
                        for (int i = 0; i < room.Capacity && remainingStudents.Any(); i++)
                        {
                            studentsInRoom.Add(remainingStudents.Dequeue());
                        }

                        // Tạo slot thi cho phòng này
                        result.Add(new GeneratedExamSlot
                        {
                            SubjectId = dto.subjectId,
                            Status = "Chưa gán bài thi",
                            MultiOrPractice = dto.ExamType == 1 ? "Multiple" : "Practice",
                            SlotName = $"Ca {slotCounter++}:" + $" { dto.slotName}",
                            SemesterId = dto.semesterId,
                            Date = currentDay,
                            StartTime = slotStartTime,
                            EndTime = slotEndTime,
                            Rooms = new List<RoomExamSlot>
                    {
                        new RoomExamSlot
                        {
                            RoomId = room.RoomId,
                            Students = studentsInRoom
                        }
                    }
                        });

                        assignedInThisDay = true;

                        // Sang slot tiếp theo: EndTime + RelaxationTime
                        slotStartTime = slotEndTime.AddMinutes(dto.RelaxationTime);
                    }
                }

                // Sang ngày tiếp theo
                currentDay = currentDay.AddDays(1);
            }

            return result;
        }


    }

}
