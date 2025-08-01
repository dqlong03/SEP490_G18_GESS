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
        public IActionResult GetAllSubjectsByMajorId(int majorId)
        {
            var subjects = _examSlotService.GetAllSubjectsByMajorId(majorId);
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

        [HttpPost("CalculateExamSlot")]
        public async Task<IActionResult> CalculateExamSlot([FromBody] ExamSlotCreateDTO examSlotCreateDTO)
        {
            if (examSlotCreateDTO.students == null || !examSlotCreateDTO.students.Any())
                return BadRequest("No students provided.");
            if (examSlotCreateDTO.rooms == null || !examSlotCreateDTO.rooms.Any())
                return BadRequest("No rooms provided.");
            if (examSlotCreateDTO.teachers == null || !examSlotCreateDTO.teachers.Any())
                return BadRequest("No teachers provided.");
            if (examSlotCreateDTO.gradeTeachers == null || !examSlotCreateDTO.gradeTeachers.Any())
                return BadRequest("No grade teachers provided.");

            List<GeneratedExamSlot> examSlots =null;

            if (examSlotCreateDTO.OptimizedBySlotExam)
            {
                examSlots = OptimizeBySlot(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByRoom && examSlotCreateDTO.OptimizedByTeacher)
            {
               // examSlots = OptimizeByRoomAndTeacher(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByRoom)
            {
                //examSlots = OptimizeByRoom(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByTeacher)
            {
                //examSlots = OptimizeByTeacher(examSlotCreateDTO);
            }
            else
            {
                return BadRequest("No optimization method selected.");
            }

            if ( examSlots!= null && !examSlots.Any() )
            {
                return NotFound("No exam slots generated.");
            }
            return Ok(examSlots);
        }
        private List<GeneratedExamSlot> OptimizeBySlot(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);

            int slotDuration = dto.Duration + dto.RelaxationTime;
            var currentDay = dto.StartDate;
            var currentTime = dto.SrartTimeInday;

            var usedTeacherSlotMap = new Dictionary<Guid, List<(DateTime Start, DateTime End)>>();
            var teacherLoadMap = new Dictionary<Guid, int>();
            var graderQueue = new Queue<GradeTeacherResponse>(dto.gradeTeachers);

            while (remainingStudents.Any())
            {
                if (currentTime.AddMinutes(dto.Duration) > dto.EndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    currentTime = dto.SrartTimeInday;
                    continue;
                }

                var slotStart = currentDay + currentTime.TimeOfDay; 
                var slotEnd = slotStart.AddMinutes(dto.Duration);
                var availableRooms = dto.rooms
                    .Where(r => IsRoomAvailable(r, slotStart, slotEnd))
                    .OrderByDescending(r => r.Capacity)
                    .ToList();

                if (!availableRooms.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                var roomAssignments = new List<RoomExamSlot>();
                foreach (var room in availableRooms)
                {
                    var roomStudents = new List<StudentAddDto>();
                    for (int i = 0; i < room.Capacity && remainingStudents.Any(); i++)
                    {
                        roomStudents.Add(remainingStudents.Dequeue());
                    }

                    if (roomStudents.Any())
                    {
                        roomAssignments.Add(new RoomExamSlot
                        {
                            RoomId = room.RoomId,
                            Students = roomStudents
                        });
                    }
                }

                var proctors = GetBalancedProctors(dto.teachers, roomAssignments.Count, slotStart, slotEnd, usedTeacherSlotMap, teacherLoadMap);
                var graders = AssignGradersToRooms(roomAssignments, graderQueue);

                result.Add(new GeneratedExamSlot
                {
                    Date = currentDay,
                    StartTime = currentTime,
                    EndTime = currentTime.AddMinutes(dto.Duration),
                    Rooms = roomAssignments,
                    Proctors = proctors,
                    Graders = graders
                });

                currentTime = currentTime.AddMinutes(slotDuration);
            }

            return result;
        }

        private List<TeacherAssignment> GetBalancedProctors(List<TeacherCreationFinalRequest> teachers, int countNeeded,
     DateTime slotStart, DateTime slotEnd,
     Dictionary<Guid, List<(DateTime Start, DateTime End)>> usedMap,
     Dictionary<Guid, int> loadMap)
        {
            var sorted = teachers.OrderBy(t => loadMap.ContainsKey(t.TeacherId) ? loadMap[t.TeacherId] : 0).ToList();
            var result = new List<TeacherAssignment>();

            foreach (var t in sorted)
            {
                if (!IsTeacherBusy(t.TeacherId, slotStart, slotEnd, usedMap))
                {
                    result.Add(new TeacherAssignment
                    {
                        TeacherId = t.TeacherId,
                        FullName = t.Fullname
                    });

                    if (!usedMap.ContainsKey(t.TeacherId)) usedMap[t.TeacherId] = new();
                    usedMap[t.TeacherId].Add((slotStart, slotEnd));

                    if (!loadMap.ContainsKey(t.TeacherId)) loadMap[t.TeacherId] = 0;
                    loadMap[t.TeacherId]++;
                }

                if (result.Count == countNeeded) break;
            }

            return result;
        }


        private List<GraderAssignment> AssignGradersToRooms(List<RoomExamSlot> roomAssignments, Queue<GradeTeacherResponse> graderQueue)
        {
            var result = new List<GraderAssignment>();

            foreach (var room in roomAssignments)
            {
                if (!graderQueue.Any()) break;

                var grader = graderQueue.Dequeue();
                result.Add(new GraderAssignment
                {
                    RoomId = room.RoomId,
                    TeacherId = grader.TeacherId,
                    FullName = grader.FullName
                });
                graderQueue.Enqueue(grader);
            }

            return result;
        }

        private bool IsRoomAvailable(RoomListDTO room, DateTime slotStart, DateTime slotEnd)
        {
            return _examSlotService.IsRoomAvailable(room.RoomId, slotStart, slotEnd);
        }

        private bool IsTeacherBusy(Guid teacherId, DateTime slotStart, DateTime slotEnd,
            Dictionary<Guid, List<(DateTime Start, DateTime End)>> usedMap)
        {
            if (!usedMap.ContainsKey(teacherId)) return false;

            return usedMap[teacherId].Any(s => slotStart < s.End && slotEnd > s.Start);
        }

    }
}
