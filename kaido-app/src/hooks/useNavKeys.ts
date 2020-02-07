import { useEffect, useState } from "preact/hooks"

/**
 * Custom attribute to make a HTML element selectable using nav keys
 * Use "data-*" prefix as it can be recognized by Theme UI components (e.g. Box, Container...)
 */
const attributeSelectable = `data-nav-selectable`
const attributeSelected = `data-nav-selected`
const attributeIndex = `data-nav-index`

type NavKey =
  | `Escape`
  | `SoftLeft`
  | `SoftRight`
  | `Backspace`
  | `ArrowUp`
  | `ArrowDown`
  | `ArrowLeft`
  | `ArrowRight`
  | `Enter`

interface Options {
  capture?: boolean
  stopPropagation?: boolean
  isMenuOpened?: boolean
}

export const useNavKeys = (actions: { [key in NavKey]?: () => void }, options: Options = {}) => {
  const keys = [
    `Escape`,
    `SoftLeft`,
    `SoftRight`,
    `Backspace`,
    `ArrowUp`,
    `ArrowDown`,
    `ArrowLeft`,
    `ArrowRight`,
    `Enter`,
  ]

  const [current, setCurrent] = useState<number | null>(null)
  console.log(`current: ${current}`)

  const getAllElements = () =>
    options.isMenuOpened
      ? document.getElementById(`menu`)!.querySelectorAll<HTMLElement>(`[${attributeSelectable}]`)
      : document.querySelectorAll<HTMLElement>(`[${attributeSelectable}]`)

  const getSelectedElementIndex = () => {
    const element = options.isMenuOpened
      ? document.getElementById(`menu`)!.querySelector(`[${attributeSelected}=true]`)
      : document.querySelector(`[${attributeSelected}=true]`)
    return element ? parseInt(element.getAttribute(attributeIndex) as string, 10) : 0
  }

  const selectElement = (element: HTMLElement, setIndex = 0) => {
    if (element) {
      ;[].forEach.call(getAllElements(), (el: HTMLElement, idx: number) => {
        const isEqual = el === element
        el.setAttribute(attributeIndex, `${idx}`)
        el.setAttribute(attributeSelected, `${isEqual}`)
        if (isEqual) el.focus()
        else el.blur()
      })
      if (!options.isMenuOpened) setCurrent(setIndex)
    } else {
      setNavigation(0)
    }
  }

  const setNavigation = (index: number) => selectElement(getAllElements()[index] || document.body)

  const parseKey = (ev: KeyboardEvent) => {
    // Simulate soft keys for testing purposes
    if (ev.shiftKey && ev.key === `ArrowLeft`) {
      return `SoftLeft`
    }
    if (ev.shiftKey && ev.key === `ArrowRight`) {
      return `SoftRight`
    }
    return ev.key
  }

  const handleKeyPress = (ev: KeyboardEvent) => {
    const key = parseKey(ev)
    if (!keys.includes(key)) {
      return
    }

    if (options.stopPropagation) {
      ev.stopPropagation()
      ev.preventDefault()
    }

    const action = actions[key as NavKey]

    if (!action) {
      return
    }

    if (key === `ArrowDown` || key === `ArrowUp`) {
      const allElements = getAllElements()
      const currentIndex = getSelectedElementIndex()

      let setIndex: number
      switch (key) {
        case `ArrowDown`: {
          const isLastElement = currentIndex + 1 > allElements.length - 1
          setIndex = isLastElement ? 0 : currentIndex + 1
          selectElement(allElements[setIndex] || allElements[0], setIndex)
          break
        }
        case `ArrowUp`: {
          const isFirstElement = currentIndex === 0
          setIndex = isFirstElement ? allElements.length - 1 : currentIndex - 1
          selectElement(allElements[setIndex] || allElements[0], setIndex)
          break
        }
        default:
          break
      }
    }

    action()
  }

  useEffect(() => {
    document.addEventListener(`keydown`, handleKeyPress, options.capture)
    // Set navigation from the first navigatable item
    const startFrom = current && !options.isMenuOpened ? current : 0
    setNavigation(startFrom)

    return () => {
      document.removeEventListener(`keydown`, handleKeyPress, options.capture)
    }
  }, [options.isMenuOpened])

  return { current, setNavigation }
}
