using Gess.Repository.Infrastructures;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.RoomDTO;
using GESS.Repository.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

// ThaiNH_Create_ManageSemester&ManagageRoom
namespace GESS.Repository.Implement
{
    public class RoomRepository : BaseRepository<Room>, IRoomRepository
    {

        private readonly GessDbContext _context;
        public RoomRepository(GessDbContext context) : base(context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Room>> GetAllRoomAsync(string? name, string? status, int pageNumber, int pageSize)
        {
            var query = _context.Rooms.AsQueryable();

            // Lọc theo tên phòng nếu có
            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(r => r.RoomName.Contains(name));
            }

            // Lọc theo trạng thái nếu có
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status == status);
            }

            // Phân trang
            query = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            return await query.ToListAsync();
        }
        public async Task<int> CountRooms(string? name, string? status, int pageSize)
        {
            var query = _context.Rooms.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(r => r.RoomName.Contains(name));

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(r => r.Status == status);

            int total = query.Count();
            return (int)Math.Ceiling((double)total / pageSize);
        }

        public async Task<Room> GetByIdAsync(int id) =>
            await _context.Rooms.FindAsync(id);

        public async Task AddAsync(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Room room)
        {
            _context.Rooms.Update(room);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Room room)
        {
            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> ExistsAsync(int id) =>
            await _context.Rooms.AnyAsync(r => r.RoomId == id);

        public async Task<Room?> GetByNameAsync(string roomName)
        {
            return await _context.Rooms
                .FirstOrDefaultAsync(r => r.RoomName.ToLower() == roomName.ToLower());
        }
    }
}
