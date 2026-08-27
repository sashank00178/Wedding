#!/usr/bin/env python3
"""STEP 7 Test Suite — Admin Routes"""
import requests, json, sys

BASE = "http://localhost:3000"
s = requests.Session()
PASS = FAIL = 0

def pass_t(msg):
    global PASS; PASS += 1; print(f"  \u2713 PASS: {msg}")

def fail_t(msg):
    global FAIL; FAIL += 1; print(f"  \u2717 FAIL: {msg}")

# 1. No auth
r = requests.get(f"{BASE}/api/admin/dashboard")
if r.status_code in (401, 403):
    pass_t(f"No-auth blocked (HTTP {r.status_code})")
else:
    fail_t(f"Expected 401/403, got {r.status_code}")

# 2. Login admin
r = s.get(f"{BASE}/api/auth/csrf")
csrf = r.json().get("csrfToken", "")
r = s.post(f"{BASE}/api/auth/callback/credentials",
    data={"email":"admin@weddingmomentnepal.com","password":"admin123","csrfToken":csrf},
    allow_redirects=False)
print(f"  Admin login: HTTP {r.status_code}")

# 3. Login customer
sc = requests.Session()
r = sc.get(f"{BASE}/api/auth/csrf")
csrf = r.json().get("csrfToken", "")
r = sc.post(f"{BASE}/api/auth/callback/credentials",
    data={"email":"customer@demo.com","password":"password123","csrfToken":csrf},
    allow_redirects=False)
print(f"  Customer login: HTTP {r.status_code}")

# 4. Customer blocked from admin
r = sc.get(f"{BASE}/api/admin/orders")
if r.status_code == 403:
    pass_t(f"Customer blocked from admin orders")
else:
    fail_t(f"Expected 403, got {r.status_code}: {r.text[:80]}")

# 5. Public routes work
r = requests.get(f"{BASE}/api/products?limit=1")
if r.status_code == 200 and len(r.json().get("products", [])) > 0:
    pass_t(f"Products public: {len(r.json()['products'])} results")
else:
    fail_t(f"Products blocked: {r.status_code}")

# 6. Dashboard
r = s.get(f"{BASE}/api/admin/dashboard")
if r.status_code == 200:
    d = r.json()
    pass_t(f"Dashboard: NPR {d.get('totalRevenue',0)}, {d.get('totalOrders',0)} orders, "
           f"{d.get('customerCount',0)} custs, {len(d.get('ordersByStatus',{}))} statuses")
else:
    fail_t(f"Dashboard: {r.status_code} {r.text[:80]}")

# 7. Admin orders
r = s.get(f"{BASE}/api/admin/orders")
if r.status_code == 200:
    d = r.json()
    pass_t(f"Admin orders: {len(d['orders'])} / {d['pagination']['total']}")
else:
    fail_t(f"Admin orders: {r.status_code} {r.text[:80]}")

# 8. Status filter
r = s.get(f"{BASE}/api/admin/orders?status=delivered")
if r.status_code == 200:
    d = r.json()
    orders = d.get("orders", [])
    ok = all(o["status"] == "delivered" for o in orders) if orders else True
    if ok:
        pass_t(f"Status filter: {len(orders)} delivered")
    else:
        fail_t("Status filter: mixed statuses")
else:
    fail_t(f"Filter: {r.status_code}")

# 9. Admin users
r = s.get(f"{BASE}/api/admin/users")
if r.status_code == 200:
    d = r.json()
    users = d.get("users", [])
    safe = "passwordHash" not in users[0] if users else True
    pass_t(f"Users: {len(users)}, hash_safe={safe}")
else:
    fail_t(f"Users: {r.status_code}")

# 10. User detail
cid = None
for u in users:
    if u.get("role") == "customer":
        cid = u["id"]; break
if cid:
    r = s.get(f"{BASE}/api/admin/users/{cid}")
    if r.status_code == 200:
        d = r.json()
        stats = d.get("stats", {})
        pass_t(f"User: {d['name']}, {stats.get('totalOrders',0)} orders, NPR {stats.get('totalSpent',0)}")
    else:
        fail_t(f"User detail: {r.status_code}")
else:
    fail_t("No customer ID for detail test")

# 11. Create coupon
r = s.post(f"{BASE}/api/coupons", json={"code":"S7TEST","type":"fixed","value":500,"minOrder":1000})
if r.status_code in (200, 201) and r.json().get("coupon", {}).get("code"):
    pass_t(f"Created coupon: S7TEST")
else:
    fail_t(f"Create: {r.status_code} {r.text[:80]}")

# 12. Duplicate
r = s.post(f"{BASE}/api/coupons", json={"code":"S7TEST","type":"fixed","value":999})
if "exists" in r.json().get("error", "").lower():
    pass_t("Duplicate rejected")
else:
    fail_t(f"Duplicate: {r.text[:80]}")

# 13. 150%
r = s.post(f"{BASE}/api/coupons", json={"code":"X","type":"percentage","value":150})
if "exceed" in r.json().get("error", "").lower() or "100" in r.json().get("error", ""):
    pass_t("150% rejected")
else:
    fail_t(f"150%: {r.text[:80]}")

# 14. Customer create blocked
r = sc.post(f"{BASE}/api/coupons", json={"code":"HACK","type":"fixed","value":9999})
if r.status_code == 403:
    pass_t("Customer create blocked")
else:
    fail_t(f"Customer create: {r.status_code}")

print(f"\n{'='*50}")
print(f"  RESULTS: {PASS} passed, {FAIL} failed")
print(f"{'='*50}")
