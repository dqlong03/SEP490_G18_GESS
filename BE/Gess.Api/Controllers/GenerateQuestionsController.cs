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
    public class GenerateQuestionsController : ControllerBase
    {
        private readonly string _apiKey;

        public GenerateQuestionsController(IOptions<APIKeyOptions> apiKeyOptions)
        {
            _apiKey = apiKeyOptions.Value.Key;
        }

        [HttpPost("GenerateMultipleQuestion")]
        public async Task<IActionResult> PostGenerate([FromBody] QuestionRequest request)
        {
            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Hãy tạo các câu hỏi trắc nghiệm môn {request.SubjectName} từ tài liệu dưới đây:");
            promptBuilder.AppendLine(materialContent);
            promptBuilder.AppendLine("Yêu cầu:");
            foreach (var level in request.Levels)
            {
                promptBuilder.AppendLine($"- {level.NumberOfQuestions} câu hỏi mức độ {level.Difficulty}");
            }
            promptBuilder.AppendLine(@"
Mỗi câu hỏi phải có định dạng JSON như sau:
{
  ""Content"": ""Nội dung câu hỏi?"",
  ""Answers"": [
    { ""Text"": ""Đáp án A"", ""IsTrue"": false },
    { ""Text"": ""Đáp án B"", ""IsTrue"": true },
    { ""Text"": ""Đáp án C"", ""IsTrue"": false },
    { ""Text"": ""Đáp án D"", ""IsTrue"": false }
  ]
}
Trả về toàn bộ danh sách câu hỏi là 1 mảng JSON hợp lệ.
");

            string prompt = promptBuilder.ToString();

            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var body = new
                {
                    model = "gpt-4o-mini",
                    messages = new[] {
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
                    // Loại bỏ markdown code block nếu có
                    var cleanedOutput = output.Trim();

                    // Nếu có markdown code block
                    if (cleanedOutput.Contains("```"))
                    {
                        // Lấy phần nằm giữa hai dấu ```
                        var codeBlocks = Regex.Matches(cleanedOutput, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
                        if (codeBlocks.Count > 0)
                        {
                            cleanedOutput = codeBlocks[0].Groups[1].Value.Trim();
                        }
                    }

                    var questions = JsonConvert.DeserializeObject<List<GeneratedQuestion>>(cleanedOutput);
                    return Ok(questions);
                }
                catch (Exception ex)
                {
                    return BadRequest("Lỗi phân tích kết quả: " + ex.Message + "\nOutput:\n" + output);
                }
            }
        }

        [HttpPost("GenerateEssayQuestion")]
        public async Task<IActionResult> GenerateEssay([FromBody] PracQuestionRequest request)
        {
            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            // Xây dựng prompt cho AI sinh câu hỏi tự luận
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Hãy tạo các câu hỏi tự luận môn {request.SubjectName} dựa trên tài liệu sau:");
            promptBuilder.AppendLine(materialContent);
            promptBuilder.AppendLine("Yêu cầu:");
            foreach (var level in request.Levels)
            {
                promptBuilder.AppendLine($"- {level.NumberOfQuestions} câu hỏi mức độ {level.Difficulty}");
            }
            promptBuilder.AppendLine(@" 
                Mỗi câu hỏi phải có định dạng JSON như sau:
                {
                  ""Content"": ""Nội dung câu hỏi?"",
                  ""BandScoreGuide"": ""Hướng dẫn chấm điểm chi tiết (band điểm)""
                }
                Trả về toàn bộ danh sách câu hỏi là 1 mảng JSON hợp lệ.
                ");

            string prompt = promptBuilder.ToString();

            using (var httpClient = new HttpClient())
            {
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
                    var essayQuestions = JsonConvert.DeserializeObject<List<EssayQuestionResult>>(output);
                    return Ok(essayQuestions);
                }
                catch (Exception ex)
                {
                    return BadRequest("Lỗi phân tích kết quả trả về: " + ex.Message + "\nOutput:\n" + output);
                }
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
