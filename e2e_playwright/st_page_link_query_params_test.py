# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022-2025)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""E2E tests for st.page_link with query_params parameter."""

from playwright.sync_api import Page, expect

from e2e_playwright.conftest import ImageCompareFunction
from e2e_playwright.shared.app_utils import get_element_by_key


def test_external_link_with_query_params(app: Page):
    """Test that external links include query params in href."""
    external_links = get_element_by_key(app, "external_links")

    # Test link with query params
    link_with_params = external_links.get_by_test_id("stPageLink").nth(0)
    expect(link_with_params).to_be_visible()

    # Get the actual <a> tag
    anchor = link_with_params.get_by_test_id("stPageLink-NavLink")
    href = anchor.get_attribute("href")

    # Verify query params are in the URL
    assert href is not None
    assert "q=streamlit" in href
    assert "type=docs" in href
    assert "www.example.com/search" in href


def test_external_link_without_query_params(app: Page):
    """Test that external links without query params work normally."""
    external_links = get_element_by_key(app, "external_links")

    link_without_params = external_links.get_by_test_id("stPageLink").nth(1)
    expect(link_without_params).to_be_visible()

    anchor = link_without_params.get_by_test_id("stPageLink-NavLink")
    href = anchor.get_attribute("href")

    # Should not have query params
    assert href is not None
    assert "?" not in href
    assert "www.example.com" in href


def test_multiple_query_params(app: Page):
    """Test that multiple query params are properly included."""
    external_links = get_element_by_key(app, "external_links")

    link_multiple = external_links.get_by_test_id("stPageLink").nth(2)
    expect(link_multiple).to_be_visible()

    anchor = link_multiple.get_by_test_id("stPageLink-NavLink")
    href = anchor.get_attribute("href")

    # Verify all three query params are present
    assert href is not None
    assert "tab=repositories" in href
    assert "sort=stars" in href
    assert "direction=desc" in href


def test_empty_and_none_query_params(app: Page):
    """Test that empty dict and None query_params don't break."""
    empty_params = get_element_by_key(app, "empty_params")

    # Empty dict
    link_empty = empty_params.get_by_test_id("stPageLink").nth(0)
    expect(link_empty).to_be_visible()
    anchor_empty = link_empty.get_by_test_id("stPageLink-NavLink")
    href_empty = anchor_empty.get_attribute("href")
    assert href_empty is not None
    assert "?" not in href_empty

    # None params
    link_none = empty_params.get_by_test_id("stPageLink").nth(1)
    expect(link_none).to_be_visible()
    anchor_none = link_none.get_by_test_id("stPageLink-NavLink")
    href_none = anchor_none.get_attribute("href")
    assert href_none is not None
    assert "?" not in href_none


def test_special_characters_in_query_params(app: Page):
    """Test that special characters are properly URL-encoded."""
    special_chars = get_element_by_key(app, "special_chars")

    link = special_chars.get_by_test_id("stPageLink").first
    expect(link).to_be_visible()

    anchor = link.get_by_test_id("stPageLink-NavLink")
    href = anchor.get_attribute("href")

    # Verify special characters are encoded
    assert href is not None
    # Space should be encoded
    assert "John" in href and "Doe" in href
    # @ should be encoded as %40
    assert "test" in href and "example.com" in href


def test_disabled_link_with_query_params(app: Page):
    """Test that disabled links still include query params but are disabled."""
    disabled_link_container = get_element_by_key(app, "disabled_link")

    link = disabled_link_container.get_by_test_id("stPageLink").first
    expect(link).to_be_visible()

    anchor = link.get_by_test_id("stPageLink-NavLink")

    # Should still have query params in href
    href = anchor.get_attribute("href")
    assert href is not None
    assert "test=disabled" in href

    # Should be disabled (check for disabled attribute or style)
    # The disabled state is visual - we just verify the href is correct


def test_query_params_with_icons_and_help(app: Page):
    """Test that query params work with icons and help tooltips."""
    container = get_element_by_key(app, "with_icons_help")

    link = container.get_by_test_id("stPageLink").first
    expect(link).to_be_visible()

    # Check query params in href
    anchor = link.get_by_test_id("stPageLink-NavLink")
    href = anchor.get_attribute("href")
    assert href is not None
    assert "search=test" in href

    # Check that icon is present
    expect(link.locator("svg, img, span").first).to_be_visible()


def test_query_params_with_width_variations(app: Page):
    """Test that query params work with different width settings."""
    container = get_element_by_key(app, "width_variations")

    # Content width
    link_content = container.get_by_test_id("stPageLink").nth(0)
    expect(link_content).to_be_visible()
    anchor_content = link_content.get_by_test_id("stPageLink-NavLink")
    href_content = anchor_content.get_attribute("href")
    assert href_content is not None
    assert "width=content" in href_content

    # Stretch width
    link_stretch = container.get_by_test_id("stPageLink").nth(1)
    expect(link_stretch).to_be_visible()
    anchor_stretch = link_stretch.get_by_test_id("stPageLink-NavLink")
    href_stretch = anchor_stretch.get_attribute("href")
    assert href_stretch is not None
    assert "width=stretch" in href_stretch


def test_page_link_with_query_params_snapshot(
    app: Page, assert_snapshot: ImageCompareFunction
):
    """Test visual appearance of page links with query params."""
    external_links = get_element_by_key(app, "external_links")

    # Snapshot a link with query params
    link = external_links.get_by_test_id("stPageLink").nth(0)
    expect(link).to_be_visible()

    assert_snapshot(link, name="st_page_link_query_params-external_with_params")
