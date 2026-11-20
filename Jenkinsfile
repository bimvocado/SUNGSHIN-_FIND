// =====================================================================
// SUNGSHIN FIND - Jenkins 파이프라인 (#12 PR 자동 검사, #13 자동 배포)
// ---------------------------------------------------------------------
// 강의자료 10주차 47~48p "간단한 node.js 애플리케이션 - Jenkinsfile" 구조를 그대로 따름
//   Checkout code -> Build image -> Test image -> Push image -> Deploy to GKE
//   (Test image 단계는 강의자료 8주차 36p 의 app.inside { ... } 방식)
//
// 동작 방식 (Multibranch Pipeline)
//   - 작업 브랜치 / PR : Checkout -> Build -> Test        (검사만)
//   - main 브랜치      : 위 단계 + Push -> Deploy to GKE (when { branch 'main' })
// =====================================================================

pipeline {
  agent any

  environment {
    // ---- GKE 정보 (README "GKE 클러스터 접속 가이드" 값) ----
    PROJECT_ID   = 'iron-area-514720-j0'
    CLUSTER_NAME = 'sungshin-find-cluster'
    LOCATION     = 'asia-northeast3-a'

    // Jenkins 에 GKE Credential 을 추가하면 생기는 ID (강의자료 10주차 47p, 53~54p)
    // "Google Service Account from private key" 로 등록하면 보통 프로젝트 이름이 ID 가 됨
    // -> Jenkins Credentials 목록에서 실제 ID 가 다르면 그 값으로 바꿀 것
    CREDENTIALS_ID = 'iron-area-514720-j0'

    // Docker Hub 아이디 (강의자료 8주차 34p 에서 저장소 만든 계정)
    // 중앙 레포: #43 에서 k8s 매니페스트가 slwnt31/sungshin-find-*:latest 로 바뀌었으므로 slwnt31
    // 개인 Fork 연습 시: 본인 Docker Hub 아이디로 변경 (+ 본인 fork 의 k8s 매니페스트 image 도 같이 변경)
    DOCKERHUB_ID = 'slwnt31'

    // 배포할 네임스페이스
    // 중앙 레포: dev  /  개인 Fork 연습 시: dev-본인이름 (예: dev-yuri)
    NAMESPACE = 'dev'
  }

  stages {

    // 1) GitHub 코드 가져오기 (Multibranch 가 현재 브랜치/PR 을 알아서 checkout)
    stage("Checkout code") {
      steps {
        checkout scm
      }
    }

    // 2) 도커 이미지 빌드
    //    강의자료: myapp = docker.build("pjbear/hello:${env.BUILD_ID}")
    //    우리는 backend / frontend 두 개라서 두 번 빌드 (두 번째 인자 = Dockerfile 이 있는 폴더)
    //    frontend Dockerfile 안에서 npm run build 가 돌기 때문에 프론트 빌드 오류도 여기서 걸림
    stage("Build image") {
      steps {
        script {
          backend  = docker.build("${DOCKERHUB_ID}/sungshin-find-backend:${env.BUILD_ID}",  "./backend")
          frontend = docker.build("${DOCKERHUB_ID}/sungshin-find-frontend:${env.BUILD_ID}", "./frontend")
        }
      }
    }

    // 3) 테스트 (강의자료 8주차 36p: app.inside { sh 'make test' })
    stage("Test image") {
      steps {
        script {
          // 백엔드: 방금 만든 이미지 안에서 실행
          //  - 지금 main 의 backend 는 app.py 스텁 -> import 되는지만 확인
          //  - Django(#3) 머지 후에는 manage.py 가 생기므로 자동으로 'manage.py check' 실행
          backend.inside {
            sh 'cd /app && if [ -f manage.py ]; then python manage.py check; else python -c "import app"; fi'
          }
          // 프론트엔드: 최종 이미지가 nginx 라 npm 이 없으므로 node 이미지 안에서 lint 실행
          //  --cache: 컨테이너 안 홈 폴더에 쓰기 권한이 없어서 npm 캐시를 작업 폴더에 둠
          docker.image('node:20-alpine').inside {
            sh 'cd frontend && npm ci --cache .npm-cache && npm run lint'
          }
        }
      }
    }

    // 4) Docker Hub 에 push (강의자료 10주차 48p 그대로)
    //    'dockerhub' = Jenkins 에 등록한 DockerHub Credential 의 ID (강의자료 10주차 51~52p)
    //    강의자료는 모든 브랜치에서 push 하지만, 우리 매니페스트는 :latest + imagePullPolicy: Always 라서
    //    PR 빌드가 latest 를 덮어쓰면 머지 안 된 코드가 배포될 수 있음 -> main 에서만 push 하도록 when 추가
    stage("Push image") {
      when {
        branch 'main'
      }
      steps {
        script {
          docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
            backend.push("latest")
            backend.push("${env.BUILD_ID}")
            frontend.push("latest")
            frontend.push("${env.BUILD_ID}")
          }
        }
      }
    }

    // 5) GKE 배포 -- main 브랜치에서만 (강의자료 10주차 48p 그대로)
    stage('Deploy to GKE') {
      when {
        branch 'main'
      }
      steps {
        // sed 로 매니페스트의 :latest 를 이번 빌드 번호로 교체 (강의자료 49p sed 설명 참고)
        // Jenkins 작업 폴더의 파일만 바뀌고 GitHub 에는 커밋되지 않음
        sh "sed -i 's/sungshin-find-backend:latest/sungshin-find-backend:${env.BUILD_ID}/g' k8s/backend/deployment.yml"
        sh "sed -i 's/sungshin-find-frontend:latest/sungshin-find-frontend:${env.BUILD_ID}/g' k8s/frontend/deployment.yml"

        // 강의자료와 동일한 KubernetesEngineBuilder (Google Kubernetes Engine 플러그인)
        // 강의자료와 다른 점: namespace 추가 (위 environment 의 NAMESPACE 값)
        //  -> 우리 서비스와 Ingress 가 dev 네임스페이스에 있음 (k8s/ingress/ingress.yml 주석)
        //  -> 빼면 default 네임스페이스에 배포돼서 Ingress 와 연결이 안 됨
        step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME,
              location: env.LOCATION, namespace: env.NAMESPACE, manifestPattern: 'k8s/backend/deployment.yml',
              credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
        step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME,
              location: env.LOCATION, namespace: env.NAMESPACE, manifestPattern: 'k8s/frontend/deployment.yml',
              credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
      }
    }
  }
}
