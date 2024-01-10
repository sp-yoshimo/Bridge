"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true)
    }, []);

    if (!isMounted) {
        return null
    }

    return (
        <>
            {theme === "light" ? (
                <Button
                    size={"icon"}
                    variant={"outline"}
                    onClick={() => setTheme("dark")}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] " />
                </Button>
            ) : (
                <Button
                    size={"icon"}
                    variant={"outline"}
                    onClick={() => setTheme("light")}
                >
                    <Moon className="absolute h-[1.2rem] w-[1.2rem]" />
                </Button>
            )}
        </>

    )
}
