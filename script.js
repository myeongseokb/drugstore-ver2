/* HOWELL · 과제 3: 상품/주문은 데모, 회원 인증/프로필만 Supabase 연동. */
/* 상품 배열은 이번 과제에서 변경하지 않습니다. */
const CATEGORIES = ["전체", "건강식품", "화장품", "의약외품", "의약품"];
const MEMBERSHIP_TIERS = [
  { grade: "WELCOME", name: "GREEN", rate: 0.01, label: "기본 회원", icon: "☘" },
  { grade: "SILVER", name: "SILVER", rate: 0.03, label: "누적 10만원", icon: "✧" },
  { grade: "GOLD", name: "GOLD", rate: 0.05, label: "누적 30만원", icon: "✦" },
  { grade: "VIP", name: "PLATINUM", rate: 0.07, label: "누적 60만원", icon: "◆" }
];
const PRODUCTS = 
[
  {
    "id": 1,
    "name": "해열진통제 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-01.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "해열진통제 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 2,
    "name": "종합감기약 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-02.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "종합감기약 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 3,
    "name": "소화제 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-03.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "소화제 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 4,
    "name": "알레르기약 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-04.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "알레르기약 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 5,
    "name": "기침약 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-05.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "기침약 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 6,
    "name": "상처 치료 연고 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-06.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "상처 치료 연고 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 7,
    "name": "소염진통제 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-07.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "소염진통제 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 8,
    "name": "멀미약 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-08.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "멀미약 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 9,
    "name": "안약 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-09.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "안약 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 10,
    "name": "변비약 안내",
    "category": "의약품",
    "price": 0,
    "stock": 0,
    "image": "img/product-10.webp",
    "tag": "매장상담",
    "purchasable": false,
    "description": "변비약 안내의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 11,
    "name": "데일리 멀티비타민",
    "category": "건강식품",
    "price": 21600,
    "stock": 16,
    "image": "img/product-11.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "데일리 멀티비타민의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 12,
    "name": "비타민 C 1000",
    "category": "건강식품",
    "price": 26300,
    "stock": 23,
    "image": "img/product-12.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "비타민 C 1000의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 13,
    "name": "비타민 D3",
    "category": "건강식품",
    "price": 31000,
    "stock": 30,
    "image": "img/product-13.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "비타민 D3의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 14,
    "name": "루테인 플러스",
    "category": "건강식품",
    "price": 35700,
    "stock": 37,
    "image": "img/product-14.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "루테인 플러스의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 15,
    "name": "오메가3 캡슐",
    "category": "건강식품",
    "price": 40400,
    "stock": 44,
    "image": "img/product-15.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "오메가3 캡슐의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 16,
    "name": "프로바이오틱스",
    "category": "건강식품",
    "price": 45100,
    "stock": 51,
    "image": "img/product-16.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "프로바이오틱스의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 17,
    "name": "아연 미네랄",
    "category": "건강식품",
    "price": 11800,
    "stock": 58,
    "image": "img/product-17.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "아연 미네랄의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 18,
    "name": "마그네슘 밸런스",
    "category": "건강식품",
    "price": 16500,
    "stock": 65,
    "image": "img/product-18.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "마그네슘 밸런스의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 19,
    "name": "콜라겐 펩타이드",
    "category": "건강식품",
    "price": 21200,
    "stock": 72,
    "image": "img/product-19.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "콜라겐 펩타이드의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 20,
    "name": "데일리 단백질 파우더",
    "category": "건강식품",
    "price": 25900,
    "stock": 79,
    "image": "img/product-20.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "데일리 단백질 파우더의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 21,
    "name": "식이섬유 파우더",
    "category": "건강식품",
    "price": 30600,
    "stock": 86,
    "image": "img/product-21.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "식이섬유 파우더의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 22,
    "name": "전해질 스틱",
    "category": "건강식품",
    "price": 35300,
    "stock": 17,
    "image": "img/product-22.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "전해질 스틱의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 23,
    "name": "데일리 견과 믹스",
    "category": "건강식품",
    "price": 40000,
    "stock": 24,
    "image": "img/product-23.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "데일리 견과 믹스의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 24,
    "name": "캐모마일 허브티",
    "category": "건강식품",
    "price": 44700,
    "stock": 31,
    "image": "img/product-24.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "캐모마일 허브티의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 25,
    "name": "히알루론 수분 세럼",
    "category": "화장품",
    "price": 11400,
    "stock": 38,
    "image": "img/product-25.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "히알루론 수분 세럼의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 26,
    "name": "세라마이드 장벽 크림",
    "category": "화장품",
    "price": 16100,
    "stock": 45,
    "image": "img/product-26.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "세라마이드 장벽 크림의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 27,
    "name": "판테놀 진정 크림",
    "category": "화장품",
    "price": 20800,
    "stock": 52,
    "image": "img/product-27.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "판테놀 진정 크림의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 28,
    "name": "시카 밸런스 토너",
    "category": "화장품",
    "price": 25500,
    "stock": 59,
    "image": "img/product-28.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "시카 밸런스 토너의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 29,
    "name": "데일리 선크림 SPF50+",
    "category": "화장품",
    "price": 30200,
    "stock": 66,
    "image": "img/product-29.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "데일리 선크림 SPF50+의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 30,
    "name": "저자극 클렌징 젤",
    "category": "화장품",
    "price": 34900,
    "stock": 73,
    "image": "img/product-30.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "저자극 클렌징 젤의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 31,
    "name": "약산성 폼 클렌저",
    "category": "화장품",
    "price": 39600,
    "stock": 80,
    "image": "img/product-31.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "약산성 폼 클렌저의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 32,
    "name": "비타민C 브라이트 세럼",
    "category": "화장품",
    "price": 44300,
    "stock": 87,
    "image": "img/product-32.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "비타민C 브라이트 세럼의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 33,
    "name": "레티놀 나이트 세럼",
    "category": "화장품",
    "price": 11000,
    "stock": 18,
    "image": "img/product-33.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "레티놀 나이트 세럼의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 34,
    "name": "무향 바디로션",
    "category": "화장품",
    "price": 15700,
    "stock": 25,
    "image": "img/product-34.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "무향 바디로션의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 35,
    "name": "시어버터 핸드크림",
    "category": "화장품",
    "price": 20400,
    "stock": 32,
    "image": "img/product-35.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "시어버터 핸드크림의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 36,
    "name": "너리싱 립밤",
    "category": "화장품",
    "price": 25100,
    "stock": 39,
    "image": "img/product-36.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "너리싱 립밤의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 37,
    "name": "스칼프 밸런스 샴푸",
    "category": "화장품",
    "price": 29800,
    "stock": 46,
    "image": "img/product-37.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "스칼프 밸런스 샴푸의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 38,
    "name": "헤어 리페어 트리트먼트",
    "category": "화장품",
    "price": 34500,
    "stock": 53,
    "image": "img/product-38.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "헤어 리페어 트리트먼트의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 39,
    "name": "수분 미스트",
    "category": "화장품",
    "price": 39200,
    "stock": 60,
    "image": "img/product-39.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "수분 미스트의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 40,
    "name": "데일리 아이크림",
    "category": "화장품",
    "price": 43900,
    "stock": 67,
    "image": "img/product-40.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "데일리 아이크림의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 41,
    "name": "진정 토너 패드",
    "category": "화장품",
    "price": 10600,
    "stock": 74,
    "image": "img/product-41.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "진정 토너 패드의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 42,
    "name": "소프트 클렌징 오일",
    "category": "화장품",
    "price": 15300,
    "stock": 81,
    "image": "img/product-42.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "소프트 클렌징 오일의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 43,
    "name": "불소 치약",
    "category": "의약외품",
    "price": 20000,
    "stock": 88,
    "image": "img/product-43.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "불소 치약의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 44,
    "name": "구강청결액",
    "category": "의약외품",
    "price": 24700,
    "stock": 19,
    "image": "img/product-44.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "구강청결액의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 45,
    "name": "일회용 반창고",
    "category": "의약외품",
    "price": 29400,
    "stock": 26,
    "image": "img/product-45.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "일회용 반창고의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 46,
    "name": "방수형 반창고",
    "category": "의약외품",
    "price": 34100,
    "stock": 33,
    "image": "img/product-46.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "방수형 반창고의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 47,
    "name": "보건용 마스크 KF94",
    "category": "의약외품",
    "price": 38800,
    "stock": 40,
    "image": "img/product-47.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "보건용 마스크 KF94의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 48,
    "name": "손 소독겔",
    "category": "의약외품",
    "price": 43500,
    "stock": 47,
    "image": "img/product-48.webp",
    "tag": "데일리",
    "purchasable": true,
    "description": "손 소독겔의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 49,
    "name": "여성용 위생 패드",
    "category": "의약외품",
    "price": 10200,
    "stock": 54,
    "image": "img/product-49.webp",
    "tag": "추천",
    "purchasable": true,
    "description": "여성용 위생 패드의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  },
  {
    "id": 50,
    "name": "멸균 거즈 패드",
    "category": "의약외품",
    "price": 14900,
    "stock": 61,
    "image": "img/product-50.webp",
    "tag": "NEW",
    "purchasable": true,
    "description": "멸균 거즈 패드의 데모 상품 정보입니다. 실제 상품의 표시사항과 설명을 확인해 주세요."
  }
];

/* 픽업용 매장 예시. 실제 사업 시 별도 stores 테이블로 이전합니다. */
const STORES = [
  { id: "wh", name: "온라인 물류센터", pickup: false },
  { id: "seoul", name: "하우웰 서울점 (체험)", pickup: true },
  { id: "cheonan", name: "하우웰 천안점 (체험)", pickup: true }
];
// 회원/인증 정보는 앱 코드에서 localStorage로 저장하지 않습니다.
// Supabase Auth SDK가 자체적으로 세션 토큰을 관리합니다(원본 비밀번호 저장 안 함).
// 주문은 아직 다음 과제 대상이므로 새로고침 전까지만 메모리에 보관합니다.
const KEYS = { cart: "howell_cart_v1", inventory: "howell_inventory_v1" };
const getStored = (key, fallback) => { try { const raw=localStorage.getItem(key); return raw===null?fallback:JSON.parse(raw); } catch { return fallback; } };
const save = (key,data) => localStorage.setItem(key,JSON.stringify(data));
// 구버전 체험 회원(ID, salt, password hash 등)과 연결된 주문 기록을 제거합니다.
// 기존 체험 회원은 Supabase Auth 계정으로 자동 이전되지 않습니다.
try {
  for (const legacyKey of ["howell_members_v1", "howell_current_v1", "howell_orders_v1", "howell_order_items_v1"]) {
    localStorage.removeItem(legacyKey);
  }
} catch(error) {
  console.warn("구버전 로컬 회원정보 정리 실패:", error);
}
const money = n => Number(n).toLocaleString("ko-KR")+"원";
const safe = text => String(text).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
const $ = selector => document.querySelector(selector);
const initialInventory = () => Object.fromEntries(PRODUCTS.filter(p=>p.purchasable).flatMap(p=>STORES.map(s=>[
  `${s.id}:${p.id}`, s.id==="wh"?p.stock:Math.max(0,Math.floor(p.stock/(s.id==="seoul"?4:3))-(p.id%7===0?9:0))
])));
let currentUser = null; // Supabase Auth의 현재 사용자(메모리에만 참조)
let profile = null;     // public.shop_profiles에서 읽은 내 회원정보(메모리에만 참조)
let authRequestVersion = 0;
let orders = [], orderItems = []; // 체험 주문은 현재 페이지의 메모리에만 유지
let cart=getStored(KEYS.cart,[]),inventory=getStored(KEYS.inventory,initialInventory());
let activeCategory="전체",searchTerm="",sortBy="id",detailId=null,detailQty=1;
let slideIndex=0,slideTimer=null,toastTimer=null;
const currentMember = () => currentUser ? profile : null;
const tierFor = grade => MEMBERSHIP_TIERS.find(t=>t.grade===grade)||MEMBERSHIP_TIERS[0];
const available = (storeId,id) => Math.max(0,Number(inventory[`${storeId}:${id}`]??0));
const maxAvailable = id => Math.max(...STORES.map(s=>available(s.id,id)));
const cartRows = () => cart.map(row=>({...row,product:PRODUCTS.find(p=>p.id===row.id)})).filter(row=>row.product&&row.product.purchasable);
const subtotal = () => cartRows().reduce((sum,row)=>sum+row.product.price*row.qty,0);
const shipping = (sum,method="delivery") => method==="pickup"||sum>=40000?0:3000;
function toast(message){const el=$("#toast");el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3300);}
function renderHeader(){
  const loggedIn=Boolean(currentUser);
  const name=profile?.name || currentUser?.user_metadata?.name || currentUser?.email?.split("@")[0] || "회원";
  $("#authMenuButton").hidden=loggedIn;
  $("#profileMenuButton").hidden=!loggedIn;
  $("#logoutMenuButton").hidden=!loggedIn;
  $("#authLabel").textContent="로그인 · 회원가입";
  $("#profileName").textContent=`${name} 님`;
  const count=cart.reduce((n,x)=>n+x.qty,0);
  $("#cartCount").textContent=count;
  $("#cartTitleCount").textContent=count;
}
function renderTiers(){
  $("#tierCards").innerHTML=MEMBERSHIP_TIERS.map(t=>`<article class="tier-card"><span class="tier-icon" aria-hidden="true">${t.icon}</span><h3>${t.name}</h3><strong>${Math.round(t.rate*100)}%</strong><small>${t.label} · 구매금액 적립</small></article>`).join("");
}
function renderChips(){
  $("#categoryChips").innerHTML=CATEGORIES.map(c=>`<button class="chip ${c===activeCategory?'active':''}" type="button" data-cat="${c}" aria-pressed="${c===activeCategory}">${c==="의약품"?"의약품 정보":c}</button>`).join("");
  document.querySelectorAll(".nav-link[data-cat]").forEach(n=>{n.classList.toggle("current",n.dataset.cat===activeCategory);n.setAttribute("aria-current",n.dataset.cat===activeCategory?"page":"false");});
}
function renderProducts(){
  renderChips();
  let rows=PRODUCTS.filter(p=>(activeCategory==="전체"||p.category===activeCategory)&&(`${p.name} ${p.category} ${p.tag}`).toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
  if(sortBy==="low")rows.sort((a,b)=>(a.purchasable?0:1)-(b.purchasable?0:1)||a.price-b.price);
  if(sortBy==="high")rows.sort((a,b)=>(a.purchasable?0:1)-(b.purchasable?0:1)||b.price-a.price);
  if(sortBy==="name")rows.sort((a,b)=>a.name.localeCompare(b.name,"ko"));
  $("#searchStatus").textContent=`${rows.length}개 상품${searchTerm?` · ‘${searchTerm}’ 검색 결과`:""}${activeCategory!=="전체"?` · ${activeCategory}`:""}`;
  $("#emptyState").hidden=!!rows.length;
  $("#productGrid").innerHTML=rows.map(p=>{
    const stock=p.purchasable?available("wh",p.id):0;
    return `<article class="product-card"><button type="button" class="product-picture" data-detail="${p.id}" aria-label="${safe(p.name)} 상세 보기"><img src="./${p.image}" alt="${safe(p.name)} 상품 일러스트" loading="lazy"><span class="product-badge ${p.purchasable?'':'info'}">${p.purchasable?safe(p.tag):'매장 상담'}</span></button><div class="product-info"><span class="product-cat">${safe(p.category)}</span><button type="button" class="product-name" data-detail="${p.id}">${safe(p.name)}</button>${p.purchasable?`<div class="product-price">${money(p.price)}</div><div class="product-bottom"><small class="stock-note">${stock?`배송재고 ${stock}개`:'온라인 재고 없음'}</small><button class="mini-cart" type="button" data-add="${p.id}" aria-label="${safe(p.name)} 담기" ${maxAvailable(p.id)===0?'disabled':''}>＋</button></div>`:`<p class="medicine-hint">의약품 정보·매장 상담 전용</p><button type="button" class="btn btn-outline" data-detail="${p.id}">안내 보기</button>`}</div></article>`;
  }).join("");
}
function applyCategory(cat){activeCategory=CATEGORIES.includes(cat)?cat:"전체";searchTerm="";$("#searchInput").value="";renderProducts();$("#products").scrollIntoView({behavior:"smooth",block:"start"});}
function addToCart(id,qty=1){const p=PRODUCTS.find(x=>x.id===Number(id));if(!p||!p.purchasable){toast("의약품은 온라인 주문 대상이 아닙니다.");return;}
  const existing=cart.find(x=>x.id===p.id),next=(existing?.qty||0)+qty;
  if(next>maxAvailable(p.id)){toast("선택한 수량만큼 재고가 없습니다.");return;}
  if(existing)existing.qty=next;else cart.push({id:p.id,qty:next});save(KEYS.cart,cart);renderHeader();renderCart();toast(`${p.name}을(를) 장바구니에 담았습니다.`);
}
function changeCart(id,delta){const r=cart.find(x=>x.id===id);if(!r)return;const next=r.qty+delta;if(next<1){removeCart(id);return;}if(next>maxAvailable(id)){toast("현재 재고 수량을 초과할 수 없습니다.");return;}r.qty=next;save(KEYS.cart,cart);renderHeader();renderCart();}
function removeCart(id){cart=cart.filter(x=>x.id!==id);save(KEYS.cart,cart);renderHeader();renderCart();}
function renderCart(){const rows=cartRows(),sub=subtotal();
  $("#cartItems").innerHTML=rows.length?rows.map(r=>`<article class="cart-item"><img src="./${r.product.image}" alt="${safe(r.product.name)}"><div><h4>${safe(r.product.name)}</h4><p>${money(r.product.price*r.qty)}</p><div class="cart-item-bottom"><div class="qty-controls"><button type="button" data-qty="${r.id}" data-delta="-1" aria-label="수량 감소">−</button><span>${r.qty}</span><button type="button" data-qty="${r.id}" data-delta="1" aria-label="수량 증가">＋</button></div><button class="text-btn" type="button" data-remove="${r.id}">삭제</button></div></div></article>`).join(""):`<div class="cart-empty"><h3>장바구니가 비어 있어요</h3><p>필요한 상품을 골라 담아보세요.</p><button class="btn btn-outline" type="button" data-close>상품 둘러보기</button></div>`;
  $("#cartSubtotal").textContent=money(sub);$("#cartShipping").textContent=money(rows.length?shipping(sub):0);$("#cartTotal").textContent=money(rows.length?sub+shipping(sub):0);$("#cartCheckout").disabled=!rows.length;
}
function openCart(){closeModal();renderCart();$("#cartShade").hidden=false;$("#cartPanel").hidden=false;document.body.style.overflow="hidden";}
function closeCart(){$("#cartShade").hidden=true;$("#cartPanel").hidden=true;document.body.style.overflow="";}
function closeModal(){$("#modalBackdrop").hidden=true;document.querySelectorAll("#modalBackdrop .dialog").forEach(d=>d.hidden=true);document.body.style.overflow="";}
function showModal(name){closeCart();$("#modalBackdrop").hidden=false;document.querySelectorAll("#modalBackdrop .dialog").forEach(d=>d.hidden=true);$("#"+name+"Modal").hidden=false;document.body.style.overflow="hidden";}
function setAuthMode(mode){const signup=mode==="signup";$("#loginForm").hidden=signup;$("#signupForm").hidden=!signup;$("#loginTab").classList.toggle("active",!signup);$("#signupTab").classList.toggle("active",signup);$("#authHeading").textContent=signup?"하우웰 회원가입":"하우웰 로그인";}
function openAuth(mode="login"){setAuthMode(mode);showModal("auth");}
function renderDetail(){const p=PRODUCTS.find(x=>x.id===detailId);if(!p)return;
  const amount=p.purchasable?`<div class="detail-price">${money(p.price)}</div><div class="qty-controls"><button type="button" data-action="detail-minus" aria-label="수량 감소">−</button><span id="detailQty">${detailQty}</span><button type="button" data-action="detail-plus" aria-label="수량 증가">＋</button></div><p>매장별 보유 재고는 체험 주문 단계에서 확인할 수 있습니다.</p><div class="detail-actions"><button class="btn btn-primary full" type="button" data-action="detail-add">장바구니에 담기</button></div>`:`<div class="detail-warning">의약품은 온라인 판매·결제 대상이 아닙니다. 제품 선택 및 복용은 약사 등 전문가와 상의해 주세요. 이 화면은 정보 제공용 예시입니다.</div>`;
  $("#detailContent").innerHTML=`<div class="detail-layout"><img src="./${p.image}" alt="${safe(p.name)} 상품 일러스트"><div class="detail-info"><span class="product-cat">HOWELL · ${safe(p.category)}</span><h2>${safe(p.name)}</h2><p>${safe(p.description)}</p>${amount}</div></div>`;
}
function openDetail(id){detailId=Number(id);detailQty=1;renderDetail();showModal("detail");}
// 서버는 signup 메타데이터를 활용하여 shop_profiles를 자동 생성합니다.
// 클라이언트에서는 points / grade / role을 읽기만 하며 수정 요청에 넣지 않습니다.
function authErrorMessage(error, action="login") {
  const code=String(error?.code||"").toLowerCase();
  const message=String(error?.message||"").toLowerCase();
  if(code.includes("user_already_exists") || message.includes("already registered") || message.includes("already exists"))
    return "이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해 주세요.";
  if(code.includes("invalid_credentials") || message.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if(code.includes("email_not_confirmed") || message.includes("email not confirmed"))
    return "이메일 인증이 완료되지 않았습니다. 인증 메일을 확인해 주세요.";
  if(code.includes("weak_password") || message.includes("password should") || message.includes("password must"))
    return "비밀번호는 6자 이상으로 설정하고, 안내된 보안 조건을 충족해 주세요.";
  if(code.includes("email_address_invalid") || message.includes("invalid email"))
    return "올바른 이메일 주소를 입력해 주세요.";
  if(code.includes("over_email_send_rate_limit") || message.includes("rate limit") || message.includes("too many"))
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  if(message.includes("database error saving new user"))
    return "회원 정보 생성에 실패했습니다. Supabase의 shop_profiles 생성 트리거를 확인해 주세요.";
  if(code==="42501" || message.includes("permission denied"))
    return "회원 정보에 접근할 권한이 없습니다. Supabase RLS 정책을 확인해 주세요.";
  console.error(`Supabase ${action} 오류:`,error);
  return action==="signup" ? "회원가입에 실패했습니다. 입력값과 Supabase 설정을 확인해 주세요." :
    action==="profile" ? "회원정보 처리에 실패했습니다. 잠시 후 다시 시도해 주세요." :
    "로그인 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

async function loadMyProfile(userId) {
  const {data,error}=await db.from("shop_profiles")
    .select("id,email,name,phone,grade,points,role,created_at")
    .eq("id",userId).single();
  if(error) throw error;
  return data;
}

// 모든 페이지 로드 시 반드시 getSession으로 로그인 상태를 검사합니다.
async function syncAuthState() {
  const version=++authRequestVersion;
  try {
    const {data,error}=await db.auth.getSession();
    if(error) throw error;
    if(version!==authRequestVersion) return;
    const user=data?.session?.user || null;
    currentUser=user;
    profile=null;
    renderHeader();
    if(!user) return;
    try {
      const fetched=await loadMyProfile(user.id);
      if(version!==authRequestVersion || currentUser?.id!==user.id) return;
      profile=fetched;
    } catch(error) {
      console.error("shop_profiles 조회 실패:",error);
      toast(authErrorMessage(error,"profile"));
    }
    renderHeader();
  } catch(error) {
    if(version!==authRequestVersion) return;
    currentUser=null;
    profile=null;
    renderHeader();
    console.error("Supabase 세션 확인 실패:",error);
  }
}

async function handleSignup(ev) {
  ev.preventDefault();
  const form=ev.currentTarget;
  const data=new FormData(form);
  const name=String(data.get("name")||"").trim();
  const phone=String(data.get("phone")||"").trim();
  const email=String(data.get("email")||"").trim().toLowerCase();
  const password=String(data.get("password")||"");
  const confirm=String(data.get("confirm")||"");
  if(name.length<2) {toast("이름을 2글자 이상 입력해 주세요.");return;}
  if(!phone) {toast("연락처를 입력해 주세요.");return;}
  if(password.length<6) {toast("비밀번호는 6자 이상 입력해 주세요.");return;}
  if(password!==confirm) {toast("비밀번호 확인이 일치하지 않습니다.");return;}
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  try {
    const {data:result,error}=await db.auth.signUp({
      email,password,options:{data:{name,phone}}
    });
    if(error) {toast(authErrorMessage(error,"signup"));return;}
    form.reset();
    closeModal();
    if(result?.session) {
      await syncAuthState();
      toast("회원가입이 완료되었습니다. 회원 등급과 3,000P는 DB에서 확인할 수 있습니다.");
    } else {
      // 이메일 중복 방지 정책에 따라 기존 계정인지 여부를 숨기는 경우도 있습니다.
      toast("가입 요청이 접수되었습니다. 이메일 인증이 필요하면 메일함을 확인해 주세요.");
    }
  } catch(error) {
    console.error("회원가입 실패:",error);
    toast("회원가입 요청에 실패했습니다. 네트워크 연결을 확인해 주세요.");
  } finally {button.disabled=false;}
}

async function handleLogin(ev) {
  ev.preventDefault();
  const form=ev.currentTarget;
  const data=new FormData(form);
  const email=String(data.get("email")||"").trim().toLowerCase();
  const password=String(data.get("password")||"");
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  try {
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error) {toast(authErrorMessage(error,"login"));return;}
    form.reset();
    closeModal();
    await syncAuthState();
    toast(`${profile?.name || currentUser?.email?.split("@")[0] || "회원"} 님, 환영합니다!`);
  } catch(error) {
    console.error("로그인 실패:",error);
    toast("로그인 요청에 실패했습니다. 네트워크 연결을 확인해 주세요.");
  } finally {button.disabled=false;}
}

async function handleLogout() {
  try {
    const {error}=await db.auth.signOut();
    if(error) {toast(authErrorMessage(error,"logout"));return;}
    ++authRequestVersion; // 이전 요청의 응답이 로그아웃 후 다시 적용되지 않도록 함
    currentUser=null;
    profile=null;
    orders=[];
    orderItems=[];
    closeModal();
    renderHeader();
    toast("로그아웃했습니다.");
  } catch(error) {
    console.error("로그아웃 실패:",error);
    toast("로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
}

function renderMyPage() {
  const m=currentMember();
  if(!m) return;
  const tier=tierFor(m.grade);
  const mine=orders.filter(o=>o.memberId===m.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  $("#mypageContent").innerHTML=`
    <span class="section-kicker">MY HOWELL</span>
    <h2>${safe(m.name||"회원")}님의 마이페이지</h2>
    <div class="mypage-overview">
      <div><small>현재 등급</small><br><strong>${safe(tier.name)}</strong><p class="mypage-info">DB 등급 ${safe(m.grade)} · 적립률 안내 ${Math.round(tier.rate*100)}%</p></div>
      <div><small>보유 포인트</small><br><strong>${Number(m.points||0).toLocaleString("ko-KR")}P</strong><p class="mypage-info">포인트는 DB에서 관리됩니다.</p></div>
    </div>
    <form id="profileEditForm" class="stack-form">
      <label>이메일<input type="email" value="${safe(m.email||currentUser?.email||"")}" readonly></label>
      <label>이름<input name="name" type="text" maxlength="30" minlength="2" value="${safe(m.name||"")}" autocomplete="name" required></label>
      <label>연락처<input name="phone" type="tel" maxlength="20" value="${safe(m.phone||"")}" autocomplete="tel" required></label>
      <p class="form-help">등급 · 포인트 · 관리자 권한은 조회만 가능하며 여기에서 수정할 수 없습니다.</p>
      <button class="btn btn-primary full" type="submit">이름 · 연락처 저장하기</button>
    </form>
    <div class="order-list"><h3>체험 주문 내역 (${mine.length}건)</h3>
      ${mine.length?mine.map(o=>{const items=orderItems.filter(it=>it.orderId===o.id);return `<article class="order-row"><h4>${safe(o.id)} <span class="product-cat">${o.receiveMethod==='pickup'?'매장 픽업':'배송'} · 체험 주문</span></h4><p>${safe(new Date(o.createdAt).toLocaleString('ko-KR'))} · ${items.map(it=>safe(it.name)+` ×${it.qty}`).join(', ')}</p><strong>${money(o.total)}</strong> <small> · 결제 없음</small></article>`;}).join(''):`<p class="form-help">아직 체험 주문 내역이 없습니다. 현재 단계에서는 주문이 DB에 저장되지 않습니다.</p>`}
    </div>
    <button class="btn btn-outline full" type="button" data-action="logout" style="margin-top:22px">로그아웃</button>`;
}

async function openMyPage() {
  if(!currentUser) {toast("마이페이지 이용을 위해 먼저 로그인해 주세요.");openAuth("login");return;}
  try {
    // 열 때마다 DB에서 내 회원정보를 다시 읽습니다.
    profile=await loadMyProfile(currentUser.id);
    renderHeader();
    renderMyPage();
    showModal("mypage");
  } catch(error) {
    console.error("마이페이지 조회 실패:",error);
    toast(authErrorMessage(error,"profile"));
  }
}

async function handleProfileUpdate(ev) {
  ev.preventDefault();
  if(!currentUser) {openAuth("login");return;}
  const form=ev.target;
  const data=new FormData(form);
  const name=String(data.get("name")||"").trim();
  const phone=String(data.get("phone")||"").trim();
  if(name.length<2) {toast("이름을 2글자 이상 입력해 주세요.");return;}
  if(!phone) {toast("연락처를 입력해 주세요.");return;}
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  try {
    const userId=currentUser.id;
    const {data:updated,error}=await db.from("shop_profiles")
      .update({name,phone}) // 절대로 grade / points / role을 UPDATE하지 않음
      .eq("id",userId)
      .select("id,email,name,phone,grade,points,role,created_at")
      .single();
    if(error) {toast(authErrorMessage(error,"profile"));return;}
    if(currentUser?.id!==userId) return;
    profile=updated;
    renderHeader();
    renderMyPage();
    toast("회원정보가 저장되었습니다.");
  } catch(error) {
    console.error("프로필 수정 실패:",error);
    toast("회원정보 저장에 실패했습니다. 네트워크 연결을 확인해 주세요.");
  } finally {button.disabled=false;}
}

function renderCheckout(){const m=currentMember();if(!m)return;const form=$("#checkoutForm");form.reset();form.elements.receiver.value=m.name;$("#pickupStore").innerHTML=STORES.filter(s=>s.pickup).map(s=>`<option value="${s.id}">${safe(s.name)}</option>`).join('');updateCheckout();}
function updateCheckout(){const form=$("#checkoutForm"),m=currentMember();if(!m)return;const method=form.elements.receiveMethod.value,sub=subtotal(),fee=shipping(sub,method),storeId=method==='pickup'?form.elements.pickupStore.value:'wh';
 $("#deliveryFields").hidden=method!=="delivery";$("#pickupFields").hidden=method!=="pickup";const bad=cartRows().filter(r=>available(storeId,r.id)<r.qty);
 $("#pickupInventory").textContent=method==='pickup'?(bad.length?`재고 부족: ${bad.map(x=>x.product.name).join(', ')}. 다른 매장을 선택해 주세요.`:`선택 매장의 모든 상품이 준비 가능합니다. (체험용 재고)`):'';
 const pInput=$("#usePoints"),used=0; // 회원 포인트는 이번 단계에서 조회만 함
 pInput.value="0";
 $("#checkoutSummary").innerHTML=`<div class="price-row"><span>상품금액</span><strong>${money(sub)}</strong></div><div class="price-row"><span>${method==='pickup'?'매장 픽업':'배송비'}</span><strong>${money(fee)}</strong></div><div class="price-row"><span>보유 포인트</span><strong>${m.points.toLocaleString()}P</strong></div>`;
 $("#checkoutTotal").innerHTML=`<div class="price-row"><span>포인트 사용</span><strong>−${used.toLocaleString()}P</strong></div><div class="price-row"><span>최종 체험 주문금액</span><strong>${money(sub+fee-used)}</strong></div><p class="form-help" style="margin:0">현재 ${tierFor(m.grade).name} 등급 · 예상 적립 ${Math.floor((sub-used)*tierFor(m.grade).rate).toLocaleString()}P</p>`;
}
function openCheckout(){if(!cartRows().length){toast("장바구니가 비어 있습니다.");return;}if(!currentMember()){closeCart();toast("체험 주문을 위해 로그인해 주세요.");openAuth();return;}showModal("checkout");renderCheckout();}
function handleCheckout(ev){ev.preventDefault();const m=currentMember();if(!m){openAuth();return;}const form=ev.currentTarget,method=form.elements.receiveMethod.value,storeId=method==='pickup'?form.elements.pickupStore.value:'wh',rows=cartRows();if(!rows.length){toast("장바구니가 비어 있습니다.");return;}
 if(method==='delivery'&&(!form.elements.receiver.value.trim()||!form.elements.address.value.trim())){toast("체험용 수령인과 주소를 입력해 주세요. 실제 주소는 입력하지 마세요.");return;}
 if(rows.some(r=>available(storeId,r.id)<r.qty)){toast("해당 처리 거점의 재고가 부족합니다. 상품 수량이나 매장을 변경해 주세요.");updateCheckout();return;}
 const sub=subtotal(),fee=shipping(sub,method),used=0,tier=tierFor(m.grade),earned=Math.floor(sub*tier.rate);
 const order={id:`HW-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`,memberId:m.id,receiveMethod:method,storeId,status:'체험 주문 완료',subtotal:sub,shippingFee:fee,pointsUsed:used,total:sub+fee-used,earned,createdAt:new Date().toISOString()};
 orders.push(order);for(const r of rows){orderItems.push({orderId:order.id,productId:r.id,name:r.product.name,price:r.product.price,qty:r.qty});inventory[`${storeId}:${r.id}`]=available(storeId,r.id)-r.qty;}
 // 이번 단계의 주문은 서버 결제/DB 주문이 아닌 임시 메모리 기록입니다.
 // DB 포인트/등급은 주문이벤트에서 임의로 변경하지 않습니다.
 save(KEYS.inventory,inventory);cart=[];save(KEYS.cart,cart);
 renderHeader();renderCart();renderProducts();openMyPage();
 toast(`체험 주문 ${order.id} 작성 완료 · DB 주문/포인트 미반영`);
}
function setSlide(index){const slides=[...document.querySelectorAll('.hero-slide')];slideIndex=(index+slides.length)%slides.length;slides.forEach((s,i)=>{s.classList.toggle('active',i===slideIndex);s.setAttribute('aria-hidden',String(i!==slideIndex));s.querySelectorAll('button').forEach(b=>b.tabIndex=i===slideIndex?0:-1);});document.querySelectorAll('#heroDots button').forEach((b,i)=>{b.classList.toggle('active',i===slideIndex);b.setAttribute('aria-pressed',String(i===slideIndex));});}
function restartSlides(){clearInterval(slideTimer);slideTimer=setInterval(()=>setSlide(slideIndex+1),6000);}
function initSlides(){const dots=$('#heroDots');dots.innerHTML=[0,1,2,3].map(i=>`<button type="button" data-slide="${i}" aria-label="${i+1}번 배너" aria-pressed="false"></button>`).join('');setSlide(0);restartSlides();}

/* 이벤트 — 정적 페이지에서만 동작. 데이터는 추후 API 호출로 교체하세요. */
document.addEventListener('click',event=>{
 const e=event.target.closest('button,a');if(!e)return;
 if(e.hasAttribute('data-close')){closeModal();closeCart();return;}
 if(e.dataset.cat){applyCategory(e.dataset.cat);return;}
 if(e.dataset.open){const where=e.dataset.open;if(where==='auth')openAuth(e.dataset.mode||'login');if(where==='cart')openCart();if(where==='mypage')openMyPage();return;}
 if(e.dataset.mode){setAuthMode(e.dataset.mode);return;}
 if(e.dataset.add){addToCart(Number(e.dataset.add));return;}
 if(e.dataset.detail){openDetail(Number(e.dataset.detail));return;}
 if(e.dataset.qty){changeCart(Number(e.dataset.qty),Number(e.dataset.delta));return;}
 if(e.dataset.remove){removeCart(Number(e.dataset.remove));return;}
 if(e.dataset.slide){setSlide(Number(e.dataset.slide));restartSlides();return;}
 if(e.dataset.action==='detail-plus'){detailQty=Math.min(detailQty+1,99);$('#detailQty').textContent=detailQty;return;}
 if(e.dataset.action==='detail-minus'){detailQty=Math.max(1,detailQty-1);$('#detailQty').textContent=detailQty;return;}
 if(e.dataset.action==='detail-add'){addToCart(detailId,detailQty);closeModal();openCart();return;}
 if(e.dataset.action==='logout'){void handleLogout();return;}
});
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();searchTerm=$('#searchInput').value.trim();activeCategory='전체';renderProducts();$('#products').scrollIntoView({behavior:'smooth'});});
$('#searchInput').addEventListener('input',e=>{searchTerm=e.target.value.trim();if(!searchTerm&&activeCategory==='전체')renderProducts();});
$('#sortSelect').addEventListener('change',e=>{sortBy=e.target.value;renderProducts();});
$('#resetFilter').addEventListener('click',()=>applyCategory('전체'));
$('#heroPrev').addEventListener('click',()=>{setSlide(slideIndex-1);restartSlides();});
$('#heroNext').addEventListener('click',()=>{setSlide(slideIndex+1);restartSlides();});
$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});
$('#cartShade').addEventListener('click',closeCart);
$('#cartCheckout').addEventListener('click',openCheckout);
$('#loginForm').addEventListener('submit',handleLogin);
$('#signupForm').addEventListener('submit',handleSignup);
document.addEventListener('submit',e=>{if(e.target.id==='profileEditForm')void handleProfileUpdate(e);});
$('#checkoutForm').addEventListener('submit',handleCheckout);
$('#checkoutForm').addEventListener('input',updateCheckout);
$('#checkoutForm').addEventListener('change',updateCheckout);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeCart();}});
renderHeader();renderTiers();renderProducts();renderCart();initSlides();
// 모든 페이지 방문/새로고침마다 인증 세션을 확인합니다.
void syncAuthState();
// 다른 탭에서의 로그인/로그아웃도 반영합니다.
// 콜백 안에서 Supabase API를 직접 await하지 않아 인증 잠금을 피합니다.
db.auth.onAuthStateChange(()=>{setTimeout(()=>{void syncAuthState();},0);});
