using GESS.Common.HandleException;
using GESS.Entity.Entities;
using GESS.Model.RoomDTO;
using Gess.Repository.Infrastructures;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Service.room
{
    public class RoomService : BaseService<RoomService>, IRoomService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoomService(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task CreateRoomAsync(CreateRoomDTO dto)
        {
            var exists = await _unitOfWork.RoomRepository.GetByNameAsync(dto.RoomName);
            if (exists != null)
            {
                throw new ConflictException("Phòng học với tên này đã tồn tại.");
            }

            var room = new Room
            {
                RoomName = dto.RoomName,
                Description = dto.Description,
                Status = dto.Status,
                Capacity = dto.Capacity
            };

            try
            {
                await _unitOfWork.RoomRepository.AddAsync(room);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new DbUpdateException("Lỗi khi lưu dữ liệu: " + ex.InnerException?.Message ?? ex.Message);
            }
        }

        public async Task<int> CountRooms(string? name, string? status, int pageSize)
        {
            return await _unitOfWork.RoomRepository.CountRooms(name, status, pageSize);
        }


        public async Task<IEnumerable<RoomListDTO>> GetAllRoomsAsync(string? name, string? status, int pageNumber, int pageSize)
        {
            var rooms = await _unitOfWork.RoomRepository.GetAllRoomAsync(name, status, pageNumber, pageSize);
            return rooms.Select(r => new RoomListDTO
            {
                RoomId = r.RoomId,
                RoomName = r.RoomName,
                Description = r.Description,
                Status = r.Status,
                Capacity = r.Capacity
            });
        }

        public async Task<RoomListDTO?> GetRoomByIdAsync(int id)
        {
            var room = await _unitOfWork.RoomRepository.GetByIdAsync(id);
            if (room == null)
                throw new NotFoundException("Không tìm thấy phòng học.");

            return new RoomListDTO
            {
                RoomId = room.RoomId,
                RoomName = room.RoomName,
                Description = room.Description,
                Status = room.Status,
                Capacity = room.Capacity
            };
        }

        public async Task UpdateRoomAsync(int roomId, UpdateRoomDTO dto)
        {
            var room = await _unitOfWork.RoomRepository.GetByIdAsync(roomId);
            if (room == null)
                throw new NotFoundException("Phòng học không tồn tại.");

            room.RoomName = dto.RoomName;
            room.Description = dto.Description;
            room.Status = dto.Status;
            room.Capacity = dto.Capacity;

            try
            {
                await _unitOfWork.RoomRepository.UpdateAsync(room);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Lỗi khi cập nhật dữ liệu: " + ex.InnerException?.Message ?? ex.Message);
            }
        }

        public async Task DeleteRoomAsync(int id)
        {
            var room = await _unitOfWork.RoomRepository.GetByIdAsync(id);
            if (room == null)
                throw new NotFoundException("Phòng học không tồn tại.");

            try
            {
                await _unitOfWork.RoomRepository.DeleteAsync(room);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Lỗi khi xóa dữ liệu: " + ex.InnerException?.Message ?? ex.Message);
            }
        }
    }
}
