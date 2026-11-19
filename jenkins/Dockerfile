# =====================================================================
# SUNGSHIN FIND - Jenkins 서버 이미지 (#7)
# ---------------------------------------------------------------------
# 강의자료 8주차 10p "Jenkins Docker 이미지 빌드" Dockerfile 그대로
# (단 한 줄만 다름: 베이스 이미지 jdk11 -> jdk17, 아래 설명 참고)
#
# gcloud CLI / kubectl 은 강의자료 10주차 26~27p 처럼
# 컨테이너 실행 후 "docker exec -it --user=root myjenkins bash" 로 들어가서 직접 설치함
#
# 빌드:  docker build -t myjenkins .
# 실행 (강의자료 8주차 11p):
#   docker run -d --name myjenkins -p 8080:8080 --restart=always \
#     -v jenkins-home:/var/jenkins_home \
#     -v /var/run/docker.sock:/var/run/docker.sock \
#     --group-add $(stat -c '%g' /var/run/docker.sock) myjenkins
# =====================================================================

# 강의자료: FROM jenkins/jenkins:lts-jdk11
# 현재 Jenkins LTS 와 플러그인은 Java 17 이상이 필요해서 jdk11 로는 권장 플러그인 설치가 실패함
# -> 이 한 줄만 jdk17 로 변경
FROM jenkins/jenkins:lts-jdk17

# 패키지 설치를 위해 root 로 전환
USER root

# 빌드 도구(make 등), wget, sudo 설치
RUN apt-get -y update && \
    apt-get -y install build-essential wget sudo apt-utils

# 컨테이너 안에 docker CLI 설치
# -> 실제 docker 데몬은 VM 의 것을 /var/run/docker.sock 으로 빌려 씀
RUN wget -qO- https://get.docker.com/ | sh

# jenkins 사용자가 docker 명령을 쓸 수 있게 docker 그룹에 추가
RUN usermod -aG docker jenkins

# 다시 jenkins 사용자로 복귀
USER jenkins