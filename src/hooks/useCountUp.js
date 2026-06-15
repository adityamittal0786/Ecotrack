import { useState, useEffect, useRef } from 'react'

export function useCountUp(target, ms = 1100) {
  const [value, setValue] = useState(0)
  const timer = useRef(null)
  useEffect(() => {
    clearInterval(timer.current)
    if (!target) { setValue(0); return }
    let cur = 0
    const step = target / (ms / 16)
    timer.current = setInterval(() => {
      cur = Math.min(cur + step, target)
      setValue(Math.round(cur))
      if (cur >= target) clearInterval(timer.current)
    }, 16)
    return () => clearInterval(timer.current)
  }, [target, ms])
  return value
}
