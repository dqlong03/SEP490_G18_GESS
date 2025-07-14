using GESS.Model.MultipleQuestionDTO;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.levelquestion;
using GESS.Service.multipleQuestion;
using GESS.Service.semesters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenerateQuestionsController : ControllerBase
    {
        public GenerateQuestionsController()
        {
        }
        //API tao caau hoi trac nghiem bang AI
        [HttpPost("GenerateMultipleQuestion")]
        public async Task<IActionResult> PostGenerate(QuestionRequest request)
        {
            string apiKey = "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";

            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Tạo các câu hỏi trắc nghiệm môn {request.SubjectName} từ tài liệu sau:\n{request.Material}");

            foreach (var level in request.Levels)
            {
                promptBuilder.AppendLine($"- {level.NumberOfQuestions} câu hỏi mức độ {level.Difficulty}");
            }

            promptBuilder.AppendLine("Mỗi câu gồm: nội dung, 4 đáp án và đáp án đúng.");
            string prompt = promptBuilder.ToString();

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var body = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "user", content = prompt }
                    }
                };

                var json = JsonConvert.SerializeObject(body);
                var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                    new StringContent(json, Encoding.UTF8, "application/json"));

                var responseString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return BadRequest("Lỗi khi gọi OpenAI: " + responseString);
                }

                dynamic result = JsonConvert.DeserializeObject(responseString);
                string output = result.choices[0].message.content;

                return Ok(output);
            }
        }
    }
}
