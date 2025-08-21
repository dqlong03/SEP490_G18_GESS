# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy các file project và solution
COPY *.sln ./
COPY Gess.Api/*.csproj Gess.Api/
COPY GESS.Auth/*.csproj GESS.Auth/
COPY GESS.Entity/*.csproj GESS.Entity/
COPY GESS.Model/*.csproj GESS.Model/
COPY GESS.Service/*.csproj GESS.Service/
COPY Gess.Repository/*.csproj Gess.Repository/
COPY GessCommon/*.csproj GessCommon/
COPY GESS.Test/*.csproj GESS.Test/

RUN dotnet restore

# Copy toàn bộ source code vào build context
COPY . .

WORKDIR /src/Gess.Api

# Build và publish ra thư mục /app/publish
RUN dotnet publish -c Release -o /app/publish

# Kiểm tra file sau khi publish
RUN ls -l /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app

# Copy file publish từ stage build sang runtime
COPY --from=build /app/publish .

# Kiểm tra file trong thư mục runtime
RUN ls -l /app

ENTRYPOINT ["dotnet", "GESS.Api.dll"]