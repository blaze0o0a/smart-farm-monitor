#!/bin/bash

# macOS 앱 번들 생성 스크립트
APP_NAME="SmartFarm"
APP_DIR="$APP_NAME.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

# 앱 번들 구조 생성
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Info.plist 생성
cat > "$CONTENTS_DIR/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>SmartFarm</string>
    <key>CFBundleIdentifier</key>
    <string>com.smartfarm.app</string>
    <key>CFBundleName</key>
    <string>SmartFarm</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
</dict>
</plist>
EOF

# 실행 스크립트 생성
cat > "$MACOS_DIR/SmartFarm" << 'EOF'
#!/bin/bash

# 현재 스크립트의 디렉토리로 이동
cd "$(dirname "$0")/../../.."

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")/../../.."

echo "스마트팜 앱을 시작합니다..."

# Node.js가 설치되어 있는지 확인
if ! command -v node &> /dev/null; then
    osascript -e 'display dialog "Node.js가 설치되어 있지 않습니다. Node.js를 먼저 설치해주세요." buttons {"확인"} default button "확인"'
    exit 1
fi

# npm이 설치되어 있는지 확인
if ! command -v npm &> /dev/null; then
    osascript -e 'display dialog "npm이 설치되어 있지 않습니다. Node.js를 먼저 설치해주세요." buttons {"확인"} default button "확인"'
    exit 1
fi

# 프로덕션 빌드가 없으면 빌드 실행
if [ ! -d ".next" ]; then
    echo "빌드 파일이 없습니다. 빌드를 시작합니다..."
    npm run build
fi

# 브라우저에서 앱 열기
open "http://localhost:3331"

# 프로덕션 서버 시작
npm run start
EOF

chmod +x "$MACOS_DIR/SmartFarm"

echo "앱 번들이 생성되었습니다: $APP_DIR"
echo "더블클릭하여 실행할 수 있습니다."

