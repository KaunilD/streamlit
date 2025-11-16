/**
 * Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from "react"

import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"

import { PageLink as PageLinkProto } from "@streamlit/protobuf"

import { render, renderWithContexts } from "~lib/test_util"
import { lightTheme } from "~lib/theme"

import PageLink, { Props } from "./PageLink"

const getProps = (
  elementProps: Partial<PageLinkProto> = {},
  widgetProps: Partial<Props> = {}
): Props => ({
  element: PageLinkProto.create({
    label: "Label",
    page: "streamlit_app",
    pageScriptHash: "main_page_hash",
    useContainerWidth: null,
    ...elementProps,
  }),
  disabled: false,
  ...widgetProps,
})

const mockOnPageChange = vi.fn()

describe("PageLink", () => {
  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  it("renders without crashing", () => {
    const props = getProps()
    render(<PageLink {...props} />)

    const pageLink = screen.getByRole("link")
    expect(pageLink).toBeInTheDocument()
  })

  it("has correct className", () => {
    const props = getProps()
    render(<PageLink {...props} />)

    const pageLink = screen.getByTestId("stPageLink")

    expect(pageLink).toHaveClass("stPageLink")
  })

  it("renders a label within the button", () => {
    const props = getProps()
    render(<PageLink {...props} />)

    const pageLink = screen.getByRole("link", {
      name: `${props.element.label}`,
    })

    expect(pageLink).toBeInTheDocument()
  })

  it("handles the disabled prop", () => {
    const props = getProps({}, { disabled: true })
    render(<PageLink {...props} />)

    const pageLink = screen.getByRole("link")
    expect(pageLink).toHaveAttribute("disabled")
  })

  it("triggers onPageChange with pageScriptHash when clicked", async () => {
    const user = userEvent.setup()
    const props = getProps()

    renderWithContexts(<PageLink {...props} />, {
      onPageChange: mockOnPageChange,
    })

    const pageNavLink = screen.getByTestId("stPageLink-NavLink")
    await user.click(pageNavLink)
    expect(mockOnPageChange).toHaveBeenCalledWith("main_page_hash")
  })

  it("does not trigger onPageChange when disabled", async () => {
    const user = userEvent.setup()
    const props = getProps({}, { disabled: true })

    renderWithContexts(<PageLink {...props} />, {
      onPageChange: mockOnPageChange,
    })

    const pageNavLink = screen.getByTestId("stPageLink-NavLink")
    await user.click(pageNavLink)
    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  it("does not trigger onPageChange for external links", async () => {
    const user = userEvent.setup()
    const props = getProps({ page: "http://example.com", external: true })

    renderWithContexts(<PageLink {...props} />, {
      onPageChange: mockOnPageChange,
    })

    const pageNavLink = screen.getByTestId("stPageLink-NavLink")
    await user.click(pageNavLink)
    expect(mockOnPageChange).not.toHaveBeenCalled()
  })

  it("renders an icon when provided", () => {
    const props = getProps({ icon: ":material/home:" })
    render(<PageLink {...props} />)

    const pageLinkIcon = screen.getByTestId("stIconMaterial")
    expect(pageLinkIcon).toHaveTextContent("home")
  })

  it("renders an emoji icon when provided", () => {
    const props = getProps({ icon: "🏠" })
    render(<PageLink {...props} />)

    const pageLinkIcon = screen.getByTestId("stIconEmoji")
    expect(pageLinkIcon).toHaveTextContent("🏠")
  })

  it("does not render an icon when empty string is provided", () => {
    const props = getProps({ icon: "" })
    render(<PageLink {...props} />)

    // Icon should not be rendered when empty string is provided
    const pageLinkIcon = screen.queryByTestId("stIconMaterial")
    expect(pageLinkIcon).not.toBeInTheDocument()

    // Also check for emoji icons
    const emojiIcon = screen.queryByTestId("stIconEmoji")
    expect(emojiIcon).not.toBeInTheDocument()
  })

  it("does not render an icon when icon is not provided", () => {
    const props = getProps({}) // No icon provided
    render(<PageLink {...props} />)

    // Icon should not be rendered when no icon is provided
    const pageLinkIcon = screen.queryByTestId("stIconMaterial")
    expect(pageLinkIcon).not.toBeInTheDocument()

    // Also check for emoji icons
    const emojiIcon = screen.queryByTestId("stIconEmoji")
    expect(emojiIcon).not.toBeInTheDocument()
  })

  it("renders a current page link properly", () => {
    const props = getProps({ pageScriptHash: "main_page_hash" })
    renderWithContexts(<PageLink {...props} />, {
      currentPageScriptHash: "main_page_hash",
    })

    const currentPageBgColor = lightTheme.emotion.colors.darkenedBgMix15

    const pageLink = screen.getByTestId("stPageLink-NavLink")
    expect(pageLink).toHaveStyle(`background-color: ${currentPageBgColor}`)
    const pageLinkText = screen.getByText(props.element.label)
    expect(pageLinkText).toHaveStyle(`font-weight: 600`)
  })

  it("renders an external page link properly", () => {
    const props = getProps({ page: "http://example.com", external: true })
    render(<PageLink {...props} />)

    const pageLink = screen.getByTestId("stPageLink-NavLink")
    expect(pageLink).toHaveAttribute("target", "_blank")
    expect(pageLink).toHaveStyle("background-color: rgba(0, 0, 0, 0)")
    const pageLinkText = screen.getByText(props.element.label)
    expect(pageLinkText).not.toHaveStyle(`font-weight: 600`)
  })

  it("renders with help properly", async () => {
    const user = userEvent.setup()
    render(<PageLink {...getProps({ help: "mockHelpText" })} />)

    // When the help param is used, page link renders twice (once for normal
    // tooltip and once for mobile tooltip) so we need to get the first one
    const pageLink = screen.getAllByTestId("stPageLink-NavLink")[0]
    // Ensure both the page link and tooltip target have correct width.
    // These will be 100% and the ElementContainer will have styles to determine
    // the button width.
    expect(pageLink).toHaveStyle("width: 100%")
    const tooltipTarget = screen.getByTestId("stTooltipHoverTarget")
    expect(tooltipTarget).toHaveStyle("width: 100%")

    // Ensure the tooltip content is visible and has the correct text
    await user.hover(tooltipTarget)

    const tooltipContent = await screen.findByTestId("stTooltipContent")
    expect(tooltipContent).toHaveTextContent("mockHelpText")
  })

  describe("query params", () => {
    it("appends query params to external URLs", () => {
      const props = getProps({
        page: "https://example.com",
        external: true,
        queryParams: { foo: "bar", baz: "qux" },
      })
      render(<PageLink {...props} />)

      const pageLink = screen.getByTestId("stPageLink-NavLink")
      const href = pageLink.getAttribute("href")

      expect(href).toContain("https://example.com")
      expect(href).toContain("foo=bar")
      expect(href).toContain("baz=qux")
    })

    it("appends query params to internal page URLs", () => {
      const props = getProps({
        page: "/my_page",
        external: false,
        queryParams: { tab: "settings", id: "123" },
      })
      render(<PageLink {...props} />)

      const pageLink = screen.getByTestId("stPageLink-NavLink")
      const href = pageLink.getAttribute("href")

      expect(href).toContain("/my_page")
      expect(href).toContain("tab=settings")
      expect(href).toContain("id=123")
    })

    it("handles empty query params object", () => {
      const props = getProps({
        page: "https://example.com",
        external: true,
        queryParams: {},
      })
      render(<PageLink {...props} />)

      const pageLink = screen.getByTestId("stPageLink-NavLink")
      const href = pageLink.getAttribute("href")

      expect(href).toBe("https://example.com")
      expect(href).not.toContain("?")
    })

    it("handles undefined query params", () => {
      const props = getProps({
        page: "https://example.com",
        external: true,
        queryParams: undefined,
      })
      render(<PageLink {...props} />)

      const pageLink = screen.getByTestId("stPageLink-NavLink")
      const href = pageLink.getAttribute("href")

      expect(href).toBe("https://example.com")
      expect(href).not.toContain("?")
    })

    it("properly URL-encodes special characters in query param values", () => {
      const props = getProps({
        page: "https://example.com",
        external: true,
        queryParams: { name: "John Doe", email: "test@example.com" },
      })
      render(<PageLink {...props} />)

      const pageLink = screen.getByTestId("stPageLink-NavLink")
      const href = pageLink.getAttribute("href")

      // URL should have encoded the space and special characters
      expect(href).toContain("name=")
      expect(href).toContain("email=")
      // Verify it's a valid URL
      expect(() => new URL(href!)).not.toThrow()
    })

    it("handles multiple query params", () => {
      const props = getProps({
        page: "https://example.com",
        external: true,
        queryParams: {
          param1: "value1",
          param2: "value2",
          param3: "value3",
        },
      })
      render(<PageLink {...props} />)

      const pageLink = screen.getByTestId("stPageLink-NavLink")
      const href = pageLink.getAttribute("href")

      expect(href).toContain("param1=value1")
      expect(href).toContain("param2=value2")
      expect(href).toContain("param3=value3")
    })

    it("uses window.location.href for internal navigation with query params", async () => {
      const user = userEvent.setup()

      // Store original window.location
      const originalLocation = window.location
      delete (window as any).location
      window.location = { ...originalLocation, href: "" } as any

      const props = getProps({
        page: "/my_page",
        external: false,
        pageScriptHash: "page_hash",
        queryParams: { tab: "settings" },
      })

      renderWithContexts(<PageLink {...props} />, {
        onPageChange: mockOnPageChange,
      })

      const pageNavLink = screen.getByTestId("stPageLink-NavLink")
      await user.click(pageNavLink)

      // Should navigate using window.location.href with query params
      expect(window.location.href).toContain("/my_page")
      expect(window.location.href).toContain("tab=settings")

      // Should NOT call onPageChange when there are query params
      expect(mockOnPageChange).not.toHaveBeenCalled()

      // Restore window.location
      window.location = originalLocation
    })

    it("uses onPageChange for internal navigation without query params", async () => {
      const user = userEvent.setup()
      const props = getProps({
        page: "/my_page",
        external: false,
        pageScriptHash: "page_hash",
        queryParams: undefined,
      })

      renderWithContexts(<PageLink {...props} />, {
        onPageChange: mockOnPageChange,
      })

      const pageNavLink = screen.getByTestId("stPageLink-NavLink")
      await user.click(pageNavLink)

      // Should use onPageChange when no query params
      expect(mockOnPageChange).toHaveBeenCalledWith("page_hash")
    })
  })
})
