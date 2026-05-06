"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Boxes, Gamepad2, Heart, HelpCircle, Instagram, MessageCircle, Monitor, Sparkles, User } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

type MobileSidebarProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onOpenChange }) => {
    const menuItems = [
        { label: "Destacados", href: "/#destacados", icon: Sparkles },
        { label: "Productos", href: "/productos", icon: Boxes },
        { label: "Switch", href: "/productos?consoleId=1", icon: Gamepad2 },
        { label: "Switch 2", href: "/productos?consoleId=2", icon: Monitor },
        { label: "Consolas Retro", href: "/productos?categoryId=6&page=1&sort=0", icon: Gamepad2 },
        { label: "Como Funciona", href: "/como-funciona", icon: HelpCircle },
        { label: "Preguntas frecuentes", href: "/faq", icon: HelpCircle },
        { label: "Mi Cuenta", href: "/mi-cuenta", icon: User },
        { label: "Lista de Deseos", href: "/wishlist", icon: Heart },
        { label: "Contacto", href: "/contact", icon: MessageCircle },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[86vw] max-w-[360px] bg-white p-0">
                <div className="flex h-full flex-col">
                    <SheetHeader className="border-b border-gray-3 px-5 py-5">
                        <SheetTitle className="text-left">
                            <Link href="/" onClick={() => onOpenChange(false)} className="inline-flex items-center">
                                <Image
                                    src="/images/logo/logo2.png"
                                    alt="HorneroTech"
                                    width={170}
                                    height={42}
                                    priority
                                    className="h-auto w-[165px] max-w-[68vw]"
                                />
                            </Link>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => onOpenChange(false)}
                                            className="flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-base font-medium text-dark transition-colors hover:bg-gray-1 hover:text-blue"
                                        >
                                            <Icon className="h-5 w-5 text-blue" />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>

                        <a
                            href="https://www.instagram.com/hornero_tech/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-3.5 text-base font-medium text-dark transition-colors hover:bg-gray-1"
                        >
                            <Instagram className="h-5 w-5 text-[#E1306C]" />
                            Instagram
                        </a>
                    </nav>

                    <div className="border-t border-gray-3 px-5 py-5">
                        <div className="mb-3 flex items-center gap-3">
                            <MessageCircle className="h-5 w-5 text-blue" />
                            <div>
                                <p className="text-xs uppercase text-dark-4">Soporte 24/7</p>
                                <p className="text-sm font-medium text-dark">(+54) 261 4689151</p>
                            </div>
                        </div>
                        <a
                            href="https://wa.me/5492614689151"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full rounded-xl bg-[#25D366] py-3 text-center font-medium text-white transition-colors hover:bg-[#20BA5A]"
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MobileSidebar;
