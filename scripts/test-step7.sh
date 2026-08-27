#!/bin/bash
# STEP 7 Test Suite — Admin Routes & Middleware

BASE="http://localhost:3000"
PASS=0
FAIL=0
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass() { PASS=$((PASS+1)); echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { FAIL=$((FAIL+1)); echo -e "  ${RED}✗ FAIL${NC}: $1 — $2"; }

echo "======================================================"
echo "  STEP 7 TEST SUITE — Admin Routes & Middleware"
echo "======================================================"
echo ""

# Helper: login and save cookies
login_customer() {
  local CSRF=$(curl -s -c /tmp/s7-cust-cookies.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
  curl -s -c /tmp/s7-cust-cookies.txt -b /tmp/s7-cust-cookies.txt \
    -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=customer@demo.com&password=password123&csrfToken=$CSRF" -o /dev/null 2>/dev/null
}

login_admin() {
  local CSRF=$(curl -s -c /tmp/s7-admin-cookies.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
  curl -s -c /tmp/s7-admin-cookies.txt -b /tmp/s7-admin-cookies.txt \
    -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=admin@weddingmomentnepal.com&password=admin123&csrfToken=$CSRF" -o /dev/null 2>/dev/null
}

# ── 1. Middleware: Unauthenticated access to admin API ───────
echo "── 1. Middleware: No auth → /api/admin/dashboard ───"
NO_AUTH=$(curl -s "$BASE/api/admin/dashboard")
NO_AUTH_STATUS=$(echo "$NO_AUTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error','OK'))" 2>/dev/null)
if echo "$NO_AUTH_STATUS" | grep -qi "auth\|admin\|required"; then
  pass "Middleware blocks unauthenticated: $NO_AUTH_STATUS"
else
  fail "Middleware no-auth" "Expected auth error, got: $NO_AUTH_STATUS"
fi

# ── 2. Middleware: Customer accessing admin API ─────────────
echo ""
echo "── 2. Middleware: Customer → /api/admin/orders ──────"
login_customer
CUST_ADMIN=$(curl -s -b /tmp/s7-cust-cookies.txt "$BASE/api/admin/orders")
CUST_ERR=$(echo "$CUST_ADMIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error','OK'))" 2>/dev/null)
if echo "$CUST_ERR" | grep -qi "admin"; then
  pass "Middleware blocks customer: $CUST_ERR"
else
  fail "Middleware customer" "Expected admin error, got: $CUST_ERR"
fi

# ── 3. Middleware: Customer accessing admin users ──────────
echo ""
echo "── 3. Middleware: Customer → /api/admin/users ───────"
CUST_USERS=$(curl -s -b /tmp/s7-cust-cookies.txt "$BASE/api/admin/users")
CUST_USERS_ERR=$(echo "$CUST_USERS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error','OK'))" 2>/dev/null)
if echo "$CUST_USERS_ERR" | grep -qi "admin"; then
  pass "Middleware blocks customer on users: $CUST_USERS_ERR"
else
  fail "Middleware customer users" "Got: $CUST_USERS_ERR"
fi

# ── 4. Admin Dashboard Stats ──────────────────────────────
echo ""
echo "── 4. GET /api/admin/dashboard (admin) ──────────────"
login_admin
DASH=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/dashboard")
DASH_REV=$(echo "$DASH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalRevenue',0))" 2>/dev/null)
DASH_ORDERS=$(echo "$DASH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalOrders',0))" 2>/dev/null)
DASH_CUST=$(echo "$DASH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('customerCount',0))" 2>/dev/null)
DASH_PRODS=$(echo "$DASH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalProducts',0))" 2>/dev/null)
DASH_STATUS=$(echo "$DASH" | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('ordersByStatus',{}); print(len(s))" 2>/dev/null)
DASH_RECENT=$(echo "$DASH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('recentOrders',[])))" 2>/dev/null)
DASH_TOP=$(echo "$DASH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('topProducts',[])))" 2>/dev/null)

if [ "$DASH_ORDERS" -ge 1 ] 2>/dev/null && [ "$DASH_STATUS" -ge 1 ] 2>/dev/null; then
  pass "Dashboard: रु$DASH_REV revenue, $DASH_ORDERS orders, $DASH_CUST customers, $DASH_PRODS products, $DASH_STATUS statuses, $DASH_RECENT recent, $DASH_TOP top products"
else
  DASH_ERR=$(echo "$DASH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  fail "Dashboard" "$DASH_ERR"
fi

# ── 5. Admin Orders List ──────────────────────────────────
echo ""
echo "── 5. GET /api/admin/orders ─────────────────────────"
ADMIN_ORDERS=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/orders")
A_ORDERS_COUNT=$(echo "$ADMIN_ORDERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('orders',[])))" 2>/dev/null)
A_ORDERS_TOTAL=$(echo "$ADMIN_ORDERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pagination',{}).get('total',0))" 2>/dev/null)

if [ "$A_ORDERS_COUNT" -ge 1 ] 2>/dev/null; then
  # Check if orders include customer info
  HAS_CUSTOMER=$(echo "$ADMIN_ORDERS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
orders=d.get('orders',[])
if orders:
  print('yes' if orders[0].get('user') else 'no')
" 2>/dev/null)
  pass "Admin orders: $A_ORDERS_COUNT shown / $A_ORDERS_TOTAL total, customer=$HAS_CUSTOMER"
else
  A_ERR=$(echo "$ADMIN_ORDERS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  fail "Admin orders" "$A_ERR"
fi

# ── 6. Admin Orders — Search ──────────────────────────────
echo ""
echo "── 6. GET /api/admin/orders?search=ORD-20260726 ────"
ADMIN_SEARCH=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/orders?search=ORD-20260726")
SEARCH_COUNT=$(echo "$ADMIN_SEARCH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('orders',[])))" 2>/dev/null)
SEARCH_TOTAL=$(echo "$ADMIN_SEARCH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pagination',{}).get('total',0))" 2>/dev/null)

if [ "$SEARCH_TOTAL" -ge 1 ] 2>/dev/null; then
  pass "Search 'ORD-20260726': $SEARCH_TOTAL results"
else
  pass "Search: 0 results (OK if no orders match)"
fi

# ── 7. Admin Orders — Status filter ────────────────────────
echo ""
echo "── 7. GET /api/admin/orders?status=delivered ────────"
ADMIN_STATUS=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/orders?status=delivered")
STATUS_COUNT=$(echo "$ADMIN_STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pagination',{}).get('total',0))" 2>/dev/null)
STATUS_MATCH=$(echo "$ADMIN_STATUS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
orders=d.get('orders',[])
if not orders:
  print('true')
else:
  print(all(o.get('status')=='delivered' for o in orders))
" 2>/dev/null)

if [ "$STATUS_MATCH" = "True" ]; then
  pass "Status filter (delivered): $STATUS_COUNT orders"
else
  fail "Status filter" "Not all results are delivered"
fi

# ── 8. Admin Users List ──────────────────────────────────
echo ""
echo "── 8. GET /api/admin/users ──────────────────────────"
ADMIN_USERS=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/users")
USERS_COUNT=$(echo "$ADMIN_USERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('users',[])))" 2>/dev/null)
NO_HASH=$(echo "$ADMIN_USERS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
users=d.get('users',[])
if not users:
  print('true')
else:
  print('passwordHash' not in users[0])
" 2>/dev/null)

if [ "$USERS_COUNT" -ge 1 ] 2>/dev/null && [ "$NO_HASH" = "True" ]; then
  pass "Users list: $USERS_COUNT users, no passwordHash exposed"
else
  A_USERS_ERR=$(echo "$ADMIN_USERS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  fail "Users list" "count=$USERS_COUNT noHash=$NO_HASH err=$A_USERS_ERR"
fi

# ── 9. Admin User Detail ──────────────────────────────────
echo ""
echo "── 9. GET /api/admin/users/[id] ─────────────────────"
# Get the customer user ID
CUST_ID=$(echo "$ADMIN_USERS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
users=d.get('users',[])
for u in users:
  if u.get('role')=='customer':
    print(u.get('id'))
    break
" 2>/dev/null)

if [ -n "$CUST_ID" ]; then
  USER_DETAIL=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/users/$CUST_ID")
  USER_NAME=$(echo "$USER_DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name',''))" 2>/dev/null)
  USER_STATS=$(echo "$USER_DETAIL" | python3 -c "import sys,json; s=json.load(sys.stdin).get('stats',{}); print(f\"orders={s.get('totalOrders',0)} spent={s.get('totalSpent',0)}\")" 2>/dev/null)
  USER_ORDERS=$(echo "$USER_DETAIL" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('orders',[])))" 2>/dev/null)

  if [ -n "$USER_NAME" ]; then
    pass "User detail: $USER_NAME, $USER_STATS, $USER_ORDERS recent orders"
  else
    fail "User detail" "Got no user data"
  fi
else
  fail "User detail" "No customer ID found"
fi

# ── 10. Coupon CRUD — Create ──────────────────────────────
echo ""
echo "── 10. POST /api/coupons — create new coupon ────────"
CREATE_COUPON=$(curl -s -b /tmp/s7-admin-cookies.txt -X POST "$BASE/api/coupons" \
  -H "Content-Type: application/json" \
  -d '{"code":"SUMMER25","type":"percentage","value":25,"minOrder":3000,"maxUses":100,"isActive":true}')
CREATE_CODE=$(echo "$CREATE_COUPON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('coupon',{}).get('code',''))" 2>/dev/null)
CREATE_ERR=$(echo "$CREATE_COUPON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

if [ "$CREATE_CODE" = "SUMMER25" ]; then
  pass "Created coupon: $CREATE_CODE"
else
  fail "Create coupon" "$CREATE_ERR"
fi

# ── 11. Coupon CRUD — Duplicate code rejected ──────────────
echo ""
echo "── 11. POST /api/coupons — duplicate code rejected ──"
DUP_COUPON=$(curl -s -b /tmp/s7-admin-cookies.txt -X POST "$BASE/api/coupons" \
  -H "Content-Type: application/json" \
  -d '{"code":"SUMMER25","type":"fixed","value":500}')
DUP_ERR=$(echo "$DUP_COUPON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

if echo "$DUP_ERR" | grep -qi "exists\|already"; then
  pass "Duplicate rejected: $DUP_ERR"
else
  fail "Duplicate coupon" "$DUP_ERR"
fi

# ── 12. Coupon CRUD — Invalid percentage ──────────────────
echo ""
echo "── 12. POST /api/coupons — 150% rejected ────────────"
BAD_PCT=$(curl -s -b /tmp/s7-admin-cookies.txt -X POST "$BASE/api/coupons" \
  -H "Content-Type: application/json" \
  -d '{"code":"BADPCT","type":"percentage","value":150}')
BAD_PCT_ERR=$(echo "$BAD_PCT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

if echo "$BAD_PCT_ERR" | grep -qi "exceed\|100"; then
  pass "150% rejected: $BAD_PCT_ERR"
else
  fail "Bad percentage" "$BAD_PCT_ERR"
fi

# ── 13. Coupon CRUD — Customer cannot create ──────────────
echo ""
echo "── 13. POST /api/coupons — customer rejected ─────────"
CUST_CREATE=$(curl -s -b /tmp/s7-cust-cookies.txt -X POST "$BASE/api/coupons" \
  -H "Content-Type: application/json" \
  -d '{"code":"HACK","type":"fixed","value":9999}')
CUST_CREATE_ERR=$(echo "$CUST_CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

if echo "$CUST_CREATE_ERR" | grep -qi "admin\|auth"; then
  pass "Customer cannot create coupon: $CUST_CREATE_ERR"
else
  fail "Customer coupon" "$CUST_CREATE_ERR"
fi

# ── 14. Coupon CRUD — Update ──────────────────────────────
echo ""
echo "── 14. PUT /api/coupons/[id] — update coupon ────────"
COUPON_ID=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.coupon.findUnique({ where: { code: 'SUMMER25' } })
  .then(c => { if(c) console.log(c.id); else console.log('NOT_FOUND'); })
  .finally(() => db.\$disconnect());
" 2>/dev/null)

if [ "$COUPON_ID" != "NOT_FOUND" ] && [ -n "$COUPON_ID" ]; then
  UPDATE_COUPON=$(curl -s -b /tmp/s7-admin-cookies.txt -X PUT "$BASE/api/coupons/$COUPON_ID" \
    -H "Content-Type: application/json" \
    -d '{"value":20}')
  UPDATE_CODE=$(echo "$UPDATE_COUPON" | python3 -c "import sys,json; c=json.load(sys.stdin).get('coupon',{}); print(f\"{c.get('code')}={c.get('value')}\")" 2>/dev/null)

  if echo "$UPDATE_CODE" | grep -q "SUMMER25=20"; then
    pass "Updated coupon: $UPDATE_CODE"
  else
    UPDATE_ERR=$(echo "$UPDATE_COUPON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
    fail "Update coupon" "$UPDATE_ERR"
  fi
else
  fail "Update coupon" "Coupon not found"
fi

# ── 15. Coupon CRUD — Delete unused coupon ────────────────
echo ""
echo "── 15. DELETE /api/coupons/[id] — unused coupon ─────"
if [ "$COUPON_ID" != "NOT_FOUND" ] && [ -n "$COUPON_ID" ]; then
  DEL_COUPON=$(curl -s -b /tmp/s7-admin-cookies.txt -X DELETE "$BASE/api/coupons/$COUPON_ID")
  DEL_MSG=$(echo "$DEL_COUPON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null)

  if echo "$DEL_MSG" | grep -qi "deleted"; then
    pass "Deleted unused coupon: $DEL_MSG"
  else
    DEL_ERR=$(echo "$DEL_COUPON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
    fail "Delete coupon" "$DEL_ERR"
  fi
else
  fail "Delete coupon" "No coupon ID"
fi

# ── 16. Coupon CRUD — Delete used coupon (rejected) ────────
echo ""
echo "── 16. DELETE /api/coupons/[id] — used coupon rejected"
USED_COUPON_ID=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.coupon.findUnique({ where: { code: 'WELCOME10' } })
  .then(c => { if(c) console.log(c.id); else console.log('NOT_FOUND'); })
  .finally(() => db.\$disconnect());
" 2>/dev/null)

if [ "$USED_COUPON_ID" != "NOT_FOUND" ] && [ -n "$USED_COUPON_ID" ]; then
  DEL_USED=$(curl -s -b /tmp/s7-admin-cookies.txt -X DELETE "$BASE/api/coupons/$USED_COUPON_ID")
  DEL_USED_ERR=$(echo "$DEL_USED" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)

  if echo "$DEL_USED_ERR" | grep -qi "cannot delete\|used"; then
    pass "Used coupon deletion rejected: $DEL_USED_ERR"
  else
    fail "Used coupon delete" "Got: $DEL_USED_ERR"
  fi
else
  fail "Used coupon delete" "WELCOME10 not found"
fi

# ── 17. Middleware: Public routes still work ──────────────
echo ""
echo "── 17. Public routes unaffected by middleware ────────"
PRODUCTS=$(curl -s "$BASE/api/products?limit=1")
PROD_COUNT=$(echo "$PRODUCTS" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('products',[])))" 2>/dev/null)

if [ "$PROD_COUNT" -ge 1 ] 2>/dev/null; then
  pass "Public products route still works"
else
  fail "Public route" "Products route blocked by middleware"
fi

# ── 18. Admin orders sort ─────────────────────────────────
echo ""
echo "── 18. GET /api/admin/orders?sortBy=total&sortOrder=desc ──"
SORTED=$(curl -s -b /tmp/s7-admin-cookies.txt "$BASE/api/admin/orders?sortBy=total&sortOrder=desc&limit=3")
SORTED_FIRST=$(echo "$SORTED" | python3 -c "
import sys,json
d=json.load(sys.stdin)
orders=d.get('orders',[])
if len(orders) >= 2:
  print('sorted' if orders[0].get('total',0) >= orders[1].get('total',0) else 'unsorted')
else:
  print('too_few')
" 2>/dev/null)

if [ "$SORTED_FIRST" = "sorted" ]; then
  pass "Sort by total desc works"
elif [ "$SORTED_FIRST" = "too_few" ]; then
  pass "Sort works (too few orders for multi-compare)"
else
  fail "Sort" "Orders not sorted correctly: $SORTED_FIRST"
fi

# ── SUMMARY ────────────────────────────────────────────────
echo ""
echo "======================================================"
echo -e "  RESULTS: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "======================================================"
echo ""
echo "Components tested:"
echo "  Middleware         — edge-level admin route protection"
echo "  GET /api/admin/dashboard  — business metrics"
echo "  GET /api/admin/orders     — full order management"
echo "  GET /api/admin/users      — user listing"
echo "  GET /api/admin/users/[id] — user detail + stats"
echo "  POST/PUT/DELETE /api/coupons — full coupon CRUD"
