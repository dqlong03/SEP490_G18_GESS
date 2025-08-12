
using CloudinaryDotNet;
using Gess.Repository.Infrastructures;
using GESS.Api.HandleException;
using GESS.Auth;
using GESS.Common;
using GESS.Entity.Base;
using GESS.Entity.Contexts;
using GESS.Entity.Entities;
using GESS.Model.APIKey;
using GESS.Model.Email;
using GESS.Repository.Implement;
using GESS.Repository.Interface;
using GESS.Repository.refreshtoken;
using GESS.Service;
using GESS.Service.assignGradeCreateExam;
using GESS.Service.authservice;
using GESS.Service.categoryExam;
using GESS.Service.chapter;
using GESS.Service.cloudinary;
using GESS.Service.email;
using GESS.Service.exam;
using GESS.Service.examination;
using GESS.Service.examSchedule;
using GESS.Service.examSlotService;
using GESS.Service.finalExamPaper;
using GESS.Service.finalPracExam;
using GESS.Service.GradeCompoService;
using GESS.Service.gradeSchedule;
using GESS.Service.levelquestion;
using GESS.Service.major;
using GESS.Service.multianswer;
using GESS.Service.multipleExam;
using GESS.Service.multipleQuestion;
using GESS.Service.otp;
using GESS.Service.practiceExam;
using GESS.Service.practiceExamPaper;
using GESS.Service.practicequestion;
using GESS.Service.room;
using GESS.Service.semesters;
using GESS.Service.student;
using GESS.Service.subject;
using GESS.Service.teacher;
using GESS.Service.trainingProgram;
using GESS.Service.users;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// Google login
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    });

// Thêm cấu hình CORS
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowFrontend",
//        policy =>
//        {
//            policy.WithOrigins("http://localhost:3000") // Thay bằng domain của frontend Next.js
//                  .AllowAnyHeader()
//                  .AllowAnyMethod()
//                  .AllowCredentials(); // Nếu cần gửi cookie hoặc token
//        });
//});


// Thêm cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.AllowAnyOrigin()      // Cho phép tất cả các domain
                  .AllowAnyHeader()
                  .AllowAnyMethod();
                  
            // Không dùng .AllowCredentials() với AllowAnyOrigin()
        });
});




// Add services to the container
builder.Services.AddControllers();

// Thêm logging
builder.Services.AddLogging();

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "GESS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Đăng ký IUnitOfWork với factory delegate
builder.Services.AddScoped<IUnitOfWork>(provider =>
{
    var context = provider.GetRequiredService<GessDbContext>();
    var userManager = provider.GetRequiredService<UserManager<User>>();
    var roleManager = provider.GetRequiredService<RoleManager<IdentityRole<Guid>>>(); // Sửa thành IdentityRole<Guid>
    return new UnitOfWork(context, userManager, roleManager);
});
builder.Services.AddScoped<IBaseService<BaseEntity>, BaseService<BaseEntity>>();

// Đăng ký DbContext
builder.Services.AddDbContext<GessDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("GessDb")));

// Đăng ký Identity
builder.Services.AddIdentity<User, IdentityRole<Guid>>()
    .AddEntityFrameworkStores<GessDbContext>()
    .AddDefaultTokenProviders();

// Đăng ký Service
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IChapterService, ChapterService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IMajorService, MajorService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IMultipleExamService, MultipleExamService>();
builder.Services.AddScoped<ITrainingProgramService, TrainingProgramService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IExaminationService, ExaminationService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<ICategoryExamService, CategoryExamService>();
builder.Services.AddScoped<IMultipleQuestionService, MultipleQuestionService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IPracticeQuestionService, PracticeQuestionService>();
builder.Services.AddScoped<IExamScheduleService, ExamScheduleService>();
builder.Services.AddScoped<IExamService, GESS.Service.exam.ExamService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<ILevelQuestionService, LevelQuestionService>();
builder.Services.AddScoped<IGradeScheduleService, GradeScheduleService>();
builder.Services.AddScoped<IFinalExamService, FinalExamService>();
builder.Services.AddScoped<IAssignGradeCreateExamService, AssignGradeCreateExamService>();
builder.Services.AddScoped<IFinalExamPaperService, FinalExamPaperService>();



// ThaiNH_Initialize_Begin
builder.Services.AddScoped<ICateExamSubService, CateExamSubService>();
builder.Services.AddScoped<ISemestersService, SemestersService>();
builder.Services.AddScoped<IPracticeExamPaperService, PracticeExamPaperService>();
builder.Services.AddScoped<IPracticeQuestionService, PracticeQuestionService>();  
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IMultiAnswerService, MultiAnswerService>();
builder.Services.AddScoped<IPracticeExamService, PracticeExamService>();

//LongDQ
builder.Services.AddScoped<IExamSlotService, ExamSlotService>();
builder.Services.AddScoped<IGradeScheduleRepository, GradeScheduleRepository>();
// Đăng ký các repository

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IChapterRepository, ChapterRepository>();
builder.Services.AddScoped<ITeacherRepository, TeacherRepository>();
builder.Services.AddScoped<IExaminationRepository, ExaminationRepository>();
builder.Services.AddScoped<IMajorRepository, MajorRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ITrainingProgramRepository, TrainingProgramRepository>();
builder.Services.AddScoped<IClassRepository, ClassRepository>();
builder.Services.AddScoped<IMultipleExamRepository, MultipleExamRepository>();
builder.Services.AddScoped<ICategoryExamRepository, CategoryExamRepository>();
builder.Services.AddScoped<IMultipleQuestionRepository, MultipleQuestionRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<ISemesterRepository, SemesterRepository>();
builder.Services.AddScoped<ICateExamSubRepository, CateExamSubRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IExamRepository, ExamRepository>();
builder.Services.AddScoped<IPracticeExamPaperRepository, PracticeExamPaperRepository>();
builder.Services.AddScoped<IPracticeQuestionsRepository, PracticeQuestionsRepository>();
builder.Services.AddScoped<ILevelQuestionRepository, LevelQuestionRepository>();
builder.Services.AddScoped<IPracticeAnswersRepository, PracticeAnswersRepository>();
builder.Services.AddScoped<IMultipleAnswerRepository, MultiAnswerRepository>();
builder.Services.AddScoped<IPracticeExamRepository, PracticeExamRepository>();
builder.Services.AddScoped<IExamScheduleRepository, ExamScheduleRepository>();
builder.Services.AddScoped<IExamSlotRepository, ExamSlotRepository>();
builder.Services.AddScoped<IAssignGradeCreateExamRepository, AssignGradeCreateExamRepository>();
builder.Services.AddScoped<IFinalExamPaperRepository, FinalExamPaperRepository>();
builder.Services.AddScoped<IFinaExamRepository, FinaExamRepository>();


// Đọc cấu hình Cloudinary từ appsettings.json
var cloudinaryConfig = builder.Configuration.GetSection("Cloudinary");
var cloudName = cloudinaryConfig["CloudName"];
var apiKey = cloudinaryConfig["ApiKey"];
var apiSecret = cloudinaryConfig["ApiSecret"];

if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
{
    throw new ArgumentException("Cloudinary configuration is missing or incomplete.");
}

var account = new Account(cloudName, apiKey, apiSecret);
var cloudinary = new Cloudinary(account);
builder.Services.AddSingleton(cloudinary);

// Đăng ký EmailService
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<EmailService>();
builder.Services.AddMemoryCache();
builder.Services.Configure<APIKeyOptions>(builder.Configuration.GetSection("APIKey"));

// Cấu hình JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = Constants.Issuer,
        ValidAudience = Constants.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Constants.SecretKey)),
        
        // Explicitly set claim types to ensure proper role recognition
        NameClaimType = ClaimTypes.Name,
        RoleClaimType = ClaimTypes.Role
    };
    
    // Enable detailed JWT logging
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"[JWT AUTH] Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var claims = context.Principal.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
            Console.WriteLine($"[JWT AUTH] Token validated successfully. Claims: {string.Join(", ", claims)}");
            
            // Transform custom role claims to standard role claims
            var identity = context.Principal.Identity as ClaimsIdentity;
            if (identity != null)
            {
                // Check for both custom "Role" claims and standard role claims
                var customRoleClaims = identity.FindAll("Role").ToList();
                var standardRoleClaims = identity.FindAll(ClaimTypes.Role).ToList();
                
                Console.WriteLine($"[JWT AUTH] Found {customRoleClaims.Count} custom role claims, {standardRoleClaims.Count} standard role claims");
                
                // Transform custom role claims to standard if any exist
                foreach (var roleClaim in customRoleClaims)
                {
                    identity.AddClaim(new Claim(ClaimTypes.Role, roleClaim.Value));
                    Console.WriteLine($"[JWT AUTH] Transformed custom role claim to standard: {roleClaim.Value}");
                }
                
                // Ensure standard name claim exists
                var usernameClaim = identity.FindFirst("Username");
                var nameClaimFromToken = identity.FindFirst(ClaimTypes.Name);
                
                if (usernameClaim != null && nameClaimFromToken == null)
                {
                    identity.AddClaim(new Claim(ClaimTypes.Name, usernameClaim.Value));
                    Console.WriteLine($"[JWT AUTH] Added standard name claim: {usernameClaim.Value}");
                }
                
                // Ensure standard name identifier exists
                var useridClaim = identity.FindFirst("Userid");
                var nameIdClaimFromToken = identity.FindFirst(ClaimTypes.NameIdentifier);
                
                if (useridClaim != null && nameIdClaimFromToken == null)
                {
                    identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, useridClaim.Value));
                    Console.WriteLine($"[JWT AUTH] Added standard NameIdentifier claim: {useridClaim.Value}");
                }
                
                // Debug: Print all claims after transformation
                var finalClaims = identity.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
                Console.WriteLine($"[JWT AUTH] Final claims after transformation: {string.Join(", ", finalClaims)}");
            }
            
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"[JWT AUTH] Authentication challenge: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});

// Khởi tạo Constants
Constants.Initialize(builder.Configuration);

var app = builder.Build();

//Seed dữ liệu
//using (var scope = app.Services.CreateScope())
//{
//    var services = scope.ServiceProvider;
//    var context = services.GetRequiredService<GessDbContext>();
//    var logger = services.GetRequiredService<ILogger<Program>>();

//    try
//    {
//        // Kiểm tra arguments để xem có muốn xóa dữ liệu không
//        if (args.Contains("--clear-data"))
//        {
//            logger.LogInformation("Clearing all data from database...");
//            logger.LogInformation("All data cleared successfully.");
//        }
//        else if (args.Contains("--reseed"))
//        {
//            logger.LogInformation("Clearing and reseeding database...");
//            await SeedData.InitializeAsync(services);
//            logger.LogInformation("Database reseeded successfully.");
//        }
//        else
//        {
//            // Chỉ seed nếu không có args đặc biệt
//            await SeedData.InitializeAsync(services);
//        }
//    }
//    catch (Exception ex)
//    {
//        logger.LogError(ex, "An error occurred while seeding the database.");
//        throw; // Re-throw để dừng ứng dụng nếu có lỗi
//    }
//}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GESS API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHsts();
app.UseHttpsRedirection();

// Sử dụng CORS
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

// Sử dụng CORS trước UseAuthentication/UseAuthorization
app.UseCors("AllowFrontend");

// ThaiNH_Initialize_Begin
app.UseMiddleware<ExceptionMiddleware>(); // Register Middleware Exception
// ThaiNH_Initialize_End

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

