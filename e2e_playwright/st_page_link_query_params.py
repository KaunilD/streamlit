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

"""E2E test app for st.page_link with query_params parameter."""

import streamlit as st

st.title("Query Params Test")

# Display current query params
st.write("Current Query Params:", dict(st.query_params))

# Test 1: External links with query params
with st.container(key="external_links"):
    st.subheader("External Links")

    st.page_link(
        "https://www.example.com/search",
        label="Search with params",
        query_params={"q": "streamlit", "type": "docs"},
        key="external_with_params",
    )

    st.page_link(
        "https://www.example.com",
        label="No params",
        key="external_without_params",
    )

    # Test with multiple query params
    st.page_link(
        "https://www.github.com",
        label="Multiple params",
        query_params={"tab": "repositories", "sort": "stars", "direction": "desc"},
        key="external_multiple_params",
    )

# Test 2: Empty and None query params
with st.container(key="empty_params"):
    st.subheader("Empty/None Params")

    st.page_link(
        "https://www.example.com",
        label="Empty dict",
        query_params={},
        key="empty_dict",
    )

    st.page_link(
        "https://www.example.com",
        label="None params",
        query_params=None,
        key="none_params",
    )

# Test 3: Query params with special characters
with st.container(key="special_chars"):
    st.subheader("Special Characters")

    st.page_link(
        "https://www.example.com",
        label="Special chars in values",
        query_params={"name": "John Doe", "email": "test@example.com"},
        key="special_chars_params",
    )

# Test 4: Disabled link with query params
with st.container(key="disabled_link"):
    st.subheader("Disabled Link")

    st.page_link(
        "https://www.example.com",
        label="Disabled with params",
        query_params={"test": "disabled"},
        disabled=True,
        key="disabled_with_params",
    )

# Test 5: Query params with icons and help
with st.container(key="with_icons_help"):
    st.subheader("With Icons and Help")

    st.page_link(
        "https://www.example.com",
        label="Icon and params",
        icon="🔍",
        query_params={"search": "test"},
        help="This link has query params",
        key="icon_help_params",
    )

# Test 6: Width variations with query params
with st.container(key="width_variations"):
    st.subheader("Width Variations")

    st.page_link(
        "https://www.example.com",
        label="Content width",
        query_params={"width": "content"},
        width="content",
        key="width_content",
    )

    st.page_link(
        "https://www.example.com",
        label="Stretch width",
        query_params={"width": "stretch"},
        width="stretch",
        key="width_stretch",
    )
