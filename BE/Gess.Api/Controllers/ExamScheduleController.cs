using GESS.Service.examSchedule;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExamScheduleController : ControllerBase
    {
        private readonly IExamScheduleService _examScheduleService;
        public ExamScheduleController(IExamScheduleService examScheduleService)
        {
            _examScheduleService = examScheduleService;
        }

    }
}