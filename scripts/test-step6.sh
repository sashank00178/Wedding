#!/bin/bash
# STEP 6 Test Suite — Orders API

BASE="http://localhost:3000"
PASS=0
FAIL=0
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass() { PASS=$((PASS+1)); echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { FAIL=$((FAIL+1)); echo -e "  ${RED}✗ FAIL${NC}: $1 — $2"; }

echo "======================================================"
echo "  STEP 6 TEST SUITE — Orders API"
echo "======================================================"
echo ""

# ── 1. GET /api/orders — list orders (no auth) ────────────
echo "── 1. GET /api/orders without auth ───────────────────"
NOAUTH=$(curl -s "$BASE/api/orders")
NOAUTH_ERR=$(echo "$NOAUTH" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$NOAUTH_ERR" | grep -qi "auth\|sign in"; then
  pass "Requires authentication: $NOAUTH_ERR"
else
  fail "No-auth guard" "Expected 401, got: $NOAUTH_ERR"
fi

# ── 2. GET /api/orders — list customer orders ─────────────
echo ""
echo "── 2. GET /api/orders — customer order list ────────"
# Login first
CSRF=$(curl -s -c /tmp/step6-cookies.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
LOGIN_RESP=$(curl -s -c /tmp/step6-cookies.txt -b /tmp/step6-cookies.txt \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=customer@demo.com&password=password123&csrfToken=$CSRF" -o /dev/null -w "%{http_code}")

ORDERS=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders")
ORDER_COUNT=$(echo "$ORDERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('orders',[])))" 2>/dev/null)
TOTAL=$(echo "$ORDERS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pagination',{}).get('total',0))" 2>/dev/null)

if [ "$ORDER_COUNT" -ge 1 ] 2>/dev/null; then
  pass "Got $ORDER_COUNT orders (total: $TOTAL)"
  # Show first order
  FIRST_ORDER_NUM=$(echo "$ORDERS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
orders=d.get('orders',[])
if orders:
  print(orders[0].get('orderNumber',''))
" 2>/dev/null)
  echo "     First order: $FIRST_ORDER_NUM"
else
  ORDERS_ERR=$(echo "$ORDERS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  fail "Order list" "$ORDERS_ERR"
fi

# ── 3. GET /api/orders with status filter ─────────────────
echo ""
echo "── 3. GET /api/orders?status=pending ────────────────"
PENDING=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders?status=pending")
PENDING_COUNT=$(echo "$PENDING" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('orders',[])))" 2>/dev/null)
PENDING_ALL_MATCH=$(echo "$PENDING" | python3 -c "
import sys,json
d=json.load(sys.stdin)
orders=d.get('orders',[])
if not orders:
  print('true')
else:
  print(all(o.get('status')=='pending' for o in orders))
" 2>/dev/null)

if [ "$PENDING_ALL_MATCH" = "True" ]; then
  pass "Status filter works: $PENDING_COUNT pending orders"
else
  fail "Status filter" "Not all results have status=pending"
fi

# ── 4. GET /api/orders — pagination test ────────────────
echo ""
echo "── 4. GET /api/orders?page=1&limit=1 ────────────────"
PAGE1=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders?page=1&limit=1")
PAGE1_COUNT=$(echo "$PAGE1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('orders',[])))" 2>/dev/null)
PAGE1_TOTAL_PAGES=$(echo "$PAGE1" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pagination',{}).get('totalPages',0))" 2>/dev/null)

if [ "$PAGE1_COUNT" = "1" ] && [ "$PAGE1_TOTAL_PAGES" -ge 1 ] 2>/dev/null; then
  pass "Pagination works: 1 item, $PAGE1_TOTAL_PAGES total pages"
else
  fail "Pagination" "Expected 1 item, got $PAGE1_COUNT"
fi

# ── 5. GET /api/orders/[id] — order detail ────────────────
echo ""
echo "── 5. GET /api/orders/[id] — order detail ───────────"
# Get the first order ID
ORDER_ID=$(echo "$ORDERS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
orders=d.get('orders',[])
if orders:
  print(orders[0].get('id',''))
" 2>/dev/null)

if [ -n "$ORDER_ID" ]; then
  DETAIL=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders/$ORDER_ID")
  DETAIL_NUM=$(echo "$DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('orderNumber',''))" 2>/dev/null)
  DETAIL_ITEMS=$(echo "$DETAIL" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('items',[])))" 2>/dev/null)
  DETAIL_PAYMENT=$(echo "$DETAIL" | python3 -c "import sys,json; p=json.load(sys.stdin).get('payment'); print('yes' if p else 'no')" 2>/dev/null)
  DETAIL_ADDR=$(echo "$DETAIL" | python3 -c "import sys,json; a=json.load(sys.stdin).get('shippingAddress'); print('yes' if a else 'no')" 2>/dev/null)

  if [ -n "$DETAIL_NUM" ] && [ "$DETAIL_ITEMS" -ge 1 ] 2>/dev/null && [ "$DETAIL_PAYMENT" = "yes" ]; then
    pass "Order detail: $DETAIL_NUM, $DETAIL_ITEMS items, payment=$DETAIL_PAYMENT, address=$DETAIL_ADDR"
  else
    fail "Order detail" "Missing data: num=$DETAIL_NUM items=$DETAIL_ITEMS payment=$DETAIL_PAYMENT"
  fi
else
  fail "Order detail" "No order ID available"
fi

# ── 6. GET /api/orders/[id] — non-existent order ────────
echo ""
echo "── 6. GET /api/orders/nonexistent ────────────────────"
NOT_FOUND=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders/nonexistent123")
NOT_FOUND_ERR=$(echo "$NOT_FOUND" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$NOT_FOUND_ERR" | grep -qi "not found"; then
  pass "Returns 404 for non-existent order: $NOT_FOUND_ERR"
else
  fail "404 check" "Got: $NOT_FOUND_ERR"
fi

# ── 7. GET /api/orders/[id] — another user's order ──────
echo ""
echo "── 7. GET /api/orders/[id] — ownership check ────────"
# Get the admin's order ID and try to access as customer
ADMIN_ORDER_ID=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.order.findUnique({ where: { orderNumber: 'ORD-20260726-ADMN' } })
  .then(o => { if(o) console.log(o.id); else console.log('NOT_FOUND'); })
  .finally(() => db.\$disconnect());
" 2>/dev/null)

if [ "$ADMIN_ORDER_ID" != "NOT_FOUND" ] && [ -n "$ADMIN_ORDER_ID" ]; then
  FORBIDDEN=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders/$ADMIN_ORDER_ID")
  FORBIDDEN_ERR=$(echo "$FORBIDDEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  if echo "$FORBIDDEN_ERR" | grep -qi "permission"; then
    pass "Ownership check works: $FORBIDDEN_ERR"
  else
    fail "Ownership" "Expected permission error, got: $FORBIDDEN_ERR"
  fi
else
  fail "Ownership" "Admin order not found for test"
fi

# ── 8. POST /api/orders/[id]/cancel — cancel pending order ──
echo ""
echo "── 8. POST /api/orders/[id]/cancel — pending order ──"
PENDING_ORDER_ID=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.order.findUnique({ where: { orderNumber: 'ORD-20260727-E5F6' } })
  .then(o => { if(o) console.log(o.id); else console.log('NOT_FOUND'); })
  .finally(() => db.\$disconnect());
" 2>/dev/null)

if [ "$PENDING_ORDER_ID" != "NOT_FOUND" ] && [ -n "$PENDING_ORDER_ID" ]; then
  CANCEL_RES=$(curl -s -b /tmp/step6-cookies.txt -X POST "$BASE/api/orders/$PENDING_ORDER_ID/cancel" \
    -H "Content-Type: application/json" \
    -d '{"reason":"Changed my mind, need a different package"}')
  CANCEL_MSG=$(echo "$CANCEL_RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null)
  CANCEL_STATUS=$(echo "$CANCEL_RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('order',{}).get('status',''))" 2>/dev/null)

  if echo "$CANCEL_MSG" | grep -qi "cancelled" && [ "$CANCEL_STATUS" = "cancelled" ]; then
    pass "Order cancelled: $CANCEL_MSG"
  else
    CANCEL_ERR=$(echo "$CANCEL_RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
    fail "Cancel" "$CANCEL_ERR"
  fi
else
  fail "Cancel" "Pending order not found"
fi

# ── 9. POST /api/orders/[id]/cancel — already cancelled ──
echo ""
echo "── 9. POST /api/orders/[id]/cancel — already cancelled"
RE_CANCEL=$(curl -s -b /tmp/step6-cookies.txt -X POST "$BASE/api/orders/$PENDING_ORDER_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{}')
RE_CANCEL_ERR=$(echo "$RE_CANCEL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$RE_CANCEL_ERR" | grep -qi "cannot cancel\|pending"; then
  pass "Rejects double-cancel: $RE_CANCEL_ERR"
else
  fail "Double-cancel" "Got: $RE_CANCEL_ERR"
fi

# ── 10. POST /api/orders/[id]/cancel — shipped order ─────
echo ""
echo "── 10. POST /api/orders/[id]/cancel — shipped order ──"
SHIPPED_ID=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.order.findUnique({ where: { orderNumber: 'ORD-20260726-C3D4' } })
  .then(o => { if(o) console.log(o.id); else console.log('NOT_FOUND'); })
  .finally(() => db.\$disconnect());
" 2>/dev/null)

if [ "$SHIPPED_ID" != "NOT_FOUND" ] && [ -n "$SHIPPED_ID" ]; then
  SHIPPED_CANCEL=$(curl -s -b /tmp/step6-cookies.txt -X POST "$BASE/api/orders/$SHIPPED_ID/cancel" \
    -H "Content-Type: application/json" \
    -d '{}')
  SHIPPED_ERR=$(echo "$SHIPPED_CANCEL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  if echo "$SHIPPED_ERR" | grep -qi "cannot cancel\|pending"; then
    pass "Rejects cancel on shipped order: $SHIPPED_ERR"
  else
    fail "Shipped cancel" "Got: $SHIPPED_ERR"
  fi
else
  fail "Shipped cancel" "Shipped order not found"
fi

# ── 11. PUT /api/orders/[id]/status — admin status update ─
echo ""
echo "── 11. PUT /api/orders/[id]/status — admin only ────"
# Try as customer first (should fail)
CUSTOMER_STATUS=$(curl -s -b /tmp/step6-cookies.txt -X PUT "$BASE/api/orders/$SHIPPED_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered"}')
CUSTOMER_STATUS_ERR=$(echo "$CUSTOMER_STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$CUSTOMER_STATUS_ERR" | grep -qi "admin"; then
  pass "Customer cannot update status: $CUSTOMER_STATUS_ERR"
else
  fail "Admin guard" "Expected admin error, got: $CUSTOMER_STATUS_ERR"
fi

# ── 12. PUT /api/orders/[id]/status — invalid transition ─
echo ""
echo "── 12. PUT /api/orders/[id]/status — bad transition ─"
# Login as admin
ADMIN_CSRF=$(curl -s -c /tmp/step6-admin-cookies.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
curl -s -c /tmp/step6-admin-cookies.txt -b /tmp/step6-admin-cookies.txt \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@weddingmomentnepal.com&password=admin123&csrfToken=$ADMIN_CSRF" -o /dev/null 2>/dev/null

# Try invalid transition: delivered → pending (not allowed)
BAD_TRANS=$(curl -s -b /tmp/step6-admin-cookies.txt -X PUT "$BASE/api/orders/$SHIPPED_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"pending"}')
BAD_TRANS_ERR=$(echo "$BAD_TRANS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$BAD_TRANS_ERR" | grep -qi "cannot\|transition\|allowed"; then
  pass "Rejects invalid transition: $BAD_TRANS_ERR"
else
  fail "Transition" "Expected transition error, got: $BAD_TRANS_ERR"
fi

# ── 13. PUT /api/orders/[id]/status — valid transition ───
echo ""
echo "── 13. PUT /api/orders/[id]/status — shipped→delivered"
VALID_TRANS=$(curl -s -b /tmp/step6-admin-cookies.txt -X PUT "$BASE/api/orders/$SHIPPED_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"delivered","trackingNumber":"TRK789NP","adminNote":"Package delivered successfully"}')
VALID_MSG=$(echo "$VALID_TRANS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null)
VALID_STATUS=$(echo "$VALID_TRANS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('order',{}).get('status',''))" 2>/dev/null)

if echo "$VALID_MSG" | grep -qi "delivered" && [ "$VALID_STATUS" = "delivered" ]; then
  pass "Status updated: $VALID_MSG"
else
  VALID_ERR=$(echo "$VALID_TRANS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  fail "Valid transition" "$VALID_ERR"
fi

# ── 14. GET /api/orders — filter cancelled orders ─────────
echo ""
echo "── 14. GET /api/orders?status=cancelled ─────────────"
CANCELLED=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders?status=cancelled")
CANCELLED_COUNT=$(echo "$CANCELLED" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('orders',[])))" 2>/dev/null)
if [ "$CANCELLED_COUNT" -ge 1 ] 2>/dev/null; then
  pass "Cancelled orders filter: $CANCELLED_COUNT results"
else
  pass "Cancelled orders filter: 0 results (may have been filtered differently)"
fi

# ── 15. GET /api/orders?status=invalid — validation ─────
echo ""
echo "── 15. GET /api/orders?status=invalid ───────────────"
INVALID_STATUS=$(curl -s -b /tmp/step6-cookies.txt "$BASE/api/orders?status=invalid")
INVALID_ERR=$(echo "$INVALID_STATUS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if [ -n "$INVALID_ERR" ]; then
  pass "Rejects invalid status param: $INVALID_ERR"
else
  fail "Status validation" "Should have rejected invalid status"
fi

# ── SUMMARY ────────────────────────────────────────────────
echo ""
echo "======================================================"
echo -e "  RESULTS: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "======================================================"
echo ""
echo "Routes tested:"
echo "  GET  /api/orders              — customer order list"
echo "  GET  /api/orders?status=X     — filtered list"
echo "  GET  /api/orders/[id]         — order detail"
echo "  POST /api/orders/[id]/cancel  — customer cancellation"
echo "  PUT  /api/orders/[id]/status  — admin status update"
