# 김치하 한영사전 복원 아카이브

CurrensAdAstra.github.io의 편집기형 레이아웃, 색상, 타이포그래피를 적용한 GitHub Pages 정적 사이트입니다. `assets/css/reference.css`는 해당 프로젝트의 스타일 원본이며, 사전 전용 변경은 `dictionary.css`에 있습니다.

## 복구 범위

- 사용자가 제공한 2002-12-09의 2페이지와, 2003-05~06 보존본의 1~10페이지: 총 11개 응답.
- 2002년 페이지에는 총 95건, 2003년 페이지에는 총 117건으로 표시됩니다. 요청 날짜와 실제 Wayback 리디렉션 날짜를 혼동하지 않도록 최종 URL을 보존했습니다.
- 실제 복원한 고유 항목은 117개입니다. 원문 ID·한글·영문·등록자가 모두 같은 레코드만 병합하고, 각 출처를 유지합니다. 단어가 같은 별도 항목은 삭제하지 않습니다.
- 2002년 전체 데이터베이스를 복구했다는 의미가 아닙니다. 서로 다른 시점의 기록을 합친 복원본이며, 2003년 10페이지의 ID 117개가 빠짐없이 포함되었음을 검증합니다.
- 원본 응답은 `data/archive/`에 CP949 바이트 그대로 저장했습니다. 출처 URL은 `.source.txt`, 파일 해시와 항목별 출처는 `data/dictionary.json`에서 확인할 수 있습니다.
- 원문의 철자 및 등록자를 그대로 유지합니다. 실제 등록·수정·삭제 서버 기능은 복원 범위에 포함하지 않습니다.

## 사용 및 검증

빌드나 패키지 설치가 필요하지 않습니다. GitHub Pages가 이 저장소의 루트를 서비스하도록 설정하면 됩니다.

```sh
python3 -m http.server 8000
python3 scripts/restore.py
node --test scripts/dictionary.test.cjs
```

`restore.py`는 보존한 원본에서 JSON을 재생성하며 네트워크 요청을 하지 않습니다. 검색·초성·정렬·페이지 선택은 URL 쿼리로 공유할 수 있습니다. 테마 설정만 브라우저에 저장됩니다.

원 사이트: http://kimchiha.manazone.com/

시작 보존본: https://web.archive.org/web/20021209093455/http://kimchiha.manazone.com/?page=2&action=list&sort=kor&order=asc
