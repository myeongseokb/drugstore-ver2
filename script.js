/* HOWELL · 과제 4: 상품 목록/검색/상세는 Supabase shop_products에서 조회. */
/* 회원 기능은 과제 3의 Supabase Auth와 shop_profiles를 그대로 사용합니다. */
const CATEGORIES = ["전체", "건강식품", "화장품", "의약외품", "의약품"];
const MEMBERSHIP_TIERS = [
  { grade: "WELCOME", name: "GREEN", rate: 0.01, label: "기본 회원", icon: "☘" },
  { grade: "SILVER", name: "SILVER", rate: 0.03, label: "누적 10만원", icon: "✧" },
  { grade: "GOLD", name: "GOLD", rate: 0.05, label: "누적 30만원", icon: "✦" },
  { grade: "VIP", name: "PLATINUM", rate: 0.07, label: "누적 60만원", icon: "◆" }
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
/* 장바구니에만 DB 상품 id와 수량을 저장합니다. 회원·비밀번호·재고는 저장하지 않습니다. */
const KEYS = { cart: "howell_cart_db_v1" };
const getStored = (key, fallback) => { try { const raw=localStorage.getItem(key); return raw===null?fallback:JSON.parse(raw); } catch { return fallback; } };
const save = (key,data) => localStorage.setItem(key,JSON.stringify(data));
// 과거 데모 데이터의 로컬 회원·주문·가상 재고 기록 제거(상품 재고는 DB만 사용).
try {
  for (const legacyKey of ["howell_members_v1", "howell_current_v1", "howell_orders_v1", "howell_order_items_v1", "howell_inventory_v1", "howell_cart_v1"]) {
    localStorage.removeItem(legacyKey);
  }
} catch (error) { console.warn("이전 체험 데이터 정리 실패:", error); }
const money = n => Number(n).toLocaleString("ko-KR")+"원";
const safe = text => String(text).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
const $ = selector => document.querySelector(selector);
const DEFAULT_IMAGE = "./img/product-placeholder.svg";
const PRODUCT_COLUMNS = "id,name,category,price,stock,image_url,is_active";
// DB에서 가져온 상품만 담는 화면 캐시; 하드코딩된 상품 데이터는 없습니다.
const productById = new Map();
let visibleProducts = [], listRequestVersion = 0, detailRequestVersion = 0;
let productLoadError = false, productLoading = false;
let currentUser = null, profile = null, authRequestVersion = 0;
let orders = [], orderItems = []; // 과제 5 전까지 체험 주문은 임시 메모리에만 기록
const savedCart = getStored(KEYS.cart, []);
let cart = Array.isArray(savedCart) ? savedCart
  .filter(row=>Number.isSafeInteger(Number(row?.id)) && Number(row.id)>0 && Number.isSafeInteger(Number(row.qty)) && Number(row.qty)>0)
  .map(row=>({id:Number(row.id),qty:Number(row.qty)})) : [];
let activeCategory="전체", searchTerm="", sortBy="id", detailId=null, detailQty=1;
let slideIndex=0, slideTimer=null, toastTimer=null, searchTimer=null;
const currentMember = () => currentUser ? profile : null;
const tierFor = grade => MEMBERSHIP_TIERS.find(t=>t.grade===grade)||MEMBERSHIP_TIERS[0];
const stockOf = p => Math.max(0, Number(p?.stock)||0);
const isMedicine = p => p?.category === "의약품";
const canPurchase = p => Boolean(p && p.is_active && !isMedicine(p) && stockOf(p)>0);
const cartRows = () => cart.map(row=>({...row,product:productById.get(row.id)||null}));
const subtotal = () => cartRows().reduce((sum,row)=>sum+(row.product?Number(row.product.price)*row.qty:0),0);
const shipping = (sum,method="delivery") => method==="pickup"||sum>=40000?0:3000;
function toast(message){const el=$("#toast");el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3300);}
function productImageUrl(product){
  const path=String(product?.image_url||"").trim();
  // 이 과제에서는 img/ 안의 상대경로만 사용합니다. 값이 없거나 비정상적이면 기본 그림.
  if(!path || /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(path) || path.split("/").includes("..")) return DEFAULT_IMAGE;
  return path.startsWith("./") ? path : `./${path}`;
}
// 경로가 있어도 이미지 파일이 삭제되었다면 기본 그림으로 교체합니다.
document.addEventListener("error",event=>{
  const target=event.target;
  if(target?.tagName==="IMG" && target.closest(".product-picture,.detail-layout,.cart-item") && !target.src.endsWith("/img/product-placeholder.svg")) {
    target.src=DEFAULT_IMAGE;
  }
},true);
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
function escapeIlike(text){ return text.replace(/[\\%_]/g, match=>`\\${match}`); }
function paintProducts(){
  renderChips();
  if(productLoading) return;
  const rows=[...visibleProducts];
  // DB는 항상 id 오름차순으로 조회; 사용자가 정렬 메뉴를 고르면 표시 순서만 바꿉니다.
  if(sortBy==="low") rows.sort((a,b)=>Number(isMedicine(a))-Number(isMedicine(b))||a.price-b.price||a.id-b.id);
  if(sortBy==="high") rows.sort((a,b)=>Number(isMedicine(a))-Number(isMedicine(b))||b.price-a.price||a.id-b.id);
  if(sortBy==="name") rows.sort((a,b)=>a.name.localeCompare(b.name,"ko")||a.id-b.id);
  $("#productHeadlineCount").textContent=String(rows.length);
  $("#emptyState").hidden=!!rows.length || productLoadError;
  $("#emptyState strong").textContent="상품이 없습니다";
  $("#searchStatus").textContent=productLoadError ? "상품 정보를 불러오지 못했습니다. 새로고침해 주세요." :
    `${rows.length}개 상품${searchTerm?` · ‘${searchTerm}’ 검색 결과`:""}${activeCategory!=="전체"?` · ${activeCategory}`:""}`;
  $("#productGrid").innerHTML=rows.map(p=>{
    const soldOut=stockOf(p)===0;
    const medicine=isMedicine(p);
    const badge=soldOut?"품절":medicine?"매장 상담":"HOWELL";
    const purchase=canPurchase(p);
    return `<article class="product-card"><button type="button" class="product-picture" data-detail="${p.id}" aria-label="${safe(p.name)} 상세 보기"><img src="${safe(productImageUrl(p))}" alt="${safe(p.name)} 상품 이미지" loading="lazy"><span class="product-badge ${soldOut||medicine?'info':''}">${badge}</span></button><div class="product-info"><span class="product-cat">${safe(p.category)}</span><button type="button" class="product-name" data-detail="${p.id}">${safe(p.name)}</button>${medicine?`<p class="medicine-hint">${soldOut?'품절 · ':''}의약품 정보·매장 상담 전용</p><button type="button" class="btn btn-outline" data-detail="${p.id}">안내 보기</button>`:`<div class="product-price">${money(p.price)}</div><div class="product-bottom"><small class="stock-note">${soldOut?'품절':`배송재고 ${stockOf(p)}개`}</small><button class="mini-cart" type="button" data-add="${p.id}" aria-label="${safe(p.name)} 담기" ${purchase?'':'disabled'}>${purchase?'＋':'품절'}</button></div>`}</div></article>`;
  }).join("");
}
async function loadProducts(){
  const request=++listRequestVersion;
  productLoadError=false;
  productLoading=true;
  renderChips();
  $("#searchStatus").textContent="불러오는 중";
  $("#productGrid").innerHTML="";
  $("#emptyState").hidden=true;
  try {
    let query=db.from("shop_products").select(PRODUCT_COLUMNS).eq("is_active",true);
    if(activeCategory!=="전체") query=query.eq("category",activeCategory);
    if(searchTerm) query=query.ilike("name",`%${escapeIlike(searchTerm)}%`);
    const {data,error}=await query.order("id",{ascending:true});
    if(error) throw error;
    if(request!==listRequestVersion) return;
    productLoading=false;
    visibleProducts=data||[];
    for(const p of visibleProducts) productById.set(Number(p.id),p);
    paintProducts();
    renderCart();
    // 저장된 장바구니 상품이 현재 필터 결과에 없을 때도 DB에서 개별 조회합니다.
    void hydrateCartProducts();
  } catch(error){
    if(request!==listRequestVersion) return;
    console.error("shop_products 상품 목록 조회 실패:",error);
    productLoadError=true;
    productLoading=false;
    visibleProducts=[];
    paintProducts();
    toast("상품 목록을 불러오지 못했습니다. Supabase 조회 권한을 확인해 주세요.");
  }
}
async function hydrateCartProducts(){
  const missing=[...new Set(cart.map(row=>row.id).filter(id=>!productById.has(id)))];
  if(!missing.length) return;
  try {
    const {data,error}=await db.from("shop_products").select(PRODUCT_COLUMNS)
      .eq("is_active",true).in("id",missing);
    if(error) throw error;
    for(const p of data||[]) productById.set(Number(p.id),p);
    renderCart();
  } catch(error){console.error("장바구니 상품 DB 조회 실패:",error);}
}
function applyCategory(cat){
  clearTimeout(searchTimer);
  activeCategory=CATEGORIES.includes(cat)?cat:"전체";
  searchTerm="";
  $("#searchInput").value="";
  void loadProducts();
  $("#products").scrollIntoView({behavior:"smooth",block:"start"});
}
function addToCart(id,qty=1){
  const p=productById.get(Number(id));
  if(!p){toast("상품 정보를 아직 불러오지 못했습니다.");return;}
  if(isMedicine(p)){toast("의약품은 온라인 주문 대상이 아닙니다.");return;}
  if(!canPurchase(p)){toast("품절된 상품은 장바구니에 담을 수 없습니다.");return;}
  const existing=cart.find(x=>x.id===Number(p.id));
  const next=(existing?.qty||0)+qty;
  if(next>stockOf(p)){toast("선택한 수량만큼 재고가 없습니다.");return;}
  if(existing) existing.qty=next;
  else cart.push({id:Number(p.id),qty:next});
  save(KEYS.cart,cart);
  renderHeader();renderCart();
  toast(`${p.name}을(를) 장바구니에 담았습니다.`);
}
function changeCart(id,delta){
  const r=cart.find(x=>x.id===id);if(!r)return;
  const next=r.qty+delta;
  if(next<1){removeCart(id);return;}
  const p=productById.get(id);
  if(delta>0 && (!canPurchase(p)||next>stockOf(p))){toast("현재 상품 재고 수량을 초과할 수 없습니다.");return;}
  r.qty=next;
  save(KEYS.cart,cart);renderHeader();renderCart();
}
function removeCart(id){cart=cart.filter(x=>x.id!==id);save(KEYS.cart,cart);renderHeader();renderCart();}
function canCheckoutCart(){
  const rows=cartRows();
  return rows.length>0 && rows.every(r=>canPurchase(r.product) && r.qty<=stockOf(r.product));
}
function renderCart(){
  const rows=cartRows(),sub=subtotal();
  $("#cartItems").innerHTML=rows.length?rows.map(r=>{
    const p=r.product;
    if(!p) return `<article class="cart-item"><div><h4>상품 정보 확인 중 · #${r.id}</h4><p>삭제되었거나 비공개 상품일 수 있습니다.</p><button class="text-btn" type="button" data-remove="${r.id}">삭제</button></div></article>`;
    const available=canPurchase(p) && r.qty<=stockOf(p);
    return `<article class="cart-item"><img src="${safe(productImageUrl(p))}" alt="${safe(p.name)}"><div><h4>${safe(p.name)}</h4><p>${money(Number(p.price)*r.qty)}</p>${available?'':`<small class="stock-note">${stockOf(p)===0?'품절':'구매 가능 수량 초과 또는 주문 불가'}</small>`}<div class="cart-item-bottom"><div class="qty-controls"><button type="button" data-qty="${r.id}" data-delta="-1" aria-label="수량 감소">−</button><span>${r.qty}</span><button type="button" data-qty="${r.id}" data-delta="1" aria-label="수량 증가" ${!canPurchase(p)||r.qty>=stockOf(p)?'disabled':''}>＋</button></div><button class="text-btn" type="button" data-remove="${r.id}">삭제</button></div></div></article>`;
  }).join(""):`<div class="cart-empty"><h3>장바구니가 비어 있어요</h3><p>필요한 상품을 골라 담아보세요.</p><button class="btn btn-outline" type="button" data-close>상품 둘러보기</button></div>`;
  $("#cartSubtotal").textContent=money(sub);
  $("#cartShipping").textContent=money(rows.length?shipping(sub):0);
  $("#cartTotal").textContent=money(rows.length?sub+shipping(sub):0);
  $("#cartCheckout").disabled=!canCheckoutCart();
}
function openCart(){closeModal();renderCart();$("#cartShade").hidden=false;$("#cartPanel").hidden=false;document.body.style.overflow="hidden";void hydrateCartProducts();}
function closeCart(){$("#cartShade").hidden=true;$("#cartPanel").hidden=true;document.body.style.overflow="";}
function closeModal(){$("#modalBackdrop").hidden=true;document.querySelectorAll("#modalBackdrop .dialog").forEach(d=>d.hidden=true);document.body.style.overflow="";}
function showModal(name){closeCart();$("#modalBackdrop").hidden=false;document.querySelectorAll("#modalBackdrop .dialog").forEach(d=>d.hidden=true);$("#"+name+"Modal").hidden=false;document.body.style.overflow="hidden";}
function setAuthMode(mode){const signup=mode==="signup";$("#loginForm").hidden=signup;$("#signupForm").hidden=!signup;$("#loginTab").classList.toggle("active",!signup);$("#signupTab").classList.toggle("active",signup);$("#authHeading").textContent=signup?"하우웰 회원가입":"하우웰 로그인";}
function openAuth(mode="login"){setAuthMode(mode);showModal("auth");}
function renderDetail(p){
  if(!p)return;
  const soldOut=stockOf(p)===0;
  const amount=isMedicine(p)?`<div class="detail-warning">${soldOut?'품절 · ':''}의약품은 온라인 판매·결제 대상이 아닙니다. 제품 선택 및 복용은 약사 등 전문가와 상의해 주세요. 이 화면은 정보 제공용 예시입니다.</div>`:
    `<div class="detail-price">${money(p.price)}</div><p class="stock-note">${soldOut?'품절':`재고 ${stockOf(p)}개`}</p>${soldOut?'<div class="detail-warning">품절된 상품은 장바구니에 담을 수 없습니다.</div>':`<div class="qty-controls"><button type="button" data-action="detail-minus" aria-label="수량 감소">−</button><span id="detailQty">${detailQty}</span><button type="button" data-action="detail-plus" aria-label="수량 증가">＋</button></div><div class="detail-actions"><button class="btn btn-primary full" type="button" data-action="detail-add">장바구니에 담기</button></div>`}`;
  $("#detailContent").innerHTML=`<div class="detail-layout"><img src="${safe(productImageUrl(p))}" alt="${safe(p.name)} 상품 이미지"><div class="detail-info"><span class="product-cat">HOWELL · ${safe(p.category)}</span><h2>${safe(p.name)}</h2><p>상품 정보는 Supabase 데이터베이스에서 불러왔습니다.</p>${amount}</div></div>`;
}
async function openDetail(id){
  const number=Number(id);
  if(!Number.isSafeInteger(number)||number<1) return;
  const request=++detailRequestVersion;
  detailId=number;detailQty=1;
  showModal("detail");
  $("#detailContent").textContent="불러오는 중";
  try {
    const {data,error}=await db.from("shop_products").select(PRODUCT_COLUMNS)
      .eq("is_active",true).eq("id",number).single();
    if(request!==detailRequestVersion) return;
    if(error){
      if(error.code==="PGRST116"){$("#detailContent").textContent="상품이 없습니다";return;}
      throw error;
    }
    productById.set(Number(data.id),data);
    renderDetail(data);
  } catch(error){
    if(request!==detailRequestVersion) return;
    console.error("shop_products 상품 상세 조회 실패:",error);
    $("#detailContent").textContent="상품 상세 정보를 불러오지 못했습니다.";
  }
}

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


// 과제 4에서는 주문/실재고/포인트를 서버에 기록하지 않습니다. 주문 기능은 과제 5에서 연결합니다.
function renderCheckout(){
  const m=currentMember();if(!m)return;
  const form=$("#checkoutForm");form.reset();form.elements.receiver.value=m.name;
  $("#pickupStore").innerHTML=STORES.filter(s=>s.pickup).map(s=>`<option value="${s.id}">${safe(s.name)}</option>`).join("");
  updateCheckout();
}
function updateCheckout(){
  const form=$("#checkoutForm"),m=currentMember();if(!m)return;
  const method=form.elements.receiveMethod.value,sub=subtotal(),fee=shipping(sub,method);
  $("#deliveryFields").hidden=method!=="delivery";
  $("#pickupFields").hidden=method!=="pickup";
  const bad=cartRows().filter(r=>!canPurchase(r.product)||r.qty>stockOf(r.product));
  $("#pickupInventory").textContent=method==="pickup" ?
    (bad.length?"품절 또는 재고 부족 상품이 있습니다. 장바구니를 확인해 주세요.":"매장별 실재고는 아직 연결되지 않았습니다. 화면에는 DB의 상품 재고만 표시합니다."):"";
  $("#usePoints").value="0";
  $("#checkoutSummary").innerHTML=`<div class="price-row"><span>상품금액</span><strong>${money(sub)}</strong></div><div class="price-row"><span>${method==='pickup'?'매장 픽업':'배송비'}</span><strong>${money(fee)}</strong></div><div class="price-row"><span>보유 포인트</span><strong>${Number(m.points||0).toLocaleString()}P</strong></div>`;
  $("#checkoutTotal").innerHTML=`<div class="price-row"><span>포인트 사용</span><strong>−0P</strong></div><div class="price-row"><span>최종 체험 주문금액</span><strong>${money(sub+fee)}</strong></div><p class="form-help" style="margin:0">현재 ${tierFor(m.grade).name} 등급 · 예상 적립 ${Math.floor(sub*tierFor(m.grade).rate).toLocaleString()}P</p>`;
}
function openCheckout(){
  if(!cart.length){toast("장바구니가 비어 있습니다.");return;}
  if(!canCheckoutCart()){toast("품절이거나 재고가 부족한 상품을 장바구니에서 정리해 주세요.");return;}
  if(!currentMember()){closeCart();toast("체험 주문을 위해 로그인해 주세요.");openAuth();return;}
  showModal("checkout");renderCheckout();
}
function handleCheckout(ev){
  ev.preventDefault();
  const m=currentMember();if(!m){openAuth();return;}
  const form=ev.currentTarget,method=form.elements.receiveMethod.value;
  if(!canCheckoutCart()){toast("품절이거나 재고가 부족한 상품이 있습니다.");return;}
  if(method==="delivery"&&(!form.elements.receiver.value.trim()||!form.elements.address.value.trim())){
    toast("체험용 수령인과 주소를 입력해 주세요. 실제 주소는 입력하지 마세요.");return;
  }
  const rows=cartRows(),sub=subtotal(),fee=shipping(sub,method),tier=tierFor(m.grade);
  const order={id:`HW-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`,memberId:m.id,receiveMethod:method,storeId:method==="pickup"?form.elements.pickupStore.value:"wh",status:"체험 주문 완료",subtotal:sub,shippingFee:fee,pointsUsed:0,total:sub+fee,earned:Math.floor(sub*tier.rate),createdAt:new Date().toISOString()};
  orders.push(order);
  for(const r of rows) orderItems.push({orderId:order.id,productId:r.id,name:r.product.name,price:r.product.price,qty:r.qty});
  // 주문은 화면 내 임시 기록이며 DB 상품 stock은 절대로 차감하지 않습니다.
  cart=[];save(KEYS.cart,cart);
  renderHeader();renderCart();paintProducts();void openMyPage();
  toast(`체험 주문 ${order.id} 작성 완료 · DB 재고/포인트 미변경`);
}

function setSlide(index){const slides=[...document.querySelectorAll('.hero-slide')];slideIndex=(index+slides.length)%slides.length;slides.forEach((s,i)=>{s.classList.toggle('active',i===slideIndex);s.setAttribute('aria-hidden',String(i!==slideIndex));s.querySelectorAll('button').forEach(b=>b.tabIndex=i===slideIndex?0:-1);});document.querySelectorAll('#heroDots button').forEach((b,i)=>{b.classList.toggle('active',i===slideIndex);b.setAttribute('aria-pressed',String(i===slideIndex));});}
function restartSlides(){clearInterval(slideTimer);slideTimer=setInterval(()=>setSlide(slideIndex+1),6000);}
function initSlides(){const dots=$('#heroDots');dots.innerHTML=[0,1,2,3].map(i=>`<button type="button" data-slide="${i}" aria-label="${i+1}번 배너" aria-pressed="false"></button>`).join('');setSlide(0);restartSlides();}


/* 단일 HTML 페이지의 공통 이벤트. 모든 상품 조회는 Supabase를 거칩니다. */
document.addEventListener("click",event=>{
  const e=event.target.closest("button,a");if(!e)return;
  if(e.hasAttribute("data-close")){closeModal();closeCart();return;}
  if(e.dataset.cat){applyCategory(e.dataset.cat);return;}
  if(e.dataset.open){const where=e.dataset.open;if(where==="auth")openAuth(e.dataset.mode||"login");if(where==="cart")openCart();if(where==="mypage")void openMyPage();return;}
  if(e.dataset.mode){setAuthMode(e.dataset.mode);return;}
  if(e.dataset.add){addToCart(Number(e.dataset.add));return;}
  if(e.dataset.detail){void openDetail(Number(e.dataset.detail));return;}
  if(e.dataset.qty){changeCart(Number(e.dataset.qty),Number(e.dataset.delta));return;}
  if(e.dataset.remove){removeCart(Number(e.dataset.remove));return;}
  if(e.dataset.slide){setSlide(Number(e.dataset.slide));restartSlides();return;}
  if(e.dataset.action==="detail-plus"){
    const product=productById.get(detailId);
    detailQty=Math.min(detailQty+1,stockOf(product));
    const quantity=$("#detailQty");if(quantity)quantity.textContent=detailQty;
    return;
  }
  if(e.dataset.action==="detail-minus"){
    detailQty=Math.max(1,detailQty-1);
    const quantity=$("#detailQty");if(quantity)quantity.textContent=detailQty;
    return;
  }
  if(e.dataset.action==="detail-add"){
    addToCart(detailId,detailQty);closeModal();openCart();return;
  }
  if(e.dataset.action==="logout"){void handleLogout();return;}
});
$("#searchForm").addEventListener("submit",e=>{
  e.preventDefault();clearTimeout(searchTimer);
  searchTerm=$("#searchInput").value.trim();activeCategory="전체";
  void loadProducts();$("#products").scrollIntoView({behavior:"smooth"});
});
$("#searchInput").addEventListener("input",e=>{
  clearTimeout(searchTimer);
  searchTerm=e.target.value.trim();
  searchTimer=setTimeout(()=>{void loadProducts();},300);
});
$("#sortSelect").addEventListener("change",e=>{sortBy=e.target.value;paintProducts();});
$("#resetFilter").addEventListener("click",()=>applyCategory("전체"));
$("#heroPrev").addEventListener("click",()=>{setSlide(slideIndex-1);restartSlides();});
$("#heroNext").addEventListener("click",()=>{setSlide(slideIndex+1);restartSlides();});
$("#modalBackdrop").addEventListener("click",e=>{if(e.target===$("#modalBackdrop"))closeModal();});
$("#cartShade").addEventListener("click",closeCart);
$("#cartCheckout").addEventListener("click",openCheckout);
$("#loginForm").addEventListener("submit",handleLogin);
$("#signupForm").addEventListener("submit",handleSignup);
document.addEventListener("submit",e=>{if(e.target.id==="profileEditForm")void handleProfileUpdate(e);});
$("#checkoutForm").addEventListener("submit",handleCheckout);
$("#checkoutForm").addEventListener("input",updateCheckout);
$("#checkoutForm").addEventListener("change",updateCheckout);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeCart();}});
renderHeader();renderTiers();renderChips();renderCart();initSlides();
// 첫 화면에서 shop_products를 서버에서 읽어 옵니다.
void loadProducts();
// 이전 과제에서 구현한 Auth / 마이페이지 연동 유지.
void syncAuthState();
db.auth.onAuthStateChange(()=>{setTimeout(()=>{void syncAuthState();},0);});
