# SUNGSHIN FIND

성신여자대학교 학생 전용 캠퍼스 분실물 매칭 플랫폼

## 프로젝트 소개
분실물과 습득물 정보를 표준화된 형식으로 등록하고, 물건 종류, 색상, 장소, 날짜를 기반으로
유사도를 계산해 자동으로 매칭하는 서비스입니다.

## 주요 기능
- 성신여대 학교 이메일 기반 회원가입 및 인증
- 분실물 / 습득물 사진과 상세 정보 등록
- 규칙 기반 자동 매칭 및 유사 게시물 추천
- 매칭 후보 발생 시 알림
- 게시물 검색 및 반환 상태 관리

## 기술 스택
| 영역 | 기술 |
|---|---|
| Frontend | React |
| Backend | Django REST Framework |
| Database | PostgreSQL |
| Container | Docker |
| Orchestration | Kubernetes (GKE) |
| CI/CD | Jenkins |

## 폴더 구조
```
.
├── backend/    Django 백엔드
├── frontend/   React 프론트엔드
├── k8s/        Kubernetes 매니페스트
└── .github/    PR 템플릿, CODEOWNERS
```

## 협업 규칙

### 브랜치
- `main`: 항상 배포 가능한 상태 유지, 직접 push 금지
- 작업 브랜치: `종류/#이슈번호-설명`
  - 예: `feat/#15-email-verification`, `infra/#10-postgres-statefulset`
  - 종류: `feat`, `fix`, `infra`, `ci`, `docs`, `chore`, `test`
- 작업 브랜치는 PR 머지 후 삭제

### 커밋 메시지
`종류: 내용 (#이슈번호)` 형식
- 예: `feat: 학교 이메일 인증 코드 발송 API 추가 (#15)`

### 작업 흐름
1. 이슈 확인 후 본인을 Assignee로 지정
2. 이슈 페이지의 Development > Create a branch 로 브랜치 생성
3. 작업 후 PR 생성 (본문에 `Closes #이슈번호` 작성)
4. 리뷰 1명 이상 승인 + CI 통과 후 머지
5. 머지되면 이슈 자동 종료

## 로컬 실행 방법

### 사전 준비
- Docker Desktop 설치 및 실행

### 전체 서비스 실행
프로젝트 루트 경로에서 아래 명령어를 실행하면 Frontend(Nginx), Backend(Gunicorn), PostgreSQL이 한 번에 빌드 및 실행됩니다.

```bash
docker compose up --build -d
```

### 접속 주소
- **Frontend (웹 화면):** http://localhost
- **Backend API (헬스체크 : 실제로 요청 처리 가능한 상태인지 주기적으로 확인):** http://localhost/api/health
- **PostgreSQL:** `localhost:5432` (DB: `sungshin_find` / User: `sungshin_user`)

### 컨테이너 상태 확인 및 종료
```bash
# 실행 중인 컨테이너 확인
docker compose ps

# 로그 확인
docker compose logs -f

# 서비스 종료 (DB 데이터 볼륨은 유지됨)
docker compose down
```

## GKE 클러스터 접속 가이드

팀원이 로컬 환경(`kubectl`)에서 GCP GKE 클러스터 접속 방법

### 1. 사전 준비
- GCP 프로젝트(`iron-area-514720-j0`) IAM 권한(`Kubernetes Engine 개발자`) 부여 필요
- [Google Cloud CLI (`gcloud`)](https://cloud.google.com/sdk/docs/install) 설치
- `kubectl` 및 GKE 인증 플러그인 설치:
  ```bash
  gcloud components install kubectl gke-gcloud-auth-plugin
  ```

### 2. 클러스터 연결 (kubeconfig 등록)
로컬 `kubectl`이 GCP의 GKE 클러스터(`sungshin-find-cluster`)를 제어할 수 있도록 인증 정보를 등록합니다.

```bash
gcloud container clusters get-credentials sungshin-find-cluster --zone asia-northeast3-a --project iron-area-514720-j0
```

### 3. 클러스터 연결 확인
워커 노드 및 `dev` 네임스페이스가 정상 조회되는지 확인합니다.

```bash
kubectl get nodes
kubectl get ns
```

## CI/CD

- PR 생성 시: Jenkins가 이미지 빌드 + 테스트 후 PR에 결과 표시 (실패 시 머지 불가)
- main 머지 시: Docker Hub에 이미지 push → GKE `dev` 네임스페이스에 롤링 업데이트
- 이미지 태그: Jenkins 빌드 번호

### 배포 실패 시 롤백
```bash
kubectl rollout history deployment/backend -n dev   # 배포 이력 확인
kubectl rollout undo deployment/backend -n dev      # 이전 버전으로 되돌리기
```