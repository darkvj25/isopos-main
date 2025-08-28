# TODO: Fix Inventory Management for Product Variants

## Problem
When a sale is completed for a product variant, the system should reduce the stock of that specific variant, not only track the parent product. Currently, the sale reduces nothing (or only the parent stock), leaving the variant stock unchanged in inventory.

## Steps to Fix

1. [x] Update the `recordSale` function in `src/hooks/usePosData.tsx` to:
   - Check if each sale item has a variant
   - If variant exists, reduce the specific variant stock using the `adjustStock` function
   - If no variant, reduce the parent product stock as before

2. [ ] Test the implementation to ensure:
   - Variant stock is correctly reduced during sales
   - Parent product stock remains unchanged when variants are sold
   - Non-variant products continue to work as before

## Files to Modify
- `src/hooks/usePosData.tsx` - Update recordSale function

## Expected Behavior
- Sale terminal reduces the exact variant stock upon checkout
- Inventory management reflects real-time stock per variant after each sale
- Parent product remains as a container/category for variants (stock only for non-variant items)
