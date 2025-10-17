# Warhammer 40K Reading Order Policy

## Important: Use Publication Order Only

For this project, books should ALWAYS be read in **Black Library publication order**, NOT in-universe chronological order.

### Why?

- Some books (like "The First Heretic") are prequels/flashbacks but should be read in publication order
- Black Library structured the series to be read in the order they were published
- Publication order provides the best narrative experience with proper reveals and callbacks

### Implementation

- `orderInSeries`: Book's position in the series (1, 2, 3...)
- This is the ONLY order field - it represents publication order

### When Adding New Books

- Set `orderInSeries` to the next sequential number in the series
- Never add a separate chronological order field
- Never rearrange books by in-universe timeline - that's not how they're meant to be read!
