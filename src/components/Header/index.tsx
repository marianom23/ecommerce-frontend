"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { logoutClient } from "@/lib/logoutClient";
import CustomSelect, { type SelectOption } from "./CustomSelect";
import { Search, ChevronDown, Instagram } from "lucide-react";
import { productService } from "@/services/productService";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import type { CategoryFacet } from "@/types/facets";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { selectTotalPrice, selectItemsCount } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import MobileSidebar from "../Common/MobileSidebar";

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [brandFacets, setBrandFacets] = useState<CategoryFacet[]>([]);
  const [consoleFacets, setConsoleFacets] = useState<CategoryFacet[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("0"); // "0" = Todas
  const [catOptions, setCatOptions] = useState<SelectOption[]>([
    { label: "Categorías", value: "0" },
  ]);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isSearchCatOpen, setIsSearchCatOpen] = useState(false);
  const [cartAttention, setCartAttention] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("categoryId") || "0";
    setSearchQuery(q);
    setSelectedCategory(cat);
  }, [searchParams]);

  const { openCartModal } = useCartModalContext();
  const totalPrice = useSelector(selectTotalPrice);
  const totalItems = useSelector(selectItemsCount);

  const handleOpenCartModal = () => openCartModal();

  useEffect(() => {
    const handleCartAttention = () => {
      setCartAttention(false);
      window.requestAnimationFrame(() => setCartAttention(true));
      window.setTimeout(() => setCartAttention(false), 560);
    };

    window.addEventListener("cart:attention", handleCartAttention);
    return () => window.removeEventListener("cart:attention", handleCartAttention);
  }, []);

  const computedMenu = useMemo(() => {
    return menuData;
  }, []);

  // Sticky menu
  useEffect(() => {
    const handleSticky = () => setStickyMenu(window.scrollY >= 80);
    window.addEventListener("scroll", handleSticky);
    handleSticky();
    return () => window.removeEventListener("scroll", handleSticky);
  }, []);


  // Cargar (facets)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setBrandsLoading(true);
        const facets = await productService.getFacets({}); // sin filtros → todas
        const mapped: SelectOption[] = [
          { label: "Categorías", value: "0" },
          ...(facets?.categoryFacets ?? []).map((c: any) => ({
            label: c.name,
            value: String(c.id),
          })),
        ];
        if (!cancelled) {
          setBrandFacets(facets?.brandFacets ?? []);
          setConsoleFacets(facets?.consoleFacets ?? []);
          setCatOptions(mapped)
        }
      } catch {
        if (!cancelled) setCatOptions([{ label: "Categorías", value: "0" }]);
        if (!cancelled) setBrandFacets([]);
      } finally {
        if (!cancelled) setBrandsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-9999 bg-white transition-all ease-in-out duration-300 border-b border-gray-3 ${stickyMenu && "lg:shadow"}`}
      >
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          {/* MOBILE LAYOUT (lg:hidden) */}
          <div className="py-3 lg:hidden">
            {/* Row 1: Menu, Logo, Icons */}
            <div className="grid h-11 grid-cols-[88px_1fr_88px] items-center gap-1">
              {/* Left side - Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                className="flex h-10 w-10 items-center justify-center active:scale-95 transition-transform"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12H21M3 6H21M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Centered Logo */}
              <Link className="flex min-w-0 items-center justify-center" href="/" aria-label="HorneroTech">
                <Image
                  src="/images/logo/logo2.png"
                  alt="Logo"
                  width={150}
                  height={36}
                  priority
                  className="h-auto w-[138px] max-w-full"
                />
              </Link>

              {/* Right Icons */}
              <div className="flex items-center justify-end gap-1 text-dark">
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen((open) => !open)}
                  aria-label="Buscar"
                  aria-expanded={mobileSearchOpen}
                  className="flex h-9 w-9 items-center justify-center active:scale-95 transition-transform"
                >
                  <Search className="h-5.5 w-5.5 text-dark stroke-[1.9]" />
                </button>

                <button onClick={handleOpenCartModal} className={`relative flex h-9 w-9 items-center justify-center active:scale-95 transition-transform ${cartAttention ? "animate-cart-pop" : ""}`} aria-label="Carrito">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.5433 9.5172C15.829 9.21725 15.8174 8.74252 15.5174 8.45686C15.2175 8.17119 14.7428 8.18277 14.4571 8.48272L12.1431 10.9125L11.5433 10.2827C11.2576 9.98277 10.7829 9.97119 10.483 10.2569C10.183 10.5425 10.1714 11.0173 10.4571 11.3172L11.6 12.5172C11.7415 12.6658 11.9378 12.75 12.1431 12.75C12.3483 12.75 12.5446 12.6658 12.6862 12.5172L15.5433 9.5172Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L21.3935 10.0295L21.3925 10.0341L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25L10.8804 16.25C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996L5.70828 9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591L19.9229 9.73369C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C20.1367 7.15259 20.0931 7.11565 19.9661 7.07101C19.8107 7.01639 19.5895 6.97049 19.2939 6.93745C18.6991 6.87096 17.9454 6.86996 17.089 6.86996H5.70828Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0857 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0857 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 17.2501C15.2574 17.2501 14.25 18.2574 14.25 19.5001ZM16.5 20.2501C16.0858 20.2501 15.75 19.9143 15.75 19.5001C15.75 19.0859 16.0858 18.7501 16.5 18.7501C16.9142 18.7501 17.25 19.0859 17.25 19.5001C17.25 19.9143 16.9142 20.2501 16.5 20.2501Z"
                      fill="currentColor"
                    />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue text-white text-xs font-bold">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Row 2: Search Bar */}
            <div
              className={`absolute left-0 top-full z-[9998] w-full border-t border-gray-3 bg-white px-4 py-3 shadow-md transition-[opacity,transform] duration-300 ease-out ${
                mobileSearchOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-3 pointer-events-none opacity-0"
              }`}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = new URLSearchParams();
                  if (searchQuery.trim()) params.set("q", searchQuery.trim());
                  if (selectedCategory !== "0") params.set("categoryId", selectedCategory);
                  router.push(`/productos?${params.toString()}`);
                  setMobileSearchOpen(false);
                }}
              >
                <div className="relative flex h-11 w-full items-center gap-1 rounded-full border border-gray-3 bg-white px-3 text-sm text-dark shadow-sm">
                  {/* Dropdown de categorías móvile */}
                  <div className="relative flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSearchCatOpen(!isSearchCatOpen)}
                      className="flex items-center gap-1 font-medium whitespace-nowrap pr-2 hover:text-blue transition-colors"
                    >
                      <span className="max-w-[86px] truncate text-sm">
                        {catOptions.find(c => c.value === selectedCategory)?.label || "Categorías"}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isSearchCatOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isSearchCatOpen && (
                      <ul className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-3 rounded-lg shadow-md py-1 z-9999 text-sm overflow-y-auto max-h-60">
                        {catOptions.map((cat) => (
                          <li key={cat.value}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(String(cat.value));
                                setIsSearchCatOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-1 transition-colors text-dark"
                            >
                              {cat.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="w-px h-4 bg-gray-3 shrink-0" />

                  <input
                    onChange={(e) => setSearchQuery(e.target.value)}
                    value={searchQuery}
                    type="search"
                    placeholder="Buscar productos..."
                    className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-dark min-w-0 px-2 text-sm"
                  />

                  <button
                    type="submit"
                    aria-label="Buscar"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-dark hover:text-blue transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* DESKTOP LAYOUT (hidden lg:flex) */}
          <div
            className={`hidden lg:flex flex-row items-center justify-between gap-5 xl:justify-between ease-out duration-200 ${stickyMenu ? "py-3" : "py-4"}`}
          >
            {/* left */}
            <div className="flex flex-1 flex-row items-center gap-5 lg:gap-6 min-w-0 text-dark">
              <Link className="flex-shrink-0" href="/">
                <Image
                  src="/images/logo/logo2.png"
                  alt="Logo"
                  width={160}
                  height={35}
                  className="h-auto w-auto max-h-[35px]"
                />
              </Link>

              {/* buscador desktop */}
              <div className="flex-1 min-w-0 flex justify-start">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const params = new URLSearchParams();
                    if (searchQuery.trim()) params.set("q", searchQuery.trim());
                    if (selectedCategory !== "0") params.set("categoryId", selectedCategory);
                    router.push(`/productos?${params.toString()}`);
                  }}
                  className="w-full max-w-2xl"
                >
                  <div className="flex items-center w-full h-9 rounded-full border border-gray-3 bg-white shadow-sm px-3 gap-1 text-sm text-dark relative">
                    {/* Dropdown de categorías */}
                    <div className="relative flex items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsSearchCatOpen(!isSearchCatOpen)}
                        className="flex items-center gap-1 font-medium whitespace-nowrap pr-2 hover:text-blue transition-colors"
                      >
                        {catOptions.find(c => c.value === selectedCategory)?.label || "Categorías"}
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isSearchCatOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isSearchCatOpen && (
                        <ul className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-3 rounded-lg shadow-md py-1 z-50 text-sm overflow-y-auto max-h-60">
                          {catOptions.map((cat) => (
                            <li key={cat.value}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(String(cat.value));
                                  setIsSearchCatOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-gray-1 transition-colors text-dark"
                              >
                                {cat.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Divisor */}
                    <div className="w-px h-4 bg-gray-3 shrink-0" />

                    {/* Input */}
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-dark min-w-0 px-2"
                    />

                    {/* Ícono de búsqueda */}
                    <button
                      type="submit"
                      aria-label="Buscar"
                      className="shrink-0 text-gray-400 hover:text-blue transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* <!-- header top right --> */}
            <div className={`flex w-auto flex-shrink-0 items-center ${isAuthenticated ? "gap-4.5" : "gap-4"} transition-all duration-200`}
            >
              <a href="https://www.instagram.com/hornero_tech/" target="_blank" rel="noopener noreferrer" className="hidden xl:flex items-center gap-3.5 flex-shrink-0 group cursor-pointer">
                <Instagram className="w-7 h-7 text-[#E1306C] group-hover:scale-110 transition-transform" />
                <div>
                  <span className="block text-2xs text-dark-4 uppercase group-hover:text-[#E1306C] transition-colors">
                    SEGUINOS EN
                  </span>
                  <p className="font-medium text-custom-sm text-dark group-hover:text-[#E1306C] transition-colors">
                    Instagram
                  </p>
                </div>
              </a>

              {/* divider */}
              <span className="hidden xl:block w-px h-7.5 bg-gray-4"></span>

              {/* cuenta + carrito */}
              <div className="flex w-full lg:w-auto justify-between items-center gap-5">
                <div className="flex items-center gap-5">
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2.5">
                      <Link
                        href="/mi-cuenta"
                        aria-label="Ir a Mi Cuenta"
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <div>
                          <span className="block text-2xs text-dark-4 uppercase">Mi Cuenta</span>
                          <p className="font-medium text-custom-sm text-dark">
                            {user?.firstName ?? user?.name ?? user?.email ?? "Usuario"}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/signin" className="flex items-center gap-2.5">
                      <div>
                        <span className="block text-2xs text-dark-4 uppercase">
                          Mi Cuenta
                        </span>
                        <p className="font-medium text-custom-sm text-dark">Ingresar</p>
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={handleOpenCartModal}
                    className={`flex items-center gap-2.5 transition-transform ${cartAttention ? "animate-cart-pop" : ""}`}
                  >
                    <span className="inline-block relative">
                      {/* icono carrito */}
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.5433 9.5172C15.829 9.21725 15.8174 8.74252 15.5174 8.45686C15.2175 8.17119 14.7428 8.18277 14.4571 8.48272L12.1431 10.9125L11.5433 10.2827C11.2576 9.98277 10.7829 9.97119 10.483 10.2569C10.183 10.5425 10.1714 11.0173 10.4571 11.3172L11.6 12.5172C11.7415 12.6658 11.9378 12.75 12.1431 12.75C12.3483 12.75 12.5446 12.6658 12.6862 12.5172L15.5433 9.5172Z"
                          fill="#3C50E0"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L21.3935 10.0295L21.3925 10.0341L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25L10.8804 16.25C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996L5.70828 9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591L19.9229 9.73369C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C20.1367 7.15259 20.0931 7.11565 19.9661 7.07101C19.8107 7.01639 19.5895 6.97049 19.2939 6.93745C18.6991 6.87096 17.9454 6.86996 17.089 6.86996H5.70828Z"
                          fill="#3C50E0"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0857 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0857 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z"
                          fill="#3C50E0"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 17.2501C15.2574 17.2501 14.25 18.2574 14.25 19.5001ZM16.5 20.2501C16.0858 20.2501 15.75 19.9143 15.75 19.5001C15.75 19.0859 16.0858 18.7501 16.5 18.7501C16.9142 18.7501 17.25 19.0859 17.25 19.5001C17.25 19.9143 16.9142 20.2501 16.5 20.2501Z"
                          fill="#3C50E0"
                        />
                      </svg>

                      <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-blue w-4.5 h-4.5 rounded-full text-white">
                        {totalItems}
                      </span>
                    </span>

                    <div>
                      <span className="block text-2xs text-dark-4 uppercase">Carrito</span>
                      <p className="font-medium text-custom-sm text-dark">${totalPrice}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* header top end */}
        </div>

        <div className="border-t border-gray-3">
          <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
            <div className="flex items-center justify-between">
              {/* Main Nav */}
              <div
                className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center justify-between ${navigationOpen && `!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5`
                  }`}
              >
                <nav>
                  <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                    {computedMenu.map((menuItem, i) =>
                      menuItem.submenu ? (
                        <Dropdown key={i} menuItem={menuItem} stickyMenu={stickyMenu} />
                      ) : (
                        <li
                          key={i}
                          className="group relative before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full "
                        >
                          <Link
                            href={menuItem.path}
                            className={`hover:text-blue text-custom-sm font-medium text-dark flex ${stickyMenu ? "xl:py-4" : "xl:py-6"
                              }`}
                          >
                            {menuItem.title}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
              </div>

              {/* Right nav */}
              <div className="hidden xl:block">
                <ul className="flex items-center gap-5.5">
                  <li className="py-4">
                    {/* <a href="#" className="flex items-center gap-1.5 font-medium text-custom-sm text-dark hover:text-blue">
                    <svg
                      className="fill-current"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.45313 7.55556H1.70313V7.55556L2.45313 7.55556ZM2.45313 8.66667L1.92488 9.19908C2.21729 9.4892 2.68896 9.4892 2.98137 9.19908L2.45313 8.66667ZM4.10124 8.08797C4.39528 7.79623 4.39715 7.32135 4.10541 7.02731C3.81367 6.73327 3.3388 6.73141 3.04476 7.02315L4.10124 8.08797ZM1.86149 7.02315C1.56745 6.73141 1.09258 6.73327 0.800843 7.02731C0.509102 7.32135 0.510968 7.79623 0.805009 8.08797L1.86149 7.02315ZM12.1973 5.05946C12.4143 5.41232 12.8762 5.52252 13.229 5.30558C13.5819 5.08865 13.6921 4.62674 13.4752 4.27388L12.1973 5.05946ZM8.0525 1.25C4.5514 1.25 1.70313 4.06755 1.70313 7.55556H3.20313C3.20313 4.90706 5.3687 2.75 8.0525 2.75V1.25ZM1.70313 7.55556L1.70313 8.66667L3.20313 8.66667L3.20313 7.55556L1.70313 7.55556ZM2.98137 9.19908L4.10124 8.08797L3.04476 7.02315L1.92488 8.13426L2.98137 9.19908ZM2.98137 8.13426L1.86149 7.02315L0.805009 8.08797L1.92488 9.19908L2.98137 8.13426ZM13.4752 4.27388C12.3603 2.46049 10.3479 1.25 8.0525 1.25V2.75C9.80904 2.75 11.346 3.67466 12.1973 5.05946L13.4752 4.27388Z"
                        fill=""
                      />
                      <path
                        d="M13.5427 7.33337L14.0699 6.79996C13.7777 6.51118 13.3076 6.51118 13.0155 6.79996L13.5427 7.33337ZM11.8913 7.91107C11.5967 8.20225 11.5939 8.67711 11.8851 8.97171C12.1763 9.26631 12.6512 9.26908 12.9458 8.9779L11.8913 7.91107ZM14.1396 8.9779C14.4342 9.26908 14.9091 9.26631 15.2003 8.97171C15.4914 8.67711 15.4887 8.20225 15.1941 7.91107L14.1396 8.9779ZM3.75812 10.9395C3.54059 10.587 3.07849 10.4776 2.72599 10.6951C2.3735 10.9127 2.26409 11.3748 2.48163 11.7273L3.75812 10.9395ZM7.9219 14.75C11.4321 14.75 14.2927 11.9352 14.2927 8.44449H12.7927C12.7927 11.0903 10.6202 13.25 7.9219 13.25V14.75ZM14.2927 8.44449V7.33337H12.7927V8.44449H14.2927ZM13.0155 6.79996L11.8913 7.91107L12.9458 8.9779L14.0699 7.86679L13.0155 6.79996ZM13.0155 7.86679L14.1396 8.9779L15.1941 7.91107L14.0699 6.79996L13.0155 7.86679ZM2.48163 11.7273C3.60082 13.5408 5.62007 14.75 7.9219 14.75V13.25C6.15627 13.25 4.61261 12.3241 3.75812 10.9395L2.48163 11.7273Z"
                        fill=""
                      />
                    </svg>
                    Visto Recientemente
                  </a> */}
                  </li>
                  <li className="py-4">
                    <Link href="/wishlist" className="flex items-center gap-1.5 font-medium text-custom-sm text-dark hover:text-blue">
                      <svg
                        className="fill-current"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.97441 12.6073L6.43872 12.0183L5.97441 12.6073ZM7.99992 3.66709L7.45955 4.18719C7.60094 4.33408 7.79604 4.41709 7.99992 4.41709C8.2038 4.41709 8.3989 4.33408 8.54028 4.18719L7.99992 3.66709ZM10.0254 12.6073L10.4897 13.1962L10.0254 12.6073ZM6.43872 12.0183C5.41345 11.21 4.33627 10.4524 3.47904 9.48717C2.64752 8.55085 2.08325 7.47831 2.08325 6.0914H0.583252C0.583252 7.94644 1.3588 9.35867 2.35747 10.4832C3.33043 11.5788 4.57383 12.4582 5.51009 13.1962L6.43872 12.0183ZM2.08325 6.0914C2.08325 4.75102 2.84027 3.63995 3.85342 3.17683C4.81929 2.73533 6.15155 2.82823 7.45955 4.18719L8.54028 3.14699C6.84839 1.38917 4.84732 1.07324 3.22983 1.8126C1.65962 2.53035 0.583252 4.18982 0.583252 6.0914H2.08325ZM5.51009 13.1962C5.84928 13.4636 6.22932 13.7618 6.61834 13.9891C7.00711 14.2163 7.47619 14.4167 7.99992 14.4167V12.9167C7.85698 12.9167 7.65939 12.8601 7.37512 12.694C7.0911 12.5281 6.79171 12.2965 6.43872 12.0183L5.51009 13.1962ZM10.4897 13.1962C11.426 12.4582 12.6694 11.5788 13.6424 10.4832C14.641 9.35867 15.4166 7.94644 15.4166 6.0914H13.9166C13.9166 7.47831 13.3523 8.55085 12.5208 9.48717C11.6636 10.4524 10.5864 11.21 9.56112 12.0183L10.4897 13.1962ZM15.4166 6.0914C15.4166 4.18982 14.3402 2.53035 12.77 1.8126C11.1525 1.07324 9.15145 1.38917 7.45955 3.14699L8.54028 4.18719C9.84828 2.82823 11.1805 2.73533 12.1464 3.17683C13.1596 3.63995 13.9166 4.75102 13.9166 6.0914H15.4166ZM9.56112 12.0183C9.20813 12.2965 8.90874 12.5281 8.62471 12.694C8.34044 12.8601 8.14285 12.9167 7.99992 12.9167V14.4167C8.52365 14.4167 8.99273 14.2163 9.3815 13.9891C9.77052 13.7618 10.1506 13.4636 10.4897 13.1962L9.56112 12.0183Z"
                          fill=""
                        />
                      </svg>
                      Lista de Deseos
                    </Link>
                  </li>
                </ul>
              </div>
              {/* Right nav end */}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
    </>
  );
};

export default Header;
