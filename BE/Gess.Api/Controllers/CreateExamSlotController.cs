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

            List<GeneratedExamSlot> examSlots = null;

            if (examSlotCreateDTO.OptimizedBySlotExam)
            {
                examSlots = OptimizeBySlot(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByRoom && examSlotCreateDTO.OptimizedByTeacher)
            {
                examSlots = OptimizeByRoomAndTeacher(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByRoom)
            {
                examSlots = OptimizeByRoom(examSlotCreateDTO);
            }
            else if (examSlotCreateDTO.OptimizedByTeacher)
            {
                examSlots = OptimizeByTeacher(examSlotCreateDTO);
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
        private List<GeneratedExamSlot> OptimizeBySlot(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);

            int slotDuration = dto.Duration + dto.RelaxationTime;
            var currentDay = dto.StartDate;
            var currentTime = dto.StartTimeInday;

            var usedTeacherSlotMap = new Dictionary<Guid, List<(DateTime Start, DateTime End)>>();
            var teacherLoadMap = new Dictionary<Guid, int>();
            var graderQueue = new Queue<GradeTeacherResponse>(dto.gradeTeachers);

            while (remainingStudents.Any())
            {
                if (currentTime.AddMinutes(dto.Duration) > dto.EndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    currentTime = dto.StartTimeInday;
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

        private List<GeneratedExamSlot> OptimizeByRoom(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);
            int slotDuration = dto.Duration + dto.RelaxationTime;

            // Tạo các slot mẫu trong ngày (dựa trên StartTime/EndTime trong dto)
            var dailySlotTemplates = new List<TimeSpan>(); // chỉ lưu offset từ đầu ngày (TimeOfDay)
            var cursorTime = dto.StartTimeInday;
            while (cursorTime.AddMinutes(dto.Duration) <= dto.EndTimeInDay)
            {
                dailySlotTemplates.Add(cursorTime.TimeOfDay);
                cursorTime = cursorTime.AddMinutes(slotDuration);
            }

            // Tính score cho phòng: capacity * số slot trong ngày mà phòng rảnh
            var roomPriority = dto.rooms
                .Select(r =>
                {
                    int availableCount = dailySlotTemplates.Count(to =>
                    {
                        var slotStart = dto.StartDate.Date + to;
                        var slotEnd = slotStart.AddMinutes(dto.Duration);
                        return IsRoomAvailable(r, slotStart, slotEnd);
                    });
                    return new
                    {
                        Room = r,
                        Score = availableCount * r.Capacity,
                        AvailableSlots = availableCount
                    };
                })
                .Where(x => x.AvailableSlots > 0)
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.Room.Capacity)
                .Select(x => x.Room)
                .ToList();

            var usedRooms = new HashSet<int>();

            // Proctor tracking
            var usedTeacherSlotMap = new Dictionary<Guid, List<(DateTime Start, DateTime End)>>();
            var teacherLoadMap = new Dictionary<Guid, int>();
            var graderQueue = new Queue<GradeTeacherResponse>(dto.gradeTeachers);

            var currentDay = dto.StartDate;
            DateTime currentTime = dto.StartTimeInday;

            while (remainingStudents.Any())
            {
                // Nếu slot vượt quá trong ngày thì qua ngày sau
                if (currentTime.AddMinutes(dto.Duration) > dto.EndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    currentTime = dto.StartTimeInday;
                    continue;
                }

                var slotStart = currentDay.Date + currentTime.TimeOfDay;
                var slotEnd = slotStart.AddMinutes(dto.Duration);

                // Build list phòng khả dụng trong slot: ưu tiên phòng đã dùng trước, rồi đến phòng mới theo thứ tự priority
                var availableUsedFirst = roomPriority
                    .Where(r => IsRoomAvailable(r, slotStart, slotEnd))
                    .OrderByDescending(r => usedRooms.Contains(r.RoomId)) // true trước
                    .ThenByDescending(r => r.Capacity)
                    .ToList();

                if (!availableUsedFirst.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Số sinh viên cần xếp trong slot này: tối đa là còn lại, nhưng chọn sao cho dùng ít phòng nhất
                int studentsToAssign = Math.Min(remainingStudents.Count, availableUsedFirst.Sum(r => r.Capacity));

                // Chọn tập phòng ít nhất để bao phủ studentsToAssign (greedy theo thứ tự: đã dùng trước > priority)
                var selectedRooms = new List<RoomListDTO>();
                int accumulatedCap = 0;
                foreach (var room in availableUsedFirst)
                {
                    selectedRooms.Add(room);
                    accumulatedCap += room.Capacity;
                    if (accumulatedCap >= studentsToAssign)
                        break;
                }

                if (!selectedRooms.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Phân sinh viên vào các phòng đã chọn
                var roomAssignments = new List<RoomExamSlot>();
                foreach (var room in selectedRooms)
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
                        usedRooms.Add(room.RoomId); // đánh dấu đã dùng
                    }
                }

                if (!roomAssignments.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Gán giảng viên coi thi (số needed = số phòng đang dùng), cân bằng tải
                var proctors = GetBalancedProctors(dto.teachers, roomAssignments.Count, slotStart, slotEnd, usedTeacherSlotMap, teacherLoadMap);
                // Gán giảng viên chấm thi
                var graders = AssignGradersToRooms(roomAssignments, graderQueue);

                result.Add(new GeneratedExamSlot
                {
                    Date = slotStart.Date,
                    StartTime = slotStart,
                    EndTime = slotEnd,
                    Rooms = roomAssignments,
                    Proctors = proctors,
                    Graders = graders
                });

                // Đẩy thời gian sang slot tiếp theo
                currentTime = currentTime.AddMinutes(slotDuration);
            }

            return result;
        }

        private List<GeneratedExamSlot> OptimizeByTeacher(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);

            int slotDuration = dto.Duration + dto.RelaxationTime;
            var currentDay = dto.StartDate;
            var currentTime = dto.StartTimeInday;

            // Duy trì map thời gian đã dùng của proctor để tránh trùng ca
            var usedTeacherSlotMap = new Dictionary<Guid, List<(DateTime Start, DateTime End)>>();

            // Tập proctor đã được “khai mở” (distinct) để dùng lại nếu có thể
            var activeProctors = new List<TeacherCreationFinalRequest>(); // những người đã đưa vào sử dụng
            var remainingProctorsPool = new Queue<TeacherCreationFinalRequest>(dto.teachers); // nguồn còn lại

            var graderQueue = new Queue<GradeTeacherResponse>(dto.gradeTeachers);

            while (remainingStudents.Any())
            {
                if (currentTime.AddMinutes(dto.Duration) > dto.EndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    currentTime = dto.StartTimeInday;
                    continue;
                }

                var slotStart = currentDay + currentTime.TimeOfDay;
                var slotEnd = slotStart.AddMinutes(dto.Duration);

                // Các phòng rảnh trong slot
                var availableRooms = dto.rooms
                    .Where(r => IsRoomAvailable(r, slotStart, slotEnd))
                    .OrderByDescending(r => r.Capacity)
                    .ToList();

                if (!availableRooms.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Phân sinh viên như thường: nhồi vào các phòng rảnh theo capacity
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

                if (!roomAssignments.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Cần bao nhiêu proctor = số phòng đang dùng
                int neededProctors = roomAssignments.Count;
                var proctors = new List<TeacherAssignment>();

                // Trước hết cố gắng dùng lại activeProctors hiện tại
                foreach (var t in activeProctors.ToList()) // ToList vì có thể thêm mới sau
                {
                    if (proctors.Count >= neededProctors) break;

                    if (!IsTeacherBusy(t.TeacherId, slotStart, slotEnd, usedTeacherSlotMap))
                    {
                        proctors.Add(new TeacherAssignment
                        {
                            TeacherId = t.TeacherId,
                            FullName = t.Fullname
                        });

                        if (!usedTeacherSlotMap.ContainsKey(t.TeacherId))
                            usedTeacherSlotMap[t.TeacherId] = new();
                        usedTeacherSlotMap[t.TeacherId].Add((slotStart, slotEnd));
                    }
                }

                // Nếu chưa đủ, mở thêm từ pool mới (mới tăng distinct proctors chỉ khi cần)
                while (proctors.Count < neededProctors && remainingProctorsPool.Any())
                {
                    var next = remainingProctorsPool.Dequeue();
                    activeProctors.Add(next);

                    if (!IsTeacherBusy(next.TeacherId, slotStart, slotEnd, usedTeacherSlotMap))
                    {
                        proctors.Add(new TeacherAssignment
                        {
                            TeacherId = next.TeacherId,
                            FullName = next.Fullname
                        });

                        if (!usedTeacherSlotMap.ContainsKey(next.TeacherId))
                            usedTeacherSlotMap[next.TeacherId] = new();
                        usedTeacherSlotMap[next.TeacherId].Add((slotStart, slotEnd));
                    }
                    else
                    {
                        // nếu bất ngờ mới được thêm mà lại bận (hiếm), giữ trong active nhưng không gán
                    }
                }

                // Gán graders xoay vòng
                var graders = AssignGradersToRooms(roomAssignments, graderQueue);

                result.Add(new GeneratedExamSlot
                {
                    Date = slotStart.Date,
                    StartTime = slotStart,
                    EndTime = slotEnd,
                    Rooms = roomAssignments,
                    Proctors = proctors,
                    Graders = graders
                });

                currentTime = currentTime.AddMinutes(slotDuration);
            }

            return result;
        }


        private List<GeneratedExamSlot> OptimizeByRoomAndTeacher(ExamSlotCreateDTO dto)
        {
            var result = new List<GeneratedExamSlot>();
            var remainingStudents = new Queue<StudentAddDto>(dto.students);
            int slotDuration = dto.Duration + dto.RelaxationTime;

            // Tính các slot trong ngày (dưới dạng offset TimeOfDay)
            var dailySlotTemplates = new List<TimeSpan>();
            var cursorTime = dto.StartTimeInday;
            while (cursorTime.AddMinutes(dto.Duration) <= dto.EndTimeInDay)
            {
                dailySlotTemplates.Add(cursorTime.TimeOfDay);
                cursorTime = cursorTime.AddMinutes(slotDuration);
            }

            // Tính ưu tiên phòng: capacity * số slot rảnh trong ngày
            var roomPriority = dto.rooms
                .Select(r =>
                {
                    int availableCount = dailySlotTemplates.Count(to =>
                    {
                        var slotStart = dto.StartDate.Date + to;
                        var slotEnd = slotStart.AddMinutes(dto.Duration);
                        return IsRoomAvailable(r, slotStart, slotEnd);
                    });
                    return new
                    {
                        Room = r,
                        Score = availableCount * r.Capacity,
                        AvailableSlots = availableCount
                    };
                })
                .Where(x => x.AvailableSlots > 0)
                .OrderByDescending(x => x.Score)
                .ThenByDescending(x => x.Room.Capacity)
                .Select(x => x.Room)
                .ToList();

            // Dùng để ưu tiên tái sử dụng room (giảm distinct)
            var usedRooms = new HashSet<int>();

            // Proctor tracking: tối ưu distinct proctor
            var usedTeacherSlotMap = new Dictionary<Guid, List<(DateTime Start, DateTime End)>>();
            var activeProctors = new List<TeacherCreationFinalRequest>();
            var remainingProctorsPool = new Queue<TeacherCreationFinalRequest>(dto.teachers);

            var graderQueue = new Queue<GradeTeacherResponse>(dto.gradeTeachers);

            var currentDay = dto.StartDate;
            DateTime currentTime = dto.StartTimeInday;

            while (remainingStudents.Any())
            {
                if (currentTime.AddMinutes(dto.Duration) > dto.EndTimeInDay)
                {
                    currentDay = currentDay.AddDays(1);
                    currentTime = dto.StartTimeInday;
                    continue;
                }

                var slotStart = currentDay.Date + currentTime.TimeOfDay;
                var slotEnd = slotStart.AddMinutes(dto.Duration);

                // Lấy phòng khả dụng theo thứ tự: đã dùng trước rồi đến ưu tiên
                var availableRoomsThisSlot = roomPriority
                    .Where(r => IsRoomAvailable(r, slotStart, slotEnd))
                    .OrderByDescending(r => usedRooms.Contains(r.RoomId)) 
                    .ThenByDescending(r => r.Capacity)
                    .ToList();

                if (!availableRoomsThisSlot.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Số sinh viên cần xếp ca này: tối đa là còn lại, giới hạn bởi tổng capacity phòng khả dụng
                int studentsToAssign = Math.Min(remainingStudents.Count, availableRoomsThisSlot.Sum(r => r.Capacity));

                // Chọn tập phòng ít nhất để bao phủ studentsToAssign (greedy theo ordering)
                var selectedRooms = new List<RoomListDTO>();
                int accumulatedCap = 0;
                foreach (var room in availableRoomsThisSlot)
                {
                    selectedRooms.Add(room);
                    accumulatedCap += room.Capacity;
                    if (accumulatedCap >= studentsToAssign)
                        break;
                }

                if (!selectedRooms.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Phân sinh viên vào các phòng đã chọn
                var roomAssignments = new List<RoomExamSlot>();
                foreach (var room in selectedRooms)
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
                        usedRooms.Add(room.RoomId);
                    }
                }

                if (!roomAssignments.Any())
                {
                    currentTime = currentTime.AddMinutes(slotDuration);
                    continue;
                }

                // Gán giảng viên coi thi: cần số bằng số phòng dùng, tối ưu distinct (tái dùng active trước)
                int neededProctors = roomAssignments.Count;
                var proctors = new List<TeacherAssignment>();

                // Dùng lại activeProctors nếu khả dụng
                foreach (var t in activeProctors.ToList())
                {
                    if (proctors.Count >= neededProctors) break;

                    if (!IsTeacherBusy(t.TeacherId, slotStart, slotEnd, usedTeacherSlotMap))
                    {
                        proctors.Add(new TeacherAssignment
                        {
                            TeacherId = t.TeacherId,
                            FullName = t.Fullname
                        });

                        if (!usedTeacherSlotMap.ContainsKey(t.TeacherId))
                            usedTeacherSlotMap[t.TeacherId] = new();
                        usedTeacherSlotMap[t.TeacherId].Add((slotStart, slotEnd));
                    }
                }

                // Mở rộng tập proctor chỉ khi cần
                while (proctors.Count < neededProctors && remainingProctorsPool.Any())
                {
                    var next = remainingProctorsPool.Dequeue();
                    activeProctors.Add(next);

                    if (!IsTeacherBusy(next.TeacherId, slotStart, slotEnd, usedTeacherSlotMap))
                    {
                        proctors.Add(new TeacherAssignment
                        {
                            TeacherId = next.TeacherId,
                            FullName = next.Fullname
                        });

                        if (!usedTeacherSlotMap.ContainsKey(next.TeacherId))
                            usedTeacherSlotMap[next.TeacherId] = new();
                        usedTeacherSlotMap[next.TeacherId].Add((slotStart, slotEnd));
                    }
                }

                // Gán giám khảo (grader) xoay vòng
                var graders = AssignGradersToRooms(roomAssignments, graderQueue);

                result.Add(new GeneratedExamSlot
                {
                    Date = slotStart.Date,
                    StartTime = slotStart,
                    EndTime = slotEnd,
                    Rooms = roomAssignments,
                    Proctors = proctors,
                    Graders = graders
                });

                currentTime = currentTime.AddMinutes(slotDuration);
            }

            return result;
        }


    }

}
