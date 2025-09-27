'use client'

import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'
import { ThemeProvider, useTheme } from 'next-themes'

export function ColorModeProvider(props) {
  return <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
}

export function useColorMode() {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }
  return {
    colorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue(light, dark) {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />
}

export const ColorModeButton = React.forwardRef(function ColorModeButton(
  props,
  ref
) {
  const { toggleColorMode } = useColorMode()
  return (
    <button
      onClick={toggleColorMode}
      aria-label="Toggle color mode"
      ref={ref}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      {...props}
    >
      <ColorModeIcon />
    </button>
  )
})

export const LightMode = React.forwardRef(function LightMode(props, ref) {
  return (
    <span
      className="contents"
      ref={ref}
      {...props}
    />
  )
})

export const DarkMode = React.forwardRef(function DarkMode(props, ref) {
  return (
    <span
      className="contents"
      ref={ref}
      {...props}
    />
  )
})
