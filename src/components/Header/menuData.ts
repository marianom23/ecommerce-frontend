import { Menu } from "@/types/Menu";

// menuData: ids únicos y títulos capitalizados
export const menuData: Menu[] = [
  { id: 1, title: "Popular", newTab: false, path: "/" },
  { id: 2, title: "Productos", newTab: false, path: "/productos" },
  { id: 4, title: "Marcas", newTab: false, path: "/" },
  {
    id: 6, title: "Pages", newTab: false, path: "/",
    submenu: [
      { id: 61, title: "Shop With Sidebar", newTab: false, path: "/productos" },
      { id: 62, title: "Shop Without Sidebar", newTab: false, path: "/shop-without-sidebar" },
      { id: 64, title: "Checkout", newTab: false, path: "/checkout" },
      { id: 65, title: "Cart", newTab: false, path: "/cart" },
      { id: 66, title: "Wishlist", newTab: false, path: "/wishlist" },
      { id: 67, title: "Sign in", newTab: false, path: "/signin" },
      { id: 68, title: "Sign up", newTab: false, path: "/signup" },
      { id: 69, title: "My Account", newTab: false, path: "/mi-cuenta" },
      { id: 70, title: "Contact", newTab: false, path: "/contact" },
      { id: 71, title: "Error", newTab: false, path: "/error" },
      { id: 72, title: "Mail Success", newTab: false, path: "/mail-success" },
    ],
  },
  // {
  //   id: 7, title: "Blogs", newTab: false, path: "/",
  //   submenu: [
  //     { id: 73, title: "Blog Grid with sidebar", newTab: false, path: "/blogs/blog-grid-with-sidebar" },
  //     { id: 74, title: "Blog Grid", newTab: false, path: "/blogs/blog-grid" },
  //     { id: 75, title: "Blog details with sidebar", newTab: false, path: "/blogs/blog-details-with-sidebar" },
  //     { id: 76, title: "Blog details", newTab: false, path: "/blogs/blog-details" },
  //   ],
  // },
];

