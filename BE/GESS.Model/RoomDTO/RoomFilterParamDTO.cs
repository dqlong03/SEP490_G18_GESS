using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.RoomDTO
{
    public class RoomFilterParamDTO
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        public string? RoomName { get; set; } // Tìm kiếm theo tên phòng
        public string? Status { get; set; } // Lọc theo trạng thái ("Available", "Occupied", etc.)
    }
}
