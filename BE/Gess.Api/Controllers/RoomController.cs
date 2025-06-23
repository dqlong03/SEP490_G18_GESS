using GESS.Common.HandleException;
using GESS.Model.RoomDTO;
using GESS.Service.room;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        // 🔹 GET: api/Room
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomListDTO>>> GetAllRooms(string? name,
    string? status,
    int pageNumber = 1,
    int pageSize = 10)
        {
            try
            {
                var rooms = await _roomService.GetAllRoomsAsync(name, status, pageNumber, pageSize);
                return Ok(rooms);
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi khi lấy danh sách phòng: {ex.Message}");
            }
        }
        [HttpGet("CountPage")]
        public IActionResult CountRooms(string? name, string? status, int pageSize = 10)
        {
            var totalPages = _roomService.CountRooms(name, status, pageSize);
            return Ok(totalPages);
        }
        // 🔹 GET: api/Room/{id}
        [HttpGet("{roomId}")]
        public async Task<ActionResult<RoomListDTO>> GetRoomById(int roomId)
        {
            try
            {
                var room = await _roomService.GetRoomByIdAsync(roomId);
                if (room == null)
                    return NotFound("Không tìm thấy phòng.");

                return Ok(room);
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi khi lấy thông tin phòng: {ex.Message}");
            }
        }

        // 🔹 POST: api/Room
        [HttpPost]
        public async Task<ActionResult> CreateRoom([FromBody] CreateRoomDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );
                    throw new ValidationException("Dữ liệu đầu vào không hợp lệ.", errors);
                }
                await _roomService.CreateRoomAsync(dto);

                //return CreatedAtAction(nameof(GetRoomById), new { id = createdRoom.RoomId }, createdRoom);
                return Ok("Tạo phòng thành công");
            }
            catch (ArgumentException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Lỗi khi tạo phòng: {ex.Message}");
            }
        }

        // 🔹 PUT: api/Room/{id}
        //[HttpPut("{id}")]
        //public async Task<ActionResult> UpdateRoom(int id, [FromBody] UpdateRoomDTO dto)
        //{
        //    try
        //    {
        //        await _roomService.UpdateRoomAsync(id, dto);
        //        return NoContent();
        //    }
        //    catch (KeyNotFoundException)
        //    {
        //        return NotFound("Không tìm thấy phòng cần cập nhật.");
        //    }
        //    catch (ArgumentException ex)
        //    {
        //        return Conflict(ex.Message);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"Lỗi khi cập nhật phòng: {ex.Message}");
        //    }
        //}

    }
}
