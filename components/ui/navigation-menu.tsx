"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cn } from "@/lib/utils";

export function NavigationMenu({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root className={cn("relative", className)} {...props}>
      {children}
    </NavigationMenuPrimitive.Root>
  );
}

export function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return <NavigationMenuPrimitive.List className={cn("flex list-none flex-col gap-1", className)} {...props} />;
}

export function NavigationMenuItem(props: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item {...props} />;
}

export function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      className={cn(
        "inline-flex w-fit rounded-md px-0 py-1 text-[0.98rem] leading-6 text-neutral-700 transition-colors hover:text-neutral-950 data-[active]:font-medium data-[active]:text-neutral-950",
        className,
      )}
      {...props}
    />
  );
}
