/* HOWELL · 6단계: Supabase 관리자 전용 페이지.
 * db는 기존 db.js에서 제공합니다. service_role/secret key를 사용하지 않습니다.
 * 화면의 role 확인과 별개로 권한은 Supabase RLS 및 RPC에서 다시 검사합니다.
 */
"use strict";
const $ = (selector) => document.querySelector(selector);
const GRADE_OPTIONS = ["WELCOME", "SILVER", "GOLD", "VIP"];
const ROLE_OPTIONS = ["member", "admin"];
const ORDER_STATUS_OPTIONS = ["결제완료", "배송중", "배송완료", "취소"];
const ADMIN_PAGE_SIZE = 500;
let adminUserId = null;
let members = [];
let orders = [];
let loading = false;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g,
    (ch) => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[ch]));
}
const formatMoney = (value) => `${Number(value || 0).toLocaleString("ko-KR")}원`;
const formatNumber = (value) => Number(value || 0).toLocaleString("ko-KR");
const formatDate = (value) => value ? new Date(value).toLocaleString("ko-KR") : "—";

function message(element, text, error = false) {
  const target = $(element);
  target.textContent = text;
  target.classList.toggle("error", error);
}
function redirectToStore() { window.location.replace("./index.html"); }

async function verifyAdmin() {
  const {data:auth, error:authError} = await db.auth.getSession();
  if (authError) throw authError;
  const user = auth?.session?.user;
  if (!user) { redirectToStore(); return false; }

  const {data:profile, error:profileError} = await db.from("shop_profiles")
    .select("id,name,email,role").eq("id", user.id).single();
  if (profileError) throw profileError;
  if (profile?.role !== "admin") { redirectToStore(); return false; }
  adminUserId = user.id;
  $("#adminUser").textContent = `${profile.name || profile.email || "관리자"} 님`;
  return true;
}

// Supabase의 기본 최대 반환 행 수(보통 1,000건)를 넘는 경우도 누락하지 않도록 페이지별 조회.
async function fetchAll(table, columns, orderBy) {
  const all = [];
  for (let offset = 0; ; offset += ADMIN_PAGE_SIZE) {
    let query = db.from(table).select(columns)
      .order(orderBy, {ascending: table !== "shop_orders"});
    // 동일한 생성 시각의 행도 항상 일정한 순서로 페이지를 나눕니다.
    query = query.order("id", {ascending: table !== "shop_orders"});
    const {data, error} = await query.range(offset, offset + ADMIN_PAGE_SIZE - 1);
    if (error) throw error;
    const page = data || [];
    all.push(...page);
    if (page.length < ADMIN_PAGE_SIZE) break;
  }
  return all;
}

function optionTags(values, selected) {
  return values.map(v => `<option value="${escapeHtml(v)}" ${v === selected ? "selected" : ""}>${escapeHtml(v)}</option>`).join("");
}

function renderMembers() {
  const search = $("#memberSearch").value.trim().toLocaleLowerCase("ko-KR");
  const grade = $("#gradeFilter").value;
  const filtered = members.filter(m =>
    (!search || String(m.name || "").toLocaleLowerCase("ko-KR").includes(search)) &&
    (grade === "전체" || m.grade === grade)
  );
  $("#memberResultCount").textContent = `${filtered.length}명 표시 / 전체 ${members.length}명`;
  $("#memberBody").innerHTML = filtered.length ? filtered.map(m => `
    <tr data-user-id="${escapeHtml(m.id)}">
      <td>${escapeHtml(m.name || "(이름 없음)")}</td>
      <td class="email">${escapeHtml(m.email || "—")}</td>
      <td>${escapeHtml(m.phone || "—")}</td>
      <td><label class="sr-only" for="grade-${escapeHtml(m.id)}">${escapeHtml(m.name)} 등급</label>
        <select id="grade-${escapeHtml(m.id)}" class="member-grade">${optionTags(GRADE_OPTIONS, m.grade)}</select></td>
      <td><label class="sr-only" for="points-${escapeHtml(m.id)}">${escapeHtml(m.name)} 포인트</label>
        <input id="points-${escapeHtml(m.id)}" class="member-points points-input" type="number" min="0" max="2147483647" step="1" required value="${Number(m.points)}"></td>
      <td><label class="sr-only" for="role-${escapeHtml(m.id)}">${escapeHtml(m.name)} 역할</label>
        <select id="role-${escapeHtml(m.id)}" class="member-role">${optionTags(ROLE_OPTIONS, m.role)}</select></td>
      <td class="num muted">${escapeHtml(formatDate(m.created_at))}</td>
      <td><button type="button" class="save-btn" data-save-member>저장</button></td>
    </tr>`).join("") : `<tr><td colspan="8" class="muted">검색 조건에 맞는 회원이 없습니다.</td></tr>`;
}

function renderOrders() {
  const memberById = new Map(members.map(m => [m.id, m]));
  $("#orderResultCount").textContent = `총 ${orders.length}건`;
  $("#orderBody").innerHTML = orders.length ? orders.map(o => {
    const person = memberById.get(o.user_id);
    const account = person?.name || person?.email || `회원 ${String(o.user_id).slice(0, 8)}…`;
    const selected = ORDER_STATUS_OPTIONS.includes(o.status) ? o.status : "";
    const unknown = selected ? "" : `<option value="" selected disabled>기존 상태: ${escapeHtml(o.status || "미지정")}</option>`;
    return `<tr data-order-id="${escapeHtml(o.id)}">
      <td class="num">#${escapeHtml(o.id)}</td>
      <td>${escapeHtml(account)}</td>
      <td class="num muted">${escapeHtml(formatDate(o.created_at))}</td>
      <td class="num"><strong>${formatMoney(o.total)}</strong></td>
      <td><label class="sr-only" for="status-${escapeHtml(o.id)}">주문 ${escapeHtml(o.id)} 상태</label>
        <select id="status-${escapeHtml(o.id)}" class="order-status">${unknown}${optionTags(ORDER_STATUS_OPTIONS, selected)}</select></td>
      <td><button class="save-btn" type="button" data-save-order>저장</button></td>
    </tr>`;
  }).join("") : `<tr><td colspan="6" class="muted">등록된 주문이 없습니다.</td></tr>`;
}

function renderSummary() {
  $("#memberCount").textContent = `${formatNumber(members.length)}명`;
  $("#orderCount").textContent = `${formatNumber(orders.length)}건`;
  // 취소 포함 모든 주문의 total을 합산합니다.
  const sum = orders.reduce((total, order) => total + Number(order.total || 0), 0);
  $("#orderTotal").textContent = formatMoney(sum);
}

async function refreshData() {
  if (loading) return;
  loading = true;
  $("#refreshBtn").disabled = true;
  message("#pageStatus", "회원 및 주문 데이터를 불러오는 중…");
  try {
    // 새로고침에서도 관리자 권한을 다시 확인합니다.
    if (!(await verifyAdmin())) return;
    const [memberData, orderData] = await Promise.all([
      fetchAll("shop_profiles", "id,email,name,phone,grade,points,role,created_at", "created_at"),
      fetchAll("shop_orders", "id,user_id,total,status,created_at", "created_at")
    ]);
    members = memberData;
    orders = orderData;
    renderSummary();
    renderMembers();
    renderOrders();
    message("#pageStatus", "최신 데이터로 갱신했습니다.");
  } catch (error) {
    console.error("관리자 데이터 조회 실패:", error);
    message("#pageStatus", `데이터를 불러오지 못했습니다: ${error.message || "RLS 및 SQL 설치 상태를 확인해 주세요."}`, true);
  } finally {
    loading = false;
    $("#refreshBtn").disabled = false;
  }
}

async function saveMember(button) {
  const tr = button.closest("tr[data-user-id]");
  if (!tr || button.disabled) return;
  const userId = tr.dataset.userId;
  const grade = tr.querySelector(".member-grade").value;
  const role = tr.querySelector(".member-role").value;
  const pointsRaw = tr.querySelector(".member-points").value.trim();
  const points = Number(pointsRaw);
  if (!GRADE_OPTIONS.includes(grade) || !ROLE_OPTIONS.includes(role) ||
      !/^\d+$/.test(pointsRaw) || !Number.isSafeInteger(points) || points > 2147483647) {
    message("#memberMessage", "등급·역할을 확인하고 포인트에는 0 이상의 정수를 입력해 주세요.", true);
    return;
  }
  button.disabled = true;
  message("#memberMessage", "회원 변경사항 저장 중…");
  try {
    // profiles 테이블에 직접 update하지 않습니다. 이 전용 RPC로만 등급·포인트·역할을 수정합니다.
    const {error} = await db.rpc("shop_admin_update_member", {
      p_user_id: userId, p_grade: grade, p_points: points, p_role: role
    });
    if (error) throw error;
    const {data:updated, error:readError} = await db.from("shop_profiles")
      .select("id,email,name,phone,grade,points,role,created_at").eq("id", userId).single();
    if (readError) throw readError;
    members = members.map(m => m.id === userId ? updated : m);
    renderMembers();
    renderOrders();
    message("#memberMessage", `${updated.name || updated.email || "회원"}님의 등급·포인트·역할을 저장했습니다.`);
    if (userId === adminUserId && updated.role !== "admin") redirectToStore();
  } catch (error) {
    console.error("관리자 회원 변경 실패:", error);
    message("#memberMessage", `회원 저장 실패: ${error.message || "권한 또는 입력값을 확인해 주세요."}`, true);
    button.disabled = false;
  }
}

async function saveOrder(button) {
  const tr = button.closest("tr[data-order-id]");
  if (!tr || button.disabled) return;
  const orderId = tr.dataset.orderId;
  const status = tr.querySelector(".order-status").value;
  if (!ORDER_STATUS_OPTIONS.includes(status)) {
    message("#orderMessage", "주문 상태를 선택해 주세요.", true);
    return;
  }
  button.disabled = true;
  message("#orderMessage", "주문 상태 저장 중…");
  try {
    // 주문 상태만 업데이트합니다. 금액·user_id·재고·포인트는 수정하지 않습니다.
    const {data:updated, error} = await db.from("shop_orders")
      .update({status}).eq("id", orderId).select("id,status").single();
    if (error) throw error;
    orders = orders.map(o => String(o.id) === String(orderId) ? {...o, status: updated.status} : o);
    renderOrders();
    message("#orderMessage", `주문 #${orderId} 상태를 ${updated.status}(으)로 저장했습니다.`);
  } catch (error) {
    console.error("관리자 주문 상태 변경 실패:", error);
    message("#orderMessage", `주문 상태 저장 실패: ${error.message || "RLS 권한을 확인해 주세요."}`, true);
    button.disabled = false;
  }
}

async function startAdmin() {
  try {
    if (!(await verifyAdmin())) return;
    $("#guard").hidden = true;
    $("#adminMain").hidden = false;
    await refreshData();
  } catch (error) {
    console.error("관리자 권한 검증 실패:", error);
    $("#guard").textContent = `권한을 확인할 수 없습니다: ${error.message || "네트워크 상태를 확인해 주세요."}`;
    $("#guard").classList.add("error");
    // 권한 확인 실패 시 관리자 정보는 표시하지 않습니다.
    $("#adminMain").hidden = true;
  }
}

$("#memberSearch").addEventListener("input", renderMembers);
$("#gradeFilter").addEventListener("change", renderMembers);
$("#refreshBtn").addEventListener("click", () => { void refreshData(); });
$("#adminLogout").addEventListener("click", async () => {
  const {error} = await db.auth.signOut();
  if (error) { message("#pageStatus", `로그아웃 실패: ${error.message}`, true); return; }
  redirectToStore();
});
document.addEventListener("click", (event) => {
  const memberButton = event.target.closest("[data-save-member]");
  if (memberButton) { void saveMember(memberButton); return; }
  const orderButton = event.target.closest("[data-save-order]");
  if (orderButton) { void saveOrder(orderButton); }
});
db.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") redirectToStore();
});
void startAdmin();
