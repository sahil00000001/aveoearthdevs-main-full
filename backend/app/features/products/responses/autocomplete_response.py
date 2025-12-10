from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from uuid import UUID


class AutocompleteItemResponse(BaseModel):
    type: str
    value: str
    label: str
    category: Optional[str] = None
    product_count: Optional[int] = None


class AutocompleteResponse(BaseModel):
    suggestions: List[AutocompleteItemResponse]
    query: str
    total_results: int


class SearchSuggestionResponse(BaseModel):
    suggestions: List[str]
    query: str


class SavedSearchResponse(BaseModel):
    id: UUID
    name: str
    search_params: Dict[str, Any]
    alert_enabled: bool
    created_at: str
    results_count: Optional[int] = None


class SearchHistoryResponse(BaseModel):
    id: UUID
    query: str
    search_params: Dict[str, Any]
    results_count: int
    searched_at: str


class FacetValueResponse(BaseModel):
    value: str
    label: str
    count: int
    selected: bool = False


class FacetResponse(BaseModel):
    name: str
    label: str
    type: str
    values: List[FacetValueResponse]


class FacetedSearchResponse(BaseModel):
    products: List[Dict[str, Any]]
    facets: List[FacetResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
    applied_filters: Dict[str, Any]
