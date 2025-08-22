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
            if (string.IsNullOrWhiteSpace(request.SubjectName))
                return BadRequest("SubjectName không được để trống.");
            if (string.IsNullOrWhiteSpace(request.MaterialLink))
                return BadRequest("MaterialLink không được để trống.");
            if (request.Specifications == null || !request.Specifications.Any())
                return BadRequest("Phải cung cấp ít nhất một specification cho loại/độ khó câu hỏi.");

            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            // Nhóm specs theo từng kiểu mong muốn
            var typeOrder = new[] { "SelectOne", "MultipleChoice", "TrueFalse" };
            var specsByType = typeOrder.ToDictionary(
                t => t,
                t => request.Specifications.Where(s => IsSpecOfType(s?.Type, t)).ToList()
            );

            // BẮT BUỘC chỉ 1 loại được gửi trong request
            var typesWithSpecs = specsByType.Where(kv => kv.Value != null && kv.Value.Count > 0)
                                            .Select(kv => kv.Key).ToList();
            if (typesWithSpecs.Count == 0)
            {
                return BadRequest("Không có specification hợp lệ nào được cung cấp.");
            }
            if (typesWithSpecs.Count > 1)
            {
                return BadRequest("Chỉ được cung cấp đúng một kiểu câu hỏi trong một lần gọi API (ví dụ: chỉ SelectOne hoặc chỉ MultipleChoice hoặc chỉ TrueFalse).");
            }

            var chosenType = typesWithSpecs[0];
            var specsForThisType = specsByType[chosenType];
            var totalRequestedQuestions = specsForThisType.Sum(s => s.NumberOfQuestions);

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var allQuestions = new List<GeneratedQuestion>();

            // Xây prompt CHUYÊN BIỆT cho kiểu đã chọn
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Bạn là một chuyên gia tạo đề kiểm tra. Hãy tạo các câu hỏi kiểm tra môn {request.SubjectName} dựa trên tài liệu sau:");
            promptBuilder.AppendLine(materialContent);
            promptBuilder.AppendLine("\nYêu cầu chi tiết cho kiểu câu duy nhất:");
            foreach (var spec in specsForThisType)
            {
                promptBuilder.AppendLine($"- {spec.NumberOfQuestions} câu hỏi mức độ '{spec.Difficulty}', loại '{spec.Type}'");
            }

            if (chosenType.Equals("SelectOne", StringComparison.OrdinalIgnoreCase))
            {
                promptBuilder.AppendLine(@"
Định dạng đầu ra: một mảng JSON gồm các phần tử có cấu trúc sau (chỉ kiểu SelectOne, đúng 1 đáp án):
{
  ""Content"": ""Nội dung câu hỏi?"",
  ""Type"": ""SelectOne"",
  ""Answers"": [
    { ""Text"": ""Đáp án A"", ""IsTrue"": false },
    { ""Text"": ""Đáp án B"", ""IsTrue"": true },
    { ""Text"": ""Đáp án C"", ""IsTrue"": false },
    { ""Text"": ""Đáp án D"", ""IsTrue"": false }
  ]
}

Yêu cầu thêm:
- Chỉ tạo kiểu ""SelectOne"".
- Mỗi câu hỏi có đúng 1 đáp án ""IsTrue = true"".
- Số lượng câu hỏi và độ khó đúng theo Specifications.
- Trả về CHỈ JSON hợp lệ, không thêm lời bình. Nếu có code block ```json ...```, chỉ trả phần JSON bên trong.");
            }
            else if (chosenType.Equals("MultipleChoice", StringComparison.OrdinalIgnoreCase))
            {
                promptBuilder.AppendLine(@"
Định dạng đầu ra: một mảng JSON gồm các phần tử có cấu trúc sau (chỉ kiểu MultipleChoice, có thể nhiều đáp án đúng):
{
  ""Content"": ""Nội dung câu hỏi?"",
  ""Type"": ""MultipleChoice"",
  ""Answers"": [
    { ""Text"": ""A"", ""IsTrue"": true },
    { ""Text"": ""B"", ""IsTrue"": true },
    { ""Text"": ""C"", ""IsTrue"": false },
    { ""Text"": ""D"", ""IsTrue"": false }
  ]
}

Yêu cầu thêm:
- Chỉ tạo kiểu ""MultipleChoice"".
- Có thể có nhiều hơn một đáp án đúng (IsTrue = true).
- Số lượng câu hỏi và độ khó đúng theo Specifications.
- Trả về CHỈ JSON hợp lệ, không thêm lời bình. Nếu có code block ```json ...```, chỉ trả phần JSON bên trong.");
            }
            else // TrueFalse
            {
                promptBuilder.AppendLine(@"
Định dạng đầu ra: một mảng JSON gồm các phần tử có cấu trúc sau (chỉ kiểu TrueFalse):
{
  ""Content"": ""Câu hỏi True/False?"",
  ""Type"": ""TrueFalse"",
  ""Answers"": [
    { ""Text"": ""True"",  ""IsTrue"": false },
    { ""Text"": ""False"", ""IsTrue"": true }
  ]
}

Yêu cầu thêm:
- Chỉ tạo kiểu ""TrueFalse"".
- Luôn có đúng 2 đáp án: ""True"" và ""False"", và chỉ 1 đáp án có IsTrue = true.
- Số lượng câu hỏi và độ khó đúng theo Specifications.
- Trả về CHỈ JSON hợp lệ, không thêm lời bình. Nếu có code block ```json ...```, chỉ trả phần JSON bên trong.");
            }

            var prompt = promptBuilder.ToString();

            var body = new
            {
                model = "gpt-4o-mini",
                messages = new[]
                {
            new { role = "user", content = prompt }
        }
            };

            var jsonPayload = JsonConvert.SerializeObject(body);
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions",
                new StringContent(jsonPayload, Encoding.UTF8, "application/json"));

            var responseString = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                // Giữ nguyên hành vi fail-fast như cũ
                return BadRequest("Lỗi khi gọi OpenAI: " + responseString);
            }

            dynamic result;
            try
            {
                result = JsonConvert.DeserializeObject(responseString);
            }
            catch (Exception ex)
            {
                return BadRequest("Không parse được response tổng: " + ex.Message);
            }

            string output = result?.choices?[0]?.message?.content;
            if (string.IsNullOrWhiteSpace(output))
            {
                return BadRequest("Không có nội dung trả về từ AI.");
            }

            // Parse kết quả của lần gọi này rồi cộng dồn
            try
            {
                var cleanedOutput = output.Trim();
                if (cleanedOutput.Contains("```"))
                {
                    var codeBlocks = Regex.Matches(cleanedOutput, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
                    if (codeBlocks.Count > 0)
                    {
                        cleanedOutput = codeBlocks[0].Groups[1].Value.Trim();
                    }
                }

                var rawList = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(cleanedOutput);
                if (rawList == null)
                    return BadRequest("Không thể parse kết quả thành danh sách câu hỏi.");

                // BẮT BUỘC: số câu trả về phải đúng tổng yêu cầu
                if (rawList.Count != totalRequestedQuestions)
                {
                    return BadRequest($"Số lượng câu hỏi trả về ({rawList.Count}) không khớp với yêu cầu ({totalRequestedQuestions}).\nOutput từ AI:\n{output}");
                }

                foreach (var item in rawList)
                {
                    if (!item.TryGetValue("Content", out var contentObj)) continue;

                    var question = new GeneratedQuestion
                    {
                        Content = contentObj?.ToString() ?? string.Empty,
                        Type = QuestionType.SelectOne // default fallback (giữ nguyên)
                    };

                    if (item.TryGetValue("Type", out var typeObj) &&
                        Enum.TryParse<QuestionType>(typeObj.ToString(), true, out var parsedType))
                    {
                        question.Type = parsedType;
                    }

                    // Answers (giữ nguyên)
                    if (item.TryGetValue("Answers", out var answersObj))
                    {
                        try
                        {
                            var answersJson = JsonConvert.SerializeObject(answersObj);
                            question.Answers = JsonConvert.DeserializeObject<List<GeneratedAnswer>>(answersJson)
                                               ?? new List<GeneratedAnswer>();
                        }
                        catch
                        {
                            question.Answers = new List<GeneratedAnswer>();
                        }
                    }

                    // Sửa lỗi TrueFalse nếu AI không theo format (giữ nguyên)
                    if (question.Type == QuestionType.TrueFalse)
                    {
                        if (question.Answers == null || question.Answers.Count != 2 ||
                            !question.Answers.Any(a => string.Equals(a.Text, "True", StringComparison.OrdinalIgnoreCase)) ||
                            !question.Answers.Any(a => string.Equals(a.Text, "False", StringComparison.OrdinalIgnoreCase)))
                        {
                            if (item.TryGetValue("TrueFalseAnswer", out var tfAns))
                            {
                                bool isTrue = false;
                                if (bool.TryParse(tfAns.ToString(), out var b)) isTrue = b;
                                else if (string.Equals(tfAns.ToString(), "True", StringComparison.OrdinalIgnoreCase)) isTrue = true;
                                question.Answers = new List<GeneratedAnswer>
                        {
                            new() { Text = "True", IsTrue = isTrue },
                            new() { Text = "False", IsTrue = !isTrue }
                        };
                            }
                            else
                            {
                                question.Answers = new List<GeneratedAnswer>
                        {
                            new() { Text = "True", IsTrue = true },
                            new() { Text = "False", IsTrue = false }
                        };
                            }
                        }
                    }

                    allQuestions.Add(question);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi phân tích kết quả: " + ex.Message + "\nOutput:\n" + output);
            }

            if (allQuestions.Count == 0)
            {
                return BadRequest("Không nhận được câu hỏi nào từ AI.");
            }

            return Ok(allQuestions);
        }


        [HttpPost("GenerateEssayQuestion")]
        public async Task<IActionResult> GenerateEssay([FromBody] PracQuestionRequest request)
        {
            string materialContent = await GetMaterialContentAsync(request.MaterialLink);
            if (string.IsNullOrWhiteSpace(materialContent))
            {
                return BadRequest("Không thể lấy nội dung tài liệu từ link.");
            }

            // Build prompt: yêu cầu sinh câu hỏi tự luận + tiêu chí chấm theo trọng số phần trăm
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine($"Hãy tạo các câu hỏi tự luận môn {request.SubjectName} dựa trên tài liệu sau:");
            promptBuilder.AppendLine(materialContent);
            promptBuilder.AppendLine("\nYêu cầu chi tiết:");
            foreach (var level in request.Levels)
            {
                promptBuilder.AppendLine($"- {level.NumberOfQuestions} câu hỏi mức độ {level.Difficulty}");
            }

            promptBuilder.AppendLine(@"
                Mỗi câu hỏi phải có định dạng JSON như sau:
                {
                  ""Content"": ""Nội dung câu hỏi tự luận rõ ràng và cụ thể."",
                  ""BandScoreGuide"": [
                    {
                      ""CriterionName"": ""Tên tiêu chí (ví dụ: Độ rõ ràng)"",
                      ""WeightPercent"": 30.0, // phần trăm trọng số của tiêu chí trên tổng (tổng các WeightPercent của một câu phải là 100)
                      ""Description"": ""Mô tả cách chấm tiêu chí này.""
                    },
                    ...
                  ]
                }

                Yêu cầu với BandScoreGuide:
                1. Cho ít nhất 3-5 tiêu chí phù hợp với loại câu hỏi và độ khó (ví dụ: Độ rõ ràng, Nội dung, Tư duy/phân tích, Ngữ pháp, Tính logic, Ví dụ minh họa...)..
                2. Tổng các WeightPercent trong mỗi BandScoreGuide phải là 100. Nếu không, điều chỉnh sao cho tương đối hợp lý và ghi rõ trong mô tả rằng đã cân chỉnh.
                3. Mỗi tiêu chí cần có mô tả ngắn (1-2 câu) giải thích việc chấm.
                4. Trả về toàn bộ danh sách câu hỏi là một mảng JSON hợp lệ, không thêm văn bản khác ngoài cấu trúc JSON. Nếu trả về trong code block như ```json ...```, chỉ lấy phần JSON bên trong.

                Ví dụ đầu ra:
                [
                  {
                    ""Content"": ""Giải thích các yếu tố ảnh hưởng tới tăng trưởng kinh tế trong ngắn hạn và dài hạn."",
                    ""BandScoreGuide"": [
                      {
                        ""CriterionName"": ""Độ rõ ràng"",
                        ""WeightPercent"": 25.0,
                        ""Description"": ""Trình bày mạch lạc, dễ hiểu.""
                      },
                      {
                        ""CriterionName"": ""Tư duy/phân tích"",
                        ""WeightPercent"": 30.0,
                        ""Description"": ""Phân tích đúng nguyên nhân và hệ quả.""
                      },
                      {
                        ""CriterionName"": ""Nội dung chuyên môn"",
                        ""WeightPercent"": 25.0,
                        ""Description"": ""Đúng các khái niệm và lý thuyết liên quan.""
                      },
                      {
                        ""CriterionName"": ""Ví dụ minh họa"",
                        ""WeightPercent"": 20.0,
                                ""Description"": ""Có ví dụ cụ thể để hỗ trợ lập luận.""
                      }
                    ]
                  }
                ]
                ");

            string prompt = promptBuilder.ToString();

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
                var cleanedOutput = output.Trim();

                if (cleanedOutput.Contains("```"))
                {
                    var codeBlocks = Regex.Matches(cleanedOutput, "```(?:json)?\\s*([\\s\\S]*?)\\s*```");
                    if (codeBlocks.Count > 0)
                    {
                        cleanedOutput = codeBlocks[0].Groups[1].Value.Trim();
                    }
                }

                var essayQuestions = JsonConvert.DeserializeObject<List<EssayQuestionResult>>(cleanedOutput);
                if (essayQuestions == null)
                    return BadRequest("Không thể deserialize kết quả thành danh sách câu hỏi.");

                // Hậu xử lý: đảm bảo mỗi BandScoreGuide có total weight ~100, nếu không thì scale lại
                foreach (var q in essayQuestions)
                {
                    var totalWeight = q.BandScoreGuide.Sum(c => c.WeightPercent);
                    if (Math.Abs(totalWeight - 100.0) > 0.1 && totalWeight > 0)
                    {
                        // scale tỷ lệ từng tiêu chí để tổng về 100
                        foreach (var crit in q.BandScoreGuide)
                        {
                            crit.WeightPercent = Math.Round(crit.WeightPercent * 100.0 / totalWeight, 2);
                        }
                        // thêm ghi chú vào mô tả tổng thể nếu cần (có thể mở rộng)
                    }
                }

                return Ok(essayQuestions);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi phân tích kết quả trả về: " + ex.Message + "\nOutput:\n" + output);
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

        private bool IsSpecOfType(object specTypeValue, string desiredTypeName)
        {
            if (specTypeValue == null) return false;
            var s = specTypeValue.ToString()?.Trim();
            if (string.IsNullOrEmpty(s)) return false;

            // Chấp nhận số 1/2/3
            if (int.TryParse(s, out var n))
            {
                return (n == 1 && desiredTypeName.Equals("SelectOne", StringComparison.OrdinalIgnoreCase))
                    || (n == 2 && desiredTypeName.Equals("MultipleChoice", StringComparison.OrdinalIgnoreCase))
                    || (n == 3 && desiredTypeName.Equals("TrueFalse", StringComparison.OrdinalIgnoreCase));
            }

            // Hoặc tên trực tiếp
            return desiredTypeName.Equals(s, StringComparison.OrdinalIgnoreCase);
        }
        private string ExtractGoogleDocId(string url)
        {
            var match = Regex.Match(url, @"document/d/([a-zA-Z0-9-_]+)");
            return match.Success ? match.Groups[1].Value : null;

        }

    }
}
