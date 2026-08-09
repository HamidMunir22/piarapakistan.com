import api from "./client";

export const fetchCategories = () => api.get("/categories").then((res) => res.data.categories);

export const fetchListings = (params) => api.get("/listings", { params }).then((res) => res.data);

export const fetchListingById = (id) => api.get(`/listings/${id}`).then((res) => res.data.listing);

export const fetchMyListings = () => api.get("/listings/mine").then((res) => res.data.listings);

export const createListing = (formData) =>
  api
    .post("/listings", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);

export const updateListing = (id, formData) =>
  api
    .put(`/listings/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((res) => res.data);

export const deleteListing = (id) => api.delete(`/listings/${id}`).then((res) => res.data);
