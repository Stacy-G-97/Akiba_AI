type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateInventoryItem(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    errors.push('Quantity must be a non-negative number');
  }

  if (!data.unit || typeof data.unit !== 'string') {
    errors.push('Unit is required and must be a string');
  }

  if (typeof data.cost !== 'number' || data.cost < 0) {
    errors.push('Cost must be a non-negative number');
  }

  if (!['good', 'warning', 'critical'].includes(data.status)) {
    errors.push('Status must be one of: good, warning, critical');
  }

  if (data.expiry_date && isNaN(Date.parse(data.expiry_date))) {
    errors.push('Expiry date must be a valid date string');
  }

  return { valid: errors.length === 0, errors };
}

function validatePrediction(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.item_name || typeof data.item_name !== 'string' || data.item_name.length === 0) {
    errors.push('Item name is required and must be a non-empty string');
  }

  if (typeof data.predicted_demand !== 'number' || data.predicted_demand < 0) {
    errors.push('Predicted demand must be a non-negative number');
  }

  if (typeof data.confidence_score !== 'number' || data.confidence_score < 0 || data.confidence_score > 100) {
    errors.push('Confidence score must be a number between 0 and 100');
  }

  if (!data.recommendation || typeof data.recommendation !== 'string') {
    errors.push('Recommendation is required and must be a string');
  }

  if (typeof data.timeframe_days !== 'number' || data.timeframe_days <= 0 || data.timeframe_days > 365) {
    errors.push('Timeframe days must be a number between 1 and 365');
  }

  return { valid: errors.length === 0, errors };
}

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error}`);
    return false;
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message || `Expected ${expectedStr} but got ${actualStr}`);
  }
}

console.log('\n🧪 Running Input Validation Tests...\n');

let passed = 0;
let failed = 0;

if (runTest('sanitizeString - removes HTML tags', () => {
  const result = sanitizeString('<script>alert("xss")</script>');
  assertEqual(result, 'scriptalert("xss")/script');
})) passed++; else failed++;

if (runTest('sanitizeString - trims whitespace', () => {
  const result = sanitizeString('  test  ');
  assertEqual(result, 'test');
})) passed++; else failed++;

if (runTest('validateInventoryItem - accepts valid data', () => {
  const result = validateInventoryItem({
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 10,
    unit: 'kg',
    cost: 500,
    status: 'good'
  });
  assertEqual(result.valid, true);
  assertEqual(result.errors.length, 0);
})) passed++; else failed++;

if (runTest('validateInventoryItem - rejects missing name', () => {
  const result = validateInventoryItem({
    category: 'Vegetables',
    quantity: 10,
    unit: 'kg',
    cost: 500,
    status: 'good'
  });
  assertEqual(result.valid, false);
  assertEqual(result.errors.length > 0, true);
})) passed++; else failed++;

if (runTest('validateInventoryItem - rejects negative quantity', () => {
  const result = validateInventoryItem({
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: -5,
    unit: 'kg',
    cost: 500,
    status: 'good'
  });
  assertEqual(result.valid, false);
})) passed++; else failed++;

if (runTest('validateInventoryItem - rejects invalid status', () => {
  const result = validateInventoryItem({
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 10,
    unit: 'kg',
    cost: 500,
    status: 'invalid'
  });
  assertEqual(result.valid, false);
})) passed++; else failed++;

if (runTest('validatePrediction - accepts valid data', () => {
  const result = validatePrediction({
    item_name: 'Chapati',
    predicted_demand: 50,
    confidence_score: 85,
    recommendation: 'Order more',
    timeframe_days: 3
  });
  assertEqual(result.valid, true);
  assertEqual(result.errors.length, 0);
})) passed++; else failed++;

if (runTest('validatePrediction - rejects confidence score > 100', () => {
  const result = validatePrediction({
    item_name: 'Chapati',
    predicted_demand: 50,
    confidence_score: 150,
    recommendation: 'Order more',
    timeframe_days: 3
  });
  assertEqual(result.valid, false);
})) passed++; else failed++;

if (runTest('validatePrediction - rejects negative timeframe', () => {
  const result = validatePrediction({
    item_name: 'Chapati',
    predicted_demand: 50,
    confidence_score: 85,
    recommendation: 'Order more',
    timeframe_days: -1
  });
  assertEqual(result.valid, false);
})) passed++; else failed++;

if (runTest('validatePrediction - rejects timeframe > 365', () => {
  const result = validatePrediction({
    item_name: 'Chapati',
    predicted_demand: 50,
    confidence_score: 85,
    recommendation: 'Order more',
    timeframe_days: 400
  });
  assertEqual(result.valid, false);
})) passed++; else failed++;

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
