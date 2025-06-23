using GESS.Model.RoomDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.room
{
    public interface IRoomService
    {
        Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync(string? name,
    string? status,
    int pageNumber = 1,
    int pageSize = 10);
        Task<int> CountRooms(string? name, string? status, int pageSize = 10);
        Task<RoomListDTO?> GetRoomByIdAsync(int id);
        Task CreateRoomAsync(CreateRoomDTO dto);
        Task UpdateRoomAsync(int roomId, UpdateRoomDTO dto);
        Task DeleteRoomAsync(int id);
    }
}
