using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GESS.Model.RoomDTO
{
    public class UpdateRoomDTO
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        [StringLength(50)]
        public string RoomName { get; set; }

        [StringLength(200)]
        public string Description { get; set; }

        [StringLength(20)]
        public string Status { get; set; }

        [Required]
        public int Capacity { get; set; }
    }
}
