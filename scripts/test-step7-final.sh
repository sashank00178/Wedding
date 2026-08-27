#!/bin/bash
BASE="http://localhost:3000"
PASS=0; FAIL=0
GREEN="\033[0;32m"; RED="\033[0;31m"; NC="\033[0m"
pass() { PASS=$((PASS+1)); echo -e "  ${GREEN}✓ PASS${NC}: $1"; }
fail() { FAIL=$((FAIL+1)); echo -e "  ${RED}✗ FAIL${NC}: $1 — $2"; }

echo "======================================================"
echo "  STEP 7 TEST — Admin Routes & Proxy"
echo "======================================================"

login_admin() {
  CSRF=$(curl -s -c /tmp/s7a2.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
  curl -s -c /tmp/s7a2.txt -b /tmp/s7a2.txt -X POST "$BASE/api/auth/callback/credentials" -H "Content-Type: application/x-www-form-urlencoded" -d "email=admin@weddingmomentnepal.com&password=admin123&csrfToken=$CSRF" -o /dev/null 2>/dev/null
}
login_customer() {
  CSRF=$(curl -s -c /tmp/s7c2.txt "$BASE/api/auth/csrf" | python3 -c "import sys,json;print(json.load(sys.stdin).get('csrfToken',''))" 2>/dev/null)
  curl -s -c /tmp/s7c2.txt -b /tmp/s7c2.txt -X POST "$BASE/api/auth/callback/credentials" -H "Content-Type: application/x-www-form-urlencoded" -d "email=customer@demo.com&password=password123&csrfToken=$CSRF" -o /dev/null 2>/dev/null
}

echo ""
echo "── 1. Proxy: No auth → /api/admin/dashboard ────────"
R=$(curl -s "$BASE/api/admin/dashboard")
E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error','OK'))" 2>/dev/null)
if echo "$E" | grep -qi "admin\|auth"; then pass "Blocked: $E"; else fail "No-auth" "$E"; fi

echo ""
echo "── 2. Proxy: Customer → /api/admin/orders ────────────"
login_customer
R=$(curl -s -b /tmp/s7c2.txt "$BASE/api/admin/orders")
E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error','OK'))" 2>/dev/null)
if echo "$E" | grep -qi "admin"; then pass "Blocked: $E"; else fail "Customer" "$E"; fi

echo ""
echo "── 3. Public routes still work ─────────────────────"
R=$(curl -s "$BASE/api/products?limit=1")
C=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin).get('products',[])))" 2>/dev/null)
if [ "$C" -ge 1 ] 2>/dev/null; then pass "Products public: $C result"; else fail "Public" "blocked"; fi

echo ""
echo "── 4. GET /api/admin/dashboard (admin) ──────────────"
login_admin
R=$(curl -s -b /tmp/s7a2.txt "$BASE/api/admin/dashboard")
REV=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('totalRevenue',0))" 2>/dev/null)
ORD=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('totalOrders',0))" 2>/dev/null)
CUST=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('customerCount',0))" 2>/dev/null)
STAT=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin).get('ordersByStatus',{})))" 2>/dev/null)
RECENT=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin).get('recentOrders',[])))" 2>/dev/null)
if [ "$ORD" -ge 1 ] 2>/dev/null; then pass "Dashboard: रु$REV, $ORD orders, $CUST custs, $STAT statuses, $RECENT recent"; else E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null); fail "Dashboard" "$E"; fi

echo ""
echo "── 5. GET /api/admin/orders ─────────────────────────"
R=$(curl -s -b /tmp/s7a2.txt "$BASE/api/admin/orders")
AC=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin).get('orders',[])))" 2>/dev/null)
AT=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('pagination',{}).get('total',0))" 2>/dev/null)
if [ "$AC" -ge 1 ] 2>/dev/null; then pass "Admin orders: $AC / $AT"; else E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null); fail "Orders" "$E"; fi

echo ""
echo "── 6. GET /api/admin/orders?status=delivered ────────"
R=$(curl -s -b /tmp/s7a2.txt "$BASE/api/admin/orders?status=delivered")
SC=$(echo "$R" | python3 -c "
import sys,json; d=json.load(sys.stdin); os=d.get('orders',[])
print('true' if not os else str(all(o.get('status')=='delivered' for o in os)))
" 2>/dev/null)
if [ "$SC" = "True" ]; then pass "Status filter OK"; else fail "Filter" "mixed statuses"; fi

echo ""
echo "── 7. GET /api/admin/users ──────────────────────────"
R=$(curl -s -b /tmp/s7a2.txt "$BASE/api/admin/users")
UC=$(echo "$R" | python3 -c "import sys,json;print(len(json.load(sys.stdin).get('users',[])))" 2>/dev/null)
NH=$(echo "$R" | python3 -c "import sys,json;us=json.load(sys.stdin).get('users',[]);print('no' if us and 'passwordHash' in us[0] else 'yes')" 2>/dev/null)
if [ "$UC" -ge 1 ] 2>/dev/null && [ "$NH" = "yes" ]; then pass "Users: $UC, hash hidden=$NH"; else fail "Users" "$UC"; fi

echo ""
echo "── 8. GET /api/admin/users/[id] ─────────────────────"
CID=$(curl -s -b /tmp/s7a2.txt "$BASE/api/admin/users" | python3 -c "
import sys,json
for u in json.load(sys.stdin).get('users',[]):
  if u.get('role')=='customer': print(u['id']); break
" 2>/dev/null)
if [ -n "$CID" ]; then
  R=$(curl -s -b /tmp/s7a2.txt "$BASE/api/admin/users/$CID")
  UN=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('name',''))" 2>/dev/null)
  US=$(echo "$R" | python3 -c "import sys,json;s=json.load(sys.stdin).get('stats',{});print(f\"{s.get('totalOrders',0)} orders, रु{s.get('totalSpent',0)}\")" 2>/dev/null)
  pass "User: $UN — $US"
else fail "User" "No customer"; fi

echo ""
echo "── 9. POST /api/coupons — create ────────────────────"
R=$(curl -s -b /tmp/s7a2.txt -X POST "$BASE/api/coupons" -H "Content-Type: application/json" -d '{"code":"STEP7TEST","type":"fixed","value":500,"minOrder":1000}')
CC=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('coupon',{}).get('code',''))" 2>/dev/null)
if [ "$CC" = "STEP7TEST" ]; then pass "Created: $CC"; else E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null); fail "Create" "$E"; fi

echo ""
echo "── 10. POST /api/coupons — duplicate ────────────────"
R=$(curl -s -b /tmp/s7a2.txt -X POST "$BASE/api/coupons" -H "Content-Type: application/json" -d '{"code":"STEP7TEST","type":"fixed","value":999}')
E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$E" | grep -qi "exists"; then pass "Dup: $E"; else fail "Dup" "$E"; fi

echo ""
echo "── 11. POST /api/coupons — 150% rejected ────────────"
R=$(curl -s -b /tmp/s7a2.txt -X POST "$BASE/api/coupons" -H "Content-Type: application/json" -d '{"code":"BADPCT","type":"percentage","value":150}')
E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$E" | grep -qi "100\|exceed"; then pass "150% rejected"; else fail "Pct" "$E"; fi

echo ""
echo "── 12. POST /api/coupons — customer blocked ──────────"
R=$(curl -s -b /tmp/s7c2.txt -X POST "$BASE/api/coupons" -H "Content-Type: application/json" -d '{"code":"HACK","type":"fixed","value":9999}')
E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$E" | grep -qi "admin"; then pass "Customer blocked: $E"; else fail "Cust" "$E"; fi

echo ""
echo "── 13. PUT /api/coupons/[id] — update ────────────────"
COID=$(node -e "const{PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.coupon.findUnique({where:{code:'STEP7TEST'}}).then(c=>{if(c)console.log(c.id);else console.log('NF')}).finally(()=>db.\$disconnect())" 2>/dev/null)
if [ "$COID" != "NF" ] && [ -n "$COID" ]; then
  R=$(curl -s -b /tmp/s7a2.txt -X PUT "$BASE/api/coupons/$COID" -H "Content-Type: application/json" -d '{"value":750}')
  UC=$(echo "$R" | python3 -c "import sys,json;c=json.load(sys.stdin).get('coupon',{});print(f\"{c.get('code')}=रु{c.get('value')}\")" 2>/dev/null)
  pass "Updated: $UC"
else fail "Update" "Not found"; fi

echo ""
echo "── 14. DELETE /api/coupons/[id] — unused ─────────────"
if [ "$COID" != "NF" ] && [ -n "$COID" ]; then
  R=$(curl -s -b /tmp/s7a2.txt -X DELETE "$BASE/api/coupons/$COID")
  DM=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('message',''))" 2>/dev/null)
  if echo "$DM" | grep -qi "deleted"; then pass "Deleted: $DM"; else E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null); fail "Del" "$E"; fi
else fail "Del" "No ID"; fi

echo ""
echo "── 15. DELETE /api/coupons — used coupon rejected ───"
WID=$(node -e "const{PrismaClient}=require('@prisma/client');const db=new PrismaClient();db.coupon.findUnique({where:{code:'WELCOME10'}}).then(c=>{if(c)console.log(c.id);else console.log('NF')}).finally(()=>db.\$disconnect())" 2>/dev/null)
if [ "$WID" != "NF" ] && [ -n "$WID" ]; then
  R=$(curl -s -b /tmp/s7a2.txt -X DELETE "$BASE/api/coupons/$WID")
  E=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  if echo "$E" | grep -qi "cannot\|used"; then pass "Used rejected: $E"; else fail "Used" "$E"; fi
else fail "Used" "Not found"; fi

echo ""
echo "── 16. GET /api/coupons (public validation) ───────────"
R=$(curl -s "$BASE/api/coupons?code=WELCOME10&subtotal=5000")
V=$(echo "$R" | python3 -c "import sys,json;print(json.load(sys.stdin).get('valid','false'))" 2>/dev/null)
if [ "$V" = "True" ]; then pass "Public coupon: valid"; else fail "Coupon" "blocked"; fi

echo ""
echo "======================================================"
echo -e "  RESULTS: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "======================================================"
