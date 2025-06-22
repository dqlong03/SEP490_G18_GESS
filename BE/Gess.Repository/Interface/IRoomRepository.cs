using GESS.Entity.Entities;
using GESS.Model.RoomDTO;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Repository.Interface
{
    public interface IRoomRepository
    {
        Task<IEnumerable<Room>> GetAllRoomAsync(string? name, string? status, int pageNumber, int pageSize);
        Task<int> CountRooms(string? name, string? status, int pageSize);
        
        Task<Room> GetByIdAsync(int id);
        Task AddAsync(Room room);
        Task UpdateAsync(Room room);
        Task DeleteAsync(Room room);
        Task<bool> ExistsAsync(int id);
        Task<Room?> GetByNameAsync(string roomName);
    }
}
