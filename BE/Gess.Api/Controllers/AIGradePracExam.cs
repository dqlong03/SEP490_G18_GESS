using GESS.Model.APIKey;
using GESS.Model.MultipleQuestionDTO;
using GESS.Model.PracticeQuestionDTO;
using GESS.Service.multipleQuestion;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;

namespace GESS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIGradePracExamController : ControllerBase
    {
        private readonly string _apiKey;

        public AIGradePracExamController(IOptions<APIKeyOptions> apiKeyOptions)
        {
            _apiKey = apiKeyOptions.Value.Key;
        }
        [HttpPost("GradeEssayAnswer")]
        public async Task<IActionResult> GradeEssayAnswer([FromBody] EssayGradingRequest request)
        {
            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine("Bạn là một giáo viên giỏi, hãy chấm điểm một câu trả lời tự luận như sau:");
            promptBuilder.AppendLine($"\n---\nNội dung tài liệu tham khảo:\n{materialContent}");
            promptBuilder.AppendLine($"\n---\nCâu hỏi:\n{request.QuestionContent}");
            promptBuilder.AppendLine($"\n---\nCâu trả lời của học sinh:\n{request.AnswerContent}");
            promptBuilder.AppendLine($"\n---\nHướng dẫn chấm điểm (band score):\n{request.BandScoreGuide}");
            promptBuilder.AppendLine($"\n---\nYêu cầu:");
            promptBuilder.AppendLine($"- Chấm điểm tối đa là {request.MaxScore} điểm.");
            promptBuilder.AppendLine("- Trả về kết quả theo đúng định dạng JSON:");
            promptBuilder.AppendLine(@"{
              ""Score"": (số điểm, dạng số),
              ""Explanation"": ""giải thích vì sao học sinh được điểm đó (có thể phân tích theo tiêu chí hoặc đánh giá tổng quan)""
            }");

            var prompt = promptBuilder.ToString();

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var body = new
            {
                model = "gpt-4o-mini",
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

            try
            {
                var gradeResult = JsonConvert.DeserializeObject<EssayGradingResult>(output);
                return Ok(gradeResult);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi phân tích kết quả: " + ex.Message + "\nOutput:\n" + output);
            }
        }
        private async Task<string> GetMaterialContentAsync(string link)
        {
            using var httpClient = new HttpClient();

            if (link.Contains("docs.google.com/document"))
            {
                var fileId = ExtractGoogleDocId(link);
                if (fileId != null)
                {
                    var exportUrl = $"https://docs.google.com/document/d/{fileId}/export?format=txt";
                    return await httpClient.GetStringAsync(exportUrl);
                }
            }
            else if (link.StartsWith("http"))
            {
                return await httpClient.GetStringAsync(link);
            }
            else if (System.IO.File.Exists(link))
            {
                return await System.IO.File.ReadAllTextAsync(link);
            }

            return null;
        }

        private string ExtractGoogleDocId(string url)
        {
            var match = Regex.Match(url, @"document/d/([a-zA-Z0-9-_]+)");
            return match.Success ? match.Groups[1].Value : null;
        }


    }
}
