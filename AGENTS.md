<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 작업 규칙

- 답변은 한국어로 작성한다.
- 코드 작성 전에 관련 파일과 기존 구현을 확인한다.
- Next.js 관련 코드를 수정하기 전에 `node_modules/next/dist/docs/`의 관련 문서를 확인한다.
- 기존 프로젝트 구조와 코딩 스타일을 유지한다.
- 변경 후 관련 테스트와 린트를 실행한다.
- 사용자가 요청하지 않은 대규모 리팩토링은 하지 않는다.
- 같은 세션(또는 이전 대화 기록)에서 사용자가 같은 취지의 요청을 2회 이상 반복하면, 이를 고정 규칙 후보로 정리해 사용자에게 보여주고 규칙에 포함시킬지 먼저 물어본 뒤에만 반영한다.