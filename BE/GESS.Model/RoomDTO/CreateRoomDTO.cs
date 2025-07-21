using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.RoomDTO
{
    public class CreateRoomDTO
    {
        [Required(ErrorMessage = "Tên phòng không được để trống")]
        public string RoomName { get; set; }

        [Required(ErrorMessage = "Mô tả phòng học không được để trống")]
        public string Description { get; set; }

        public string Status { get; set; }

        [Required(ErrorMessage = "Số lượng người trong phòng không được trống")]
        public int Capacity { get; set; }
    }
}
