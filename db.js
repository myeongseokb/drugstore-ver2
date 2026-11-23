/* HOWELL · Supabase 연결 설정 (과제 2: 연결 확인만 수행)
 * Publishable Key는 클라이언트에서 사용할 수 있는 공개 키입니다.
 * Secret Key, service_role 또는 DB 비밀번호를 여기에 넣지 마세요.
 */
const SUPABASE_URL = "https://ilslxnxrdprzupleensj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aCq1sARCYyz9z_c9Gz_pug_nIfH-G5H";

// 이후 다른 스크립트에서도 사용할 연결 변수: db
const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
window.db = db;

// 데이터 조회만 시험합니다. 쇼핑몰의 기존 기능은 변경하지 않습니다.
async function checkSupabaseConnection() {
  try {
    const { count, error } = await db
      .from("shop_products")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(error);
      return;
    }
    console.log(`연결 성공: 상품 ${count}개`);
  } catch (error) {
    console.error(error);
  }
}

checkSupabaseConnection();
