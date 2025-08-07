# build stage
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

COPY *.sln ./
COPY Gess.Api/*.csproj Gess.Api/
COPY GESS.Auth/*.csproj GESS.Auth/
COPY GESS.Entity/*.csproj GESS.Entity/
COPY GESS.Model/*.csproj GESS.Model/
COPY GESS.Service/*.csproj GESS.Service/
COPY Gess.Repository/*.csproj Gess.Repository/
COPY GessCommon/*.csproj GessCommon/

COPY . .         
RUN dotnet restore
WORKDIR /src/Gess.Api
RUN dotnet publish -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Gess.Api.dll"]
