import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip, Toasts, ScoreRings, CarbonClock } from './Shared.jsx'

describe('Chip', () => {
  it('renders its label text', () => {
    render(<Chip label="Test badge" />)
    expect(screen.getByText('Test badge')).toBeInTheDocument()
  })
})

describe('Toasts', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(<Toasts items={[]} />)
    expect(container.querySelectorAll('div').length).toBe(1) // just the wrapper
  })

  it('renders a message for each toast item', () => {
    render(<Toasts items={[{ id: 1, msg: 'Saved!', ok: true }, { id: 2, msg: 'Failed', ok: false }]} />)
    expect(screen.getByText(/Saved!/)).toBeInTheDocument()
    expect(screen.getByText(/Failed/)).toBeInTheDocument()
  })

  it('exposes toasts to assistive tech via a live region', () => {
    render(<Toasts items={[{ id: 1, msg: 'Saved!', ok: true }]} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('ScoreRings', () => {
  const fp = { transport: 50, energy: 30, food: 60, shopping: 10 }

  it('renders an svg with the numeric score visible as text', () => {
    render(<ScoreRings fp={fp} score={72} color="#c2f542" />)
    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('renders a legend entry for every footprint category', () => {
    render(<ScoreRings fp={fp} score={72} color="#c2f542" />)
    expect(screen.getByText('Transport')).toBeInTheDocument()
    expect(screen.getByText('Energy')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })
})

describe('CarbonClock', () => {
  it('renders the live emissions label', () => {
    render(<CarbonClock yearly={2300} />)
    expect(screen.getByText(/YOUR EMISSIONS TODAY/)).toBeInTheDocument()
  })
})
