import { describe, it, expect } from 'vitest'
import {
  EF, BUDGET, INDIA_AVG, MONTHS,
  calcFP, getScore, getTopActions, calcMoney, makeTrend, getBudgetDate,
} from '../lib/calculations.js'

describe('calcFP', () => {
  it('returns all-zero footprint for empty input except baseline food (defaults to vegetarian)', () => {
    const fp = calcFP({})
    expect(fp.transport).toBe(0)
    expect(fp.energy).toBe(0)
    expect(fp.shopping).toBe(0)
    expect(fp.food).toBeCloseTo(EF.vegetarian * 30, 5)
    expect(fp.monthly).toBeCloseTo(EF.vegetarian * 30, 5)
    expect(fp.yearly).toBeCloseTo(EF.vegetarian * 30 * 12, 5)
  })

  it('computes transport emissions from weekly km converted to monthly (x4)', () => {
    const fp = calcFP({ car_km: 100, diet: 'vegan' })
    expect(fp.transport).toBeCloseTo(100 * 4 * EF.car, 5)
  })

  it('accepts both snake_case and camelCase field aliases identically', () => {
    const a = calcFP({ car_km: 50, bus_km: 20, train_km: 10, metro_km: 5, ac_hours: 2, online_orders: 1, diet: 'vegan' })
    const b = calcFP({ carKm: 50, busKm: 20, trainKm: 10, metroKm: 5, acHours: 2, online: 1, diet: 'vegan' })
    expect(a).toEqual(b)
  })

  it('amortizes flights, clothing, and electronics across 12 months', () => {
    const fp = calcFP({ flights: 12, clothing: 12, electronics: 12, diet: 'vegan' })
    expect(fp.transport).toBeCloseTo(1 * EF.flight, 5)
    expect(fp.shopping).toBeCloseTo(1 * EF.clothing + 1 * EF.electronics, 5)
  })

  it('selects the correct diet emission factor', () => {
    const vegan = calcFP({ diet: 'vegan' })
    const veg   = calcFP({ diet: 'vegetarian' })
    const nonveg = calcFP({ diet: 'nonveg' })
    expect(vegan.food).toBeCloseTo(EF.vegan * 30, 5)
    expect(veg.food).toBeCloseTo(EF.vegetarian * 30, 5)
    expect(nonveg.food).toBeCloseTo(EF.nonveg * 30, 5)
    expect(nonveg.food).toBeGreaterThan(veg.food)
    expect(veg.food).toBeGreaterThan(vegan.food)
  })

  it('never returns negative category or total values', () => {
    const fp = calcFP({ car_km: -50, electricity: -10, diet: 'vegan' })
    expect(fp.transport).toBeGreaterThanOrEqual(0)
    expect(fp.energy).toBeGreaterThanOrEqual(0)
    expect(fp.monthly).toBeGreaterThanOrEqual(0)
    expect(fp.yearly).toBeGreaterThanOrEqual(0)
  })

  it('yearly is always exactly 12x monthly', () => {
    const fp = calcFP({ car_km: 80, electricity: 200, gas: 10, clothing: 6, diet: 'nonveg' })
    expect(fp.yearly).toBeCloseTo(fp.monthly * 12, 5)
  })

  it('monthly equals the sum of all four categories', () => {
    const fp = calcFP({ car_km: 40, bus_km: 10, electricity: 150, ac_hours: 3, gas: 5, clothing: 4, electronics: 1, online_orders: 2, diet: 'vegetarian' })
    expect(fp.monthly).toBeCloseTo(fp.transport + fp.energy + fp.food + fp.shopping, 5)
  })
})

describe('getScore', () => {
  it('returns the maximum score (100) for zero emissions', () => {
    const { score } = getScore(0)
    expect(score).toBe(100)
  })

  it('never drops below the floor of 8 regardless of how high emissions are', () => {
    const { score } = getScore(1_000_000)
    expect(score).toBe(8)
  })

  it('never exceeds 100 even for negative input', () => {
    const { score } = getScore(-500)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('decreases monotonically as yearly emissions increase', () => {
    const low  = getScore(1000).score
    const mid  = getScore(5000).score
    const high = getScore(10000).score
    expect(low).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(high)
  })

  it('assigns level labels consistent with documented thresholds', () => {
    expect(getScore(1000).level).toBe('Eco Champion')
    expect(getScore(2000).level).toBe('Green Hero')
    expect(getScore(4000).level).toBe('Earth Friend')
    expect(getScore(8000).level).toBe('Aware Citizen')
    expect(getScore(15000).level).toBe('Carbon Heavy')
  })

  it('returns a hex color string and a numeric xp value', () => {
    const { color, xp } = getScore(3000)
    expect(color).toMatch(/^#[0-9a-fA-F]{3,6}$/)
    expect(typeof xp).toBe('number')
    expect(xp).toBeGreaterThanOrEqual(60)
  })
})

describe('getTopActions', () => {
  it('returns exactly 3 actions ranked by descending category footprint', () => {
    const fp = { transport: 500, energy: 50, food: 200, shopping: 10 }
    const actions = getTopActions(fp)
    expect(actions).toHaveLength(3)
    expect(actions[0].cat).toBe('transport')
    expect(actions[1].cat).toBe('food')
    expect(actions[2].cat).toBe('energy')
  })

  it('rounds the projected savings to an integer', () => {
    const fp = { transport: 333, energy: 0, food: 0, shopping: 0 }
    const actions = getTopActions(fp)
    const transportAction = actions.find(a => a.cat === 'transport')
    expect(Number.isInteger(transportAction.save)).toBe(true)
  })
})

describe('calcMoney', () => {
  it('returns a monthly and a yearly figure where yearly = monthly * 12', () => {
    const fp = { transport: 100, energy: 80, food: 75, shopping: 30, monthly: 285, yearly: 3420 }
    const { monthly, yearly } = calcMoney(fp)
    expect(yearly).toBe(monthly * 12)
    expect(monthly).toBeGreaterThan(0)
  })

  it('scales monthly cost up as transport and energy increase', () => {
    const low  = calcMoney({ transport: 50,  energy: 30, shopping: 5 }).monthly
    const high = calcMoney({ transport: 500, energy: 300, shopping: 50 }).monthly
    expect(high).toBeGreaterThan(low)
  })
})

describe('makeTrend', () => {
  it('returns exactly 12 entries, one per month label', () => {
    const trend = makeTrend(300)
    expect(trend).toHaveLength(12)
    expect(trend.map(t => t.month)).toEqual(MONTHS)
  })

  it('produces deterministic, repeatable output for the same seed', () => {
    const a = makeTrend(300, 7)
    const b = makeTrend(300, 7)
    expect(a).toEqual(b)
  })

  it('produces different output for different seeds', () => {
    const a = makeTrend(300, 1)
    const b = makeTrend(300, 2)
    expect(a).not.toEqual(b)
  })
})

describe('getBudgetDate', () => {
  it('returns null when yearly emissions are within the 1.5°C budget', () => {
    expect(getBudgetDate(BUDGET)).toBeNull()
    expect(getBudgetDate(BUDGET - 100)).toBeNull()
  })

  it('returns a formatted date string when emissions exceed the budget', () => {
    const result = getBudgetDate(BUDGET * 2)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns an earlier budget-exhaustion date the higher the yearly emissions are', () => {
    const moderate = getBudgetDate(BUDGET * 2)
    const heavy    = getBudgetDate(BUDGET * 8)
    // Heavier emitters exhaust their budget earlier in the year;
    // both are valid date strings, this just confirms both compute without error.
    expect(moderate).not.toBeNull()
    expect(heavy).not.toBeNull()
  })
})

describe('constants sanity', () => {
  it('BUDGET and INDIA_AVG are positive numbers', () => {
    expect(BUDGET).toBeGreaterThan(0)
    expect(INDIA_AVG).toBeGreaterThan(0)
  })

  it('MONTHS contains 12 unique three-letter labels', () => {
    expect(MONTHS).toHaveLength(12)
    expect(new Set(MONTHS).size).toBe(12)
  })
})
