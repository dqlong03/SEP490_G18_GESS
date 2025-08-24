# Stage 1: Build
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
COPY GESS.Test/*.csproj GESS.Test/

RUN dotnet restore

COPY . .

WORKDIR /src/Gess.Api

RUN dotnet publish -c Release -o /app/publish

RUN ls -l /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app

ENV TZ=Asia/Bangkok
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata \
    && ln -snf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone \
    && dpkg-reconfigure -f noninteractive tzdata \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=build /app/publish .

RUN ls -l /app

ENTRYPOINT ["dotnet", "GESS.Api.dll"]
