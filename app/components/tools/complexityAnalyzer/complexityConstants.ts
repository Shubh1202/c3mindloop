/**
 * complexityConstants.ts
 *
 * Shared constants for the Code Complexity Analyzer tool:
 * accepted file extensions, extension-to-language mapping,
 * language display names, risk-level badge Tailwind classes,
 * numeric limits, and the built-in sample code snippet.
 */

import type { RiskLevel, SupportedLanguage } from './complexityTypes';

// ---------------------------------------------------------------------------
// File extension lists
// ---------------------------------------------------------------------------

export const ACCEPTED_EXTENSIONS: string[] = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.java',
  '.go',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
];

// ---------------------------------------------------------------------------
// Extension → language mapping
// ---------------------------------------------------------------------------

export const EXTENSION_LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  '.js':  'javascript',
  '.jsx': 'javascript',
  '.ts':  'typescript',
  '.tsx': 'typescript',
  '.py':  'python',
  '.java':'java',
  '.go':  'go',
  '.c':   'c',
  '.h':   'c',
  '.cpp': 'cpp',
  '.hpp': 'cpp',
};

// ---------------------------------------------------------------------------
// Human-readable language display names
// ---------------------------------------------------------------------------

export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python:     'Python',
  java:       'Java',
  go:         'Go',
  c:          'C',
  cpp:        'C++',
};

// ---------------------------------------------------------------------------
// Risk-level badge Tailwind classes
// ---------------------------------------------------------------------------

export const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  Low:      'text-emerald-400 bg-emerald-950',
  Medium:   'text-amber-400 bg-amber-950',
  High:     'text-orange-400 bg-orange-950',
  Critical: 'text-red-400 bg-red-950',
};

// ---------------------------------------------------------------------------
// Numeric limits
// ---------------------------------------------------------------------------

/** Maximum allowed characters in a single RefactorSuggestion text */
export const MAX_SUGGESTION_LENGTH = 120;

/** Maximum accepted file size for code upload (500 KB) */
export const MAX_FILE_SIZE_BYTES = 500 * 1024;

// ---------------------------------------------------------------------------
// Sample code — payment processor with varying complexity levels
// Exercises nested control structures, logical operators, multiple branches.
// ---------------------------------------------------------------------------

export const SAMPLE_CODE = `// Payment processor — demonstrates varying complexity levels

function validatePayment(payment) {
  if (!payment) return false;
  if (!payment.amount || payment.amount <= 0) return false;
  if (!payment.currency || payment.currency.length !== 3) return false;
  return !!payment.cardToken;
}

function applyPromoCode(cart, promoCode) {
  let discount = 0;
  if (!promoCode || promoCode.trim() === '') {
    return discount;
  }
  const code = promoCode.toUpperCase();
  if (code === 'SAVE10') {
    discount = 0.10;
  } else if (code === 'SAVE20') {
    discount = 0.20;
  } else if (code === 'HALFOFF') {
    discount = 0.50;
  } else if (code === 'FREESHIP') {
    discount = 0;
  }
  if (cart.total > 200 && discount < 0.20) {
    discount += 0.05;
  }
  return discount;
}

function processPayment(customer, cart, payment, inventory) {
  if (!validatePayment(payment)) {
    return { success: false, error: 'Invalid payment details' };
  }
  if (!customer || !customer.id) {
    return { success: false, error: 'Unknown customer' };
  }

  const lineResults = [];
  for (const item of cart.items) {
    let found = false;
    for (const stock of inventory) {
      if (stock.sku === item.sku) {
        found = true;
        if (stock.reserved + item.qty <= stock.total) {
          lineResults.push({ sku: item.sku, status: 'confirmed', qty: item.qty });
        } else if (stock.total - stock.reserved > 0) {
          const avail = stock.total - stock.reserved;
          lineResults.push({ sku: item.sku, status: 'partial', qty: avail });
        } else {
          lineResults.push({ sku: item.sku, status: 'unavailable', qty: 0 });
        }
        break;
      }
    }
    if (!found) {
      lineResults.push({ sku: item.sku, status: 'not_found', qty: 0 });
    }
  }

  const allConfirmed = lineResults.every(r => r.status === 'confirmed');
  const anyUnavailable = lineResults.some(r => r.status === 'unavailable' || r.status === 'not_found');

  if (anyUnavailable && !customer.allowPartial) {
    return { success: false, error: 'One or more items are out of stock', lines: lineResults };
  }

  const promoDiscount = applyPromoCode(cart, cart.promoCode);
  const loyaltyDiscount = customer.loyaltyTier === 'platinum' ? 0.10
    : customer.loyaltyTier === 'gold' ? 0.07
    : customer.loyaltyTier === 'silver' ? 0.03
    : 0;

  const totalDiscount = Math.min(promoDiscount + loyaltyDiscount, 0.50);
  const chargeAmount = parseFloat((cart.total * (1 - totalDiscount)).toFixed(2));

  return {
    success: true,
    partial: !allConfirmed,
    chargeAmount,
    currency: payment.currency,
    discountApplied: totalDiscount,
    lines: lineResults,
  };
}

function refundPayment(transaction, reason) {
  if (!transaction || !transaction.id) {
    return { ok: false, message: 'Missing transaction' };
  }
  if (transaction.status !== 'settled') {
    return { ok: false, message: 'Only settled transactions can be refunded' };
  }
  const allowed = ['duplicate', 'fraudulent', 'customer_request', 'item_not_received'];
  if (!allowed.includes(reason)) {
    return { ok: false, message: 'Invalid refund reason' };
  }
  return { ok: true, refundId: 'REF-' + transaction.id, amount: transaction.amount };
}
`;
