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

import React, { memo, ReactElement, useContext } from "react"

import { PageLink as PageLinkProto } from "@streamlit/protobuf"

import { LibContext } from "~lib/components/core/LibContext"
import { BaseButtonTooltip } from "~lib/components/shared/BaseButton"
import { DynamicIcon } from "~lib/components/shared/Icon"
import StreamlitMarkdown from "~lib/components/shared/StreamlitMarkdown"
import { Placement } from "~lib/components/shared/Tooltip"
import { useEmotionTheme } from "~lib/hooks/useEmotionTheme"

import {
  StyledNavLink,
  StyledNavLinkContainer,
  StyledNavLinkText,
} from "./styled-components"

export interface Props {
  disabled: boolean
  element: PageLinkProto
}

function PageLink(props: Readonly<Props>): ReactElement {
  const { onPageChange, currentPageScriptHash } = useContext(LibContext)

  const { colors } = useEmotionTheme()

  const { disabled, element } = props

  const isCurrentPage = currentPageScriptHash === element.pageScriptHash

  // Construct the URL with query params if provided
  const constructUrlWithParams = (
    baseUrl: string,
    queryParams?: { [key: string]: string }
  ): string => {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return baseUrl
    }

    const url = new URL(baseUrl, window.location.origin)
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    // For relative URLs (internal pages), return just the pathname + search
    if (!element.external) {
      return url.pathname + url.search
    }

    // For external URLs, return the full URL
    return url.toString()
  }

  const urlWithParams = constructUrlWithParams(
    element.page,
    element.queryParams
  )

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    if (element.external) {
      // External Page Link
      if (disabled) {
        e.preventDefault()
      }
    } else {
      // MPA Page Link
      e.preventDefault()
      if (!disabled) {
        // If there are query params, navigate using window.location to preserve them
        if (element.queryParams && Object.keys(element.queryParams).length > 0) {
          window.location.href = urlWithParams
        } else {
          // No query params - use standard Streamlit navigation
          onPageChange(element.pageScriptHash)
        }
      }
    }
  }

  return (
    <div className="stPageLink" data-testid="stPageLink">
      <BaseButtonTooltip
        help={element.help}
        placement={Placement.TOP_RIGHT}
        containerWidth={true}
      >
        <StyledNavLinkContainer>
          <StyledNavLink
            data-testid="stPageLink-NavLink"
            disabled={disabled}
            isCurrentPage={isCurrentPage}
            href={urlWithParams}
            target={element.external ? "_blank" : ""}
            rel="noreferrer"
            onClick={handleClick}
          >
            {element.icon && (
              <DynamicIcon
                size="lg"
                color={disabled ? colors.fadedText40 : colors.bodyText}
                iconValue={element.icon}
              />
            )}
            <StyledNavLinkText disabled={disabled}>
              <StreamlitMarkdown
                source={element.label}
                allowHTML={false}
                isLabel
                boldLabel={isCurrentPage}
                largerLabel
                disableLinks
              />
            </StyledNavLinkText>
          </StyledNavLink>
        </StyledNavLinkContainer>
      </BaseButtonTooltip>
    </div>
  )
}

export default memo(PageLink)
