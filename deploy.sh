#!/bin/bash
# AI언니 Vercel 배포 스크립트
# 사용법: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 AI언니 배포 시작..."

# 1. Vercel CLI 확인/설치
echo "📦 Vercel CLI 준비 중..."

# 2. Git 커밋 (변경사항이 있는 경우)
if [[ -n $(git status --porcelain) ]]; then
  echo "📝 변경사항 커밋 중..."
  git add src/app/globals.css src/app/layout.tsx src/app/page.tsx src/app/api/
  git commit -m "feat: AI언니 연애 분석 서비스 구현

- 호감도 분석 UI (텍스트 입력 + 카톡 캡쳐 업로드)
- /api/analyze API 라우트 (free/paid 2-tier)
- 무료: 호감도 점수, 진단 / 유료: 심층 분석, 행동 전략
- ScoreGauge, StageBadge 등 결과 시각화 컴포넌트"
fi

# 3. Vercel 프로젝트 연결 + Preview 배포
echo "☁️  Vercel에 배포 중..."
npx vercel --yes

# 4. 환경변수 설정 안내
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  환경변수 설정이 필요합니다!"
echo ""
echo "아래 명령어를 실행하세요:"
echo "  npx vercel env add ANTHROPIC_API_KEY"
echo ""
echo "또는 Vercel 대시보드 → Settings → Environment Variables 에서 추가"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. 환경변수 확인 후 프로덕션 배포
read -p "환경변수 설정 완료했으면 Enter를 눌러 프로덕션 배포 진행 (건너뛰려면 Ctrl+C): "

echo "🚀 프로덕션 배포 중..."
npx vercel --prod

echo ""
echo "✅ 배포 완료! 위 URL로 접속해보세요."
