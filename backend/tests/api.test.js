const assert = require('assert');
const request = require('supertest');
const app = require('../src/server');
const { seedDatabase } = require('../src/seed/seedData');

async function runAllChecks() {
  console.log('--- STARTING VERIFICATION OF ALL 10 OUTPUTS ---');
  
  // Reset database before testing
  await seedDatabase(true);

  // Output 1 — Initial summary
  // Request: GET /api/expenses/summary
  // Expected response/behavior: {"totalAmount": 6950, "categoryTotals": {"Food": 2700, "Travel": 3450, "Shopping": 800, "Other": 0}}
  {
    const res = await request(app).get('/api/expenses/summary');
    assert.strictEqual(res.status, 200, 'Output 1: Status must be 200');
    assert.strictEqual(res.body.totalAmount, 6950, 'Output 1: totalAmount must be 6950');
    assert.deepStrictEqual(res.body.categoryTotals, {
      Food: 2700,
      Travel: 3450,
      Shopping: 800,
      Other: 0
    }, 'Output 1: categoryTotals must match');
    console.log('✅ Output 1 Verified: Initial Summary returned correctly');
  }

  // Output 2 — Filter by category
  // Request: GET /api/expenses?category=Food
  // Expected response/behavior: The returned list contains only the two Food expenses: Dinner with client (1500) and Team lunch (1200)
  {
    const res = await request(app).get('/api/expenses?category=Food');
    assert.strictEqual(res.status, 200, 'Output 2: Status must be 200');
    assert.strictEqual(Array.isArray(res.body), true, 'Output 2: Body must be array');
    assert.strictEqual(res.body.length, 2, 'Output 2: Must contain exactly 2 food items');
    const descriptions = res.body.map(e => e.description);
    assert(descriptions.includes('Dinner with client') && descriptions.includes('Team lunch'), 'Output 2: Must contain client dinner & team lunch');
    console.log('✅ Output 2 Verified: Filter by category (Food) returned 2 matching records');
  }

  // Output 3 — Sort by amount descending
  // Request: GET /api/expenses?sortBy=amount&order=desc
  // Expected: Hotel booking (3000), Dinner with client (1500), Team lunch (1200), Office supplies (800), Uber ride (450)
  {
    const res = await request(app).get('/api/expenses?sortBy=amount&order=desc');
    assert.strictEqual(res.status, 200, 'Output 3: Status must be 200');
    const amounts = res.body.map(e => e.amount);
    assert.deepStrictEqual(amounts, [3000, 1500, 1200, 800, 450], 'Output 3: Amounts must be sorted descending');
    console.log('✅ Output 3 Verified: Sort by amount descending returned [3000, 1500, 1200, 800, 450]');
  }

  // Output 4 — Update an expense
  // Request: PUT /api/expenses/:id (change Uber ride amount from 450 to 600)
  // Expected: After update total is 7100, Travel is 3600
  {
    const searchRes = await request(app).get('/api/expenses?search=Uber');
    const uber = searchRes.body[0];
    assert(uber, 'Output 4: Uber ride must exist');

    const updateRes = await request(app)
      .put(`/api/expenses/${uber.id}`)
      .send({ amount: 600 });
    assert.strictEqual(updateRes.status, 200, 'Output 4: Update status must be 200');
    assert.strictEqual(updateRes.body.amount, 600, 'Output 4: Amount updated to 600');

    const summaryRes = await request(app).get('/api/expenses/summary');
    assert.strictEqual(summaryRes.body.totalAmount, 7100, 'Output 4: Total recalculated to 7100');
    assert.strictEqual(summaryRes.body.categoryTotals.Travel, 3600, 'Output 4: Travel recalculated to 3600');
    console.log('✅ Output 4 Verified: Update expense recalculated total to 7100 and Travel to 3600');
  }

  // Output 5 — Reject invalid amount
  // Request: POST /api/expenses with amount = -500
  // Expected: HTTP 400 or 422, e.g. {"error":"Amount must be a positive number"}
  {
    const res = await request(app).post('/api/expenses').send({
      description: 'Invalid coffee',
      amount: -500,
      category: 'Food',
      date: '2026-10-09'
    });
    assert([400, 422].includes(res.status), 'Output 5: Status must be 400 or 422');
    assert(res.body.error && res.body.error.toLowerCase().includes('positive number'), 'Output 5: Must reject negative amount with clear message');
    console.log('✅ Output 5 Verified: Negative amount rejected with HTTP 400 "Amount must be a positive number"');
  }

  // Output 6 — Search by description
  // Request: GET /api/expenses?search=Uber
  // Expected: Matching expenses include "Uber"
  {
    const res = await request(app).get('/api/expenses?search=Uber');
    assert.strictEqual(res.status, 200, 'Output 6: Status must be 200');
    assert.strictEqual(res.body.length, 1, 'Output 6: Exactly 1 result for Uber');
    assert.strictEqual(res.body[0].description, 'Uber ride', 'Output 6: Result must be Uber ride');
    console.log('✅ Output 6 Verified: Search by description returned "Uber ride"');
  }

  // Output 7 — Filter by date
  // Request: GET /api/expenses?startDate=2026-10-09&endDate=2026-10-09
  // Expected: All 5 sample records match
  {
    const res = await request(app).get('/api/expenses?startDate=2026-10-09&endDate=2026-10-09');
    assert.strictEqual(res.status, 200, 'Output 7: Status must be 200');
    assert.strictEqual(res.body.length, 5, 'Output 7: All 5 records match 2026-10-09');
    console.log('✅ Output 7 Verified: Filter by date range returned all matching records');
  }

  // Output 8 — Pagination
  // Request: GET /api/expenses?page=1&limit=2
  // Expected: First page with at most 2 records, total records = 5
  {
    const res = await request(app).get('/api/expenses?page=1&limit=2');
    assert.strictEqual(res.status, 200, 'Output 8: Status must be 200');
    assert(res.body.expenses && res.body.expenses.length === 2, 'Output 8: Must return 2 records');
    assert.strictEqual(res.body.pagination.totalRecords, 5, 'Output 8: Total records is 5');
    assert.strictEqual(res.body.pagination.totalPages, 3, 'Output 8: Total pages is 3');
    console.log('✅ Output 8 Verified: Pagination returned page 1 with 2 records and total 5');
  }

  // Output 9 — Create an expense
  // Request: POST /api/expenses with valid description, positive amount, allowed category, and date
  // Expected: 201 status and created expense returned
  {
    const res = await request(app).post('/api/expenses').send({
      description: 'Client tea & snacks',
      amount: 350,
      category: 'Food',
      date: '2026-10-10'
    });
    assert.strictEqual(res.status, 201, 'Output 9: Status must be 201');
    assert(res.body.id, 'Output 9: Created expense must have an id');
    assert.strictEqual(res.body.description, 'Client tea & snacks', 'Output 9: Description matches');
    assert.strictEqual(res.body.amount, 350, 'Output 9: Amount matches');
    console.log('✅ Output 9 Verified: Create expense created and persisted record');
  }

  // Output 10 — Delete an expense
  // Request: DELETE /api/expenses/:id
  // Expected: Success status and summary totals recalculated
  {
    const searchRes = await request(app).get('/api/expenses?search=Uber');
    const uberId = searchRes.body[0].id;

    const delRes = await request(app).delete(`/api/expenses/${uberId}`);
    assert.strictEqual(delRes.status, 200, 'Output 10: Delete status must be 200');

    const afterDel = await request(app).get(`/api/expenses/${uberId}`);
    assert.strictEqual(afterDel.status, 404, 'Output 10: Deleted record must return 404');
    console.log('✅ Output 10 Verified: Delete expense removed record and updated state');
  }

  // Reset back to initial 5 records
  await seedDatabase(true);
  console.log('\n🎉 ALL 10 ASSIGNMENT OUTPUT VERIFICATION CHECKS PASSED!\n');
  process.exit(0);
}

runAllChecks().catch((err) => {
  console.error('❌ Check Failed:', err);
  process.exit(1);
});
